import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { PaymentGatewayAdapter } from "./adapters/payment-gateway.interface.js";
import { RazorpayAdapter } from "./adapters/razorpay.js";
import { PaymentReconciliationService } from "./payment-reconciliation.service.js";

const getGatewayAdapter = (): PaymentGatewayAdapter => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return new RazorpayAdapter(keyId, keySecret);
};

export class PaymentService {
  private adapter: PaymentGatewayAdapter;

  constructor() {
    this.adapter = getGatewayAdapter();
  }

  async createPaymentIntent(bookingId: string) {
    let paymentId: string;
    let amountToPay: Prisma.Decimal;
    let currency: string;
    let existingProviderOrderId: string | null = null;

    await prisma.$transaction(async (tx) => {
      // 1. Acquire booking-level concurrency protection
      await tx.$executeRaw`SELECT id FROM "Booking" WHERE id = ${bookingId} FOR UPDATE`;

      // 2. Read authoritative booking/payment state
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { payments: true },
      });

      if (!booking) {
        throw new AppError("Booking not found", 404);
      }

      if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
        throw new AppError(`Cannot initiate payment for a ${booking.status} booking`, 400);
      }

      // 3. Reconcile successful payments
      const reconciliation = PaymentReconciliationService.reconcile(booking, booking.payments);

      if (reconciliation.isFullyPaid) {
        throw new AppError("Booking is already fully paid", 400);
      }

      if (reconciliation.payableAmount.lte(0)) {
        throw new AppError("No payment required at this time", 400);
      }

      // 4. Check existing reusable PENDING payment
      const pendingPayments = booking.payments.filter(
        (p) =>
          p.status === "PENDING" &&
          p.gatewayName === "Razorpay" &&
          new Prisma.Decimal(p.amount).equals(reconciliation.payableAmount),
      );

      // Identify if there is a pending payment that is fully ready to be reused
      const existingPendingReady = pendingPayments.find((p) => p.paymentReference !== null);
      if (existingPendingReady) {
        existingProviderOrderId = existingPendingReady.paymentReference;
        paymentId = existingPendingReady.id;
        amountToPay = new Prisma.Decimal(existingPendingReady.amount);
        currency = existingPendingReady.currency;
        return;
      }

      // Identify if there is an in-flight payment intent creation (no paymentReference yet)
      const existingPendingInFlight = pendingPayments.find((p) => p.paymentReference === null);
      if (existingPendingInFlight) {
        const ageMs = Date.now() - existingPendingInFlight.createdAt.getTime();
        if (ageMs < 30000) {
          throw new AppError(
            "A payment is already being initiated. Please try again in a few seconds.",
            409,
          );
        }

        // The marker is stale (>30s old). The previous attempt likely crashed or timed out.
        // Fail it safely so the customer can try again without being permanently blocked.
        await tx.payment.update({
          where: { id: existingPendingInFlight.id },
          data: { status: "FAILED", failureReason: "Intent creation timed out or process crashed" },
        });
      }

      // 5. Create the new gateway order/payment only if required (in-flight marker)
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: reconciliation.payableAmount,
          currency: booking.currency,
          status: "PENDING",
          gatewayName: "Razorpay",
          // paymentReference will be populated after gateway call
        },
      });

      paymentId = payment.id;
      amountToPay = new Prisma.Decimal(payment.amount);
      currency = payment.currency;
    });

    if (existingProviderOrderId) {
      return {
        bookingId: bookingId,
        paymentId: paymentId!,
        providerOrderId: existingProviderOrderId,
        amount: amountToPay!.toNumber(),
        currency: currency!,
        gatewayKey: process.env.RAZORPAY_KEY_ID,
      };
    }

    // Call Gateway outside transaction
    const internalReceipt = `RCPT_${bookingId.substring(0, 8)}_${crypto.randomBytes(4).toString("hex")}`;
    const amountInPaise = amountToPay!.mul(100).toNumber();

    let gatewayOrder;
    try {
      gatewayOrder = await this.adapter.createOrder(amountInPaise, currency!, internalReceipt);
    } catch {
      // Cleanup the in-flight marker if the gateway call fails
      // We must only delete it if it is still PENDING, in case a retry already failed it
      await prisma.payment.deleteMany({
        where: { id: paymentId!, status: "PENDING" },
      });
      throw new AppError("Failed to communicate with payment gateway. Please try again.", 502);
    }

    // Safely update with actual providerOrderId.
    // If a concurrent retry marked this as FAILED due to timeout, count will be 0.
    const updated = await prisma.payment.updateMany({
      where: { id: paymentId!, status: "PENDING" },
      data: { paymentReference: gatewayOrder.providerOrderId },
    });

    if (updated.count === 0) {
      // Marker was failed by a retry. We must not return this orphaned order to the frontend.
      throw new AppError("Payment initiation took too long. Please try again.", 504);
    }

    return {
      bookingId: bookingId,
      paymentId: paymentId!,
      providerOrderId: gatewayOrder.providerOrderId,
      amount: amountToPay!.toNumber(),
      currency: currency!,
      gatewayKey: process.env.RAZORPAY_KEY_ID,
    };
  }
}
