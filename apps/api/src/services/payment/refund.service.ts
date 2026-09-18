import { Prisma } from "@prisma/client";
import { prisma } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { PaymentGatewayAdapter } from "./adapters/payment-gateway.interface.js";
import { RazorpayAdapter } from "./adapters/razorpay.js";

const getGatewayAdapter = (): PaymentGatewayAdapter => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return new RazorpayAdapter(keyId, keySecret);
};

export class RefundService {
  private adapter: PaymentGatewayAdapter;

  constructor() {
    this.adapter = getGatewayAdapter();
  }

  /**
   * Automatically initiates a 100% refund for a late successful payment
   * that arrived after the booking was cancelled.
   */
  async initiateLatePaymentRefund(paymentId: string) {
    let refundRecordId: string;
    let providerPaymentId: string;
    let refundAmountInt: number = 0;
    let idempotencyKey: string;
    let targetCurrency: string = "";

    await prisma.$transaction(async (tx) => {
      // 1. Lock the Payment row
      const lockedPayments = await tx.$queryRaw<{ id: string; bookingId: string }[]>`
        SELECT id, "bookingId" FROM "payments" WHERE "id" = ${paymentId} FOR UPDATE
      `;
      if (lockedPayments.length === 0) {
        throw new AppError("Payment not found", 404);
      }

      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { booking: true },
      });

      if (!payment || !payment.booking) {
        throw new AppError("Payment or booking not found", 404);
      }

      // 2. Lock Booking to prevent concurrency races with cancellation logic
      await tx.$executeRaw`SELECT id FROM "bookings" WHERE id = ${payment.bookingId} FOR UPDATE`;

      const booking = payment.booking;

      if (booking.status !== "CANCELLED") {
        throw new AppError("Late payment refund only applies to CANCELLED bookings", 400);
      }

      if (payment.status !== "SUCCESS") {
        throw new AppError("Target payment is not SUCCESS", 400);
      }

      if (!payment.gatewayTransactionId) {
        throw new AppError("Target payment lacks a provider transaction ID", 400);
      }

      idempotencyKey = `LATE_REF_${payment.id}`;

      // 3. Provider Reconciliation & Idempotency Check
      const existingRefund = await tx.refund.findUnique({
        where: { idempotencyKey },
      });

      if (existingRefund) {
        if (existingRefund.status === "PROCESSED") {
          throw new AppError("Late payment refund already processed", 400);
        }
        if (existingRefund.status === "PENDING" || existingRefund.status === "PROCESSING") {
          if (!existingRefund.providerRefundId) {
            // Provider reconciliation limitation: If the SDK/API does not expose fetchRefundsByReceipt cleanly,
            // we must stop and wait for webhooks or manual reconciliation.
            throw new AppError(
              "Refund in progress but provider status unknown. Reconciliation required.",
              409,
            );
          }
          throw new AppError("Refund currently processing", 409);
        }
        throw new AppError("Previous refund attempt failed. Manual intervention required.", 409);
      }

      const amountToRefund = new Prisma.Decimal(payment.amount);
      if (amountToRefund.lte(0)) {
        throw new AppError("Refund amount must be greater than 0", 400);
      }

      // Exact Decimal to integer paise conversion
      refundAmountInt = amountToRefund.mul(100).floor().toNumber();
      providerPaymentId = payment.gatewayTransactionId;
      targetCurrency = payment.currency;

      // 4. Create Refund ledger record
      const newRefund = await tx.refund.create({
        data: {
          bookingId: booking.id,
          paymentId: payment.id,
          amount: amountToRefund,
          currency: payment.currency,
          status: "PROCESSING",
          idempotencyKey,
        },
      });
      refundRecordId = newRefund.id;
    });

    // 5. EXTERNAL CALL - outside of the database transaction lock
    try {
      const gatewayResponse = await this.adapter.refundPayment(
        providerPaymentId!,
        refundAmountInt!,
        idempotencyKey!,
      );

      let finalStatus: "PROCESSING" | "PROCESSED" = "PROCESSING";

      if (gatewayResponse.status === "processed") {
        if (!gatewayResponse.providerRefundId) {
          console.error("Gateway reported processed but returned no refund ID");
          throw new AppError(
            "Gateway response ambiguous: missing refund ID. Reconciliation required.",
            502,
          );
        }
        if (gatewayResponse.amount !== refundAmountInt) {
          console.error(
            `Gateway refund amount mismatch. Expected ${refundAmountInt}, got ${gatewayResponse.amount}`,
          );
          throw new AppError(
            "Gateway response ambiguous: amount mismatch. Reconciliation required.",
            502,
          );
        }
        if ((gatewayResponse.currency || "").toUpperCase() !== targetCurrency.toUpperCase()) {
          console.error(
            `Gateway refund currency mismatch. Expected ${targetCurrency}, got ${gatewayResponse.currency}`,
          );
          throw new AppError(
            "Gateway response ambiguous: currency mismatch. Reconciliation required.",
            502,
          );
        }
        finalStatus = "PROCESSED";
      }

      // 6. Update Refund ledger
      await prisma.refund.update({
        where: { id: refundRecordId! },
        data: {
          providerRefundId: gatewayResponse.providerRefundId,
          providerMetadata: (gatewayResponse.providerMetadata || {}) as Prisma.InputJsonValue,
          status: finalStatus,
        },
      });

      return gatewayResponse;
    } catch (error) {
      if (error instanceof AppError && error.message.includes("ambiguous")) {
        throw error;
      }
      // If external call fails/times out, we do not incorrectly mark as FAILED unless it's a known terminal state.
      // We log and preserve the PROCESSING state for safe reconciliation.
      console.error("Refund gateway error:", error);
      throw new AppError(
        "Refund gateway request failed or timed out. Status remains PROCESSING.",
        502,
      );
    }
  }

  /**
   * Initiates a normal cancellation refund.
   * Calculates safe refundable amount and applies it to a successful payment.
   */
  async initiateCancellationRefund(bookingId: string) {
    let refundRecordId: string;
    let providerPaymentId: string;
    let refundAmountInt: number = 0;
    let idempotencyKey: string;
    let targetCurrency: string = "";

    await prisma.$transaction(async (tx) => {
      // 1. Lock Booking
      const lockedBookings = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "bookings" WHERE "id" = ${bookingId} FOR UPDATE
      `;
      if (lockedBookings.length === 0) {
        throw new AppError("Booking not found", 404);
      }

      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          payments: { where: { status: "SUCCESS" } },
          refunds: { where: { status: { in: ["PENDING", "PROCESSING", "PROCESSED"] } } },
          cancellationRecord: true,
        },
      });

      if (!booking || booking.status !== "CANCELLED" || !booking.cancellationRecord) {
        throw new AppError(
          "Refund only applies to cancelled bookings with a cancellation record",
          400,
        );
      }

      // 2. Refund Amount Safety Calculation
      const grossPaid = booking.payments.reduce(
        (sum, p) => sum.add(new Prisma.Decimal(p.amount)),
        new Prisma.Decimal(0),
      );

      const penalty = new Prisma.Decimal(booking.cancellationRecord.penaltyAmount || 0);

      const existingRefundsSum = booking.refunds.reduce(
        (sum, r) => sum.add(new Prisma.Decimal(r.amount)),
        new Prisma.Decimal(0),
      );

      const legallyRefundable = grossPaid.sub(penalty);
      const currentlyAvailable = legallyRefundable.sub(existingRefundsSum);

      if (currentlyAvailable.lte(0)) {
        throw new AppError("No available amount to refund", 400);
      }

      // 3. Payment Allocation
      if (booking.payments.length === 0) {
        throw new AppError("No successful payments found to refund", 400);
      }
      if (booking.payments.length > 1) {
        // Business rule limitation: If multiple successful payments exist, we fail safely
        // rather than silently guessing FIFO/LIFO.
        throw new AppError(
          "Multiple successful payments exist. Allocation rule must be explicitly configured.",
          400,
        );
      }

      const targetPayment = booking.payments[0];
      if (!targetPayment.gatewayTransactionId) {
        throw new AppError("Target payment lacks a provider transaction ID", 400);
      }

      idempotencyKey = `CANC_REF_${booking.id}_${booking.cancellationRecord.id}`;

      // 4. Provider Reconciliation & Idempotency Check
      const existingRefund = await tx.refund.findUnique({
        where: { idempotencyKey },
      });

      if (existingRefund) {
        if (existingRefund.status === "PROCESSED") {
          throw new AppError("Cancellation refund already processed", 400);
        }
        if (existingRefund.status === "PENDING" || existingRefund.status === "PROCESSING") {
          if (!existingRefund.providerRefundId) {
            throw new AppError(
              "Refund in progress but provider status unknown. Reconciliation required.",
              409,
            );
          }
          throw new AppError("Refund currently processing", 409);
        }
        throw new AppError("Previous refund attempt failed. Manual intervention required.", 409);
      }

      const requestedRefundAmount = currentlyAvailable;

      if (requestedRefundAmount.gt(targetPayment.amount)) {
        throw new AppError(
          "Requested refund exceeds the target payment amount. Multiple refunds required.",
          400,
        );
      }

      // Exact Decimal to integer paise conversion
      refundAmountInt = requestedRefundAmount.mul(100).floor().toNumber();
      providerPaymentId = targetPayment.gatewayTransactionId;
      targetCurrency = targetPayment.currency;

      // 5. Create Refund ledger record
      const newRefund = await tx.refund.create({
        data: {
          bookingId: booking.id,
          paymentId: targetPayment.id,
          amount: requestedRefundAmount,
          currency: targetPayment.currency,
          status: "PROCESSING",
          idempotencyKey,
        },
      });
      refundRecordId = newRefund.id;
    });

    // 6. EXTERNAL CALL - outside of the database transaction lock
    try {
      const gatewayResponse = await this.adapter.refundPayment(
        providerPaymentId!,
        refundAmountInt!,
        idempotencyKey!,
      );

      let finalStatus: "PROCESSING" | "PROCESSED" = "PROCESSING";

      if (gatewayResponse.status === "processed") {
        if (!gatewayResponse.providerRefundId) {
          console.error("Gateway reported processed but returned no refund ID");
          throw new AppError(
            "Gateway response ambiguous: missing refund ID. Reconciliation required.",
            502,
          );
        }
        if (gatewayResponse.amount !== refundAmountInt) {
          console.error(
            `Gateway refund amount mismatch. Expected ${refundAmountInt}, got ${gatewayResponse.amount}`,
          );
          throw new AppError(
            "Gateway response ambiguous: amount mismatch. Reconciliation required.",
            502,
          );
        }
        if ((gatewayResponse.currency || "").toUpperCase() !== targetCurrency.toUpperCase()) {
          console.error(
            `Gateway refund currency mismatch. Expected ${targetCurrency}, got ${gatewayResponse.currency}`,
          );
          throw new AppError(
            "Gateway response ambiguous: currency mismatch. Reconciliation required.",
            502,
          );
        }
        finalStatus = "PROCESSED";
      }

      // 8. Update Refund ledger
      await prisma.refund.update({
        where: { id: refundRecordId! },
        data: {
          providerRefundId: gatewayResponse.providerRefundId,
          providerMetadata: (gatewayResponse.providerMetadata || {}) as Prisma.InputJsonValue,
          status: finalStatus,
        },
      });

      return gatewayResponse;
    } catch (error) {
      if (error instanceof AppError && error.message.includes("ambiguous")) {
        throw error;
      }
      console.error("Refund gateway error:", error);
      throw new AppError(
        "Refund gateway request failed or timed out. Status remains PROCESSING.",
        502,
      );
    }
  }
}
