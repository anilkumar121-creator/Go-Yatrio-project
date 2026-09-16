import { Prisma } from "@prisma/client";
import { prisma } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { NormalizedGatewayEvent } from "./adapters/payment-gateway.interface.js";

export class PaymentVerificationService {
  /**
   * Processes a normalized gateway event idempotently.
   * Returns a safe acknowledgement or throws an appropriate error.
   */
  async processEvent(event: NormalizedGatewayEvent) {
    if (event.eventType === "unknown" || !event.providerOrderId) {
      // Safely ignore unknown events or badly formed events.
      return { status: "ignored", reason: "unknown event or missing order id" };
    }

    return prisma.$transaction(async (tx) => {
      // 1. Re-read the Payment and Booking state atomically with a lock (if applicable) or fresh read
      const payment = await tx.payment.findUnique({
        where: { paymentReference: event.providerOrderId },
        include: { booking: true },
      });

      if (!payment) {
        // Payment not found. Acknowledge to gateway to stop retries, but log it.
        return { status: "ignored", reason: "payment not found" };
      }

      if (payment.gatewayName !== "Razorpay") {
        return { status: "ignored", reason: "gateway mismatch" };
      }

      // Idempotency checks
      if (event.eventType === "payment.success") {
        if (payment.status === "SUCCESS") {
          return { status: "already_processed" };
        }
        if (payment.status === "FAILED") {
          // Do not allow SUCCESS -> FAILED or FAILED -> SUCCESS via late webhooks
          return { status: "ignored", reason: "payment already failed" };
        }

        if (!event.providerPaymentId) {
          throw new AppError("Missing provider payment ID for successful payment", 400);
        }

        // Amount validation
        const eventAmount = new Prisma.Decimal(event.amount ? event.amount / 100 : 0);
        if (!eventAmount.equals(payment.amount)) {
          throw new AppError("Gateway amount mismatch", 400);
        }

        if (event.currency !== payment.currency) {
          throw new AppError("Gateway currency mismatch", 400);
        }

        const booking = payment.booking;
        if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
          return { status: "ignored", reason: "booking is cancelled or completed" };
        }

        // Apply success transition atomically
        const { count } = await tx.payment.updateMany({
          where: {
            id: payment.id,
            status: "PENDING",
          },
          data: {
            status: "SUCCESS",
            gatewayTransactionId: event.providerPaymentId,
            paidAt: new Date(),
          },
        });

        if (count === 0) {
          // If no rows were updated, re-read state to see why
          const freshPayment = await tx.payment.findUnique({ where: { id: payment.id } });
          if (freshPayment?.status === "SUCCESS") {
            return { status: "already_processed" };
          }
          return { status: "ignored", reason: "payment already failed or state changed" };
        }

        // If the booking is PENDING_PAYMENT, transition it to CONFIRMED
        // Use updateMany for atomicity here as well
        if (booking.status === "PENDING_PAYMENT") {
          await tx.booking.updateMany({
            where: {
              id: booking.id,
              status: "PENDING_PAYMENT",
            },
            data: { status: "CONFIRMED" },
          });
        }

        return { status: "success" };
      }

      if (event.eventType === "payment.failed") {
        if (payment.status !== "PENDING") {
          // Do not downgrade a SUCCESS or re-fail a FAILED payment
          return { status: "already_processed" };
        }

        // Apply failure transition atomically
        const { count } = await tx.payment.updateMany({
          where: {
            id: payment.id,
            status: "PENDING",
          },
          data: {
            status: "FAILED",
            gatewayTransactionId: event.providerPaymentId || null,
            failureReason: event.failureReason || "Gateway reported failure",
          },
        });

        if (count === 0) {
          const freshPayment = await tx.payment.findUnique({ where: { id: payment.id } });
          if (freshPayment?.status === "FAILED") {
            return { status: "already_processed" };
          }
          return { status: "ignored", reason: "payment state already changed" };
        }

        return { status: "failed_processed" };
      }

      return { status: "ignored", reason: "unhandled event type" };
    });
  }
}
