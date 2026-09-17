import crypto from "crypto";
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

export class PaymentService {
  private adapter: PaymentGatewayAdapter;

  constructor() {
    this.adapter = getGatewayAdapter();
  }

  async createPaymentIntent(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      throw new AppError(`Cannot initiate payment for a ${booking.status} booking`, 400);
    }

    const successfulPaymentsSum = booking.payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum.add(p.amount), new Prisma.Decimal(0));

    const totalAmount = new Prisma.Decimal(booking.totalAmount);
    const advanceAmount = new Prisma.Decimal(booking.advanceAmount);

    let payableAmount: Prisma.Decimal;

    if (successfulPaymentsSum.gte(totalAmount)) {
      throw new AppError("Booking is already fully paid", 400);
    }

    if (successfulPaymentsSum.gte(advanceAmount)) {
      payableAmount = totalAmount.sub(successfulPaymentsSum);
    } else {
      payableAmount = advanceAmount.sub(successfulPaymentsSum);
    }

    if (payableAmount.lte(0)) {
      throw new AppError("No payment required at this time", 400);
    }

    // Idempotency: reuse existing pending intent
    const existingPending = booking.payments.find(
      (p) =>
        p.status === "PENDING" && p.amount.equals(payableAmount) && p.gatewayName === "Razorpay",
    );

    if (existingPending) {
      return {
        bookingId: booking.id,
        paymentId: existingPending.id,
        providerOrderId: existingPending.paymentReference,
        amount: Number(existingPending.amount),
        currency: existingPending.currency,
        gatewayKey: process.env.RAZORPAY_KEY_ID,
      };
    }

    const internalReceipt = `RCPT_${booking.id.substring(0, 8)}_${crypto.randomBytes(4).toString("hex")}`;
    const amountInPaise = Math.round(payableAmount.mul(100).toNumber());

    const gatewayOrder = await this.adapter.createOrder(
      amountInPaise,
      booking.currency,
      internalReceipt,
    );

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: payableAmount,
        currency: booking.currency,
        status: "PENDING",
        gatewayName: "Razorpay",
        paymentReference: gatewayOrder.providerOrderId,
      },
    });

    return {
      bookingId: booking.id,
      paymentId: payment.id,
      providerOrderId: payment.paymentReference,
      amount: Number(payment.amount),
      currency: payment.currency,
      gatewayKey: process.env.RAZORPAY_KEY_ID,
    };
  }
}
