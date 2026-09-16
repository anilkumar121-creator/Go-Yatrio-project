import crypto from "crypto";
import Razorpay from "razorpay";
import { PaymentGatewayAdapter, NormalizedGatewayEvent } from "./payment-gateway.interface.js";
import { AppError } from "../../../utils/app-error.js";

export class RazorpayAdapter implements PaymentGatewayAdapter {
  private razorpay: Razorpay;

  constructor(keyId: string, keySecret: string) {
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials are not fully configured.");
    }
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(amount: number, currency: string, receipt: string) {
    try {
      const order = await this.razorpay.orders.create({
        amount, // This should already be in paise
        currency,
        receipt,
      });

      return {
        providerOrderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      };
    } catch {
      throw new AppError(`Failed to create payment order on the provider.`, 502);
    }
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

      return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  parseWebhookEvent(payload: string): NormalizedGatewayEvent {
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return { eventType: "unknown", providerOrderId: "" };
    }

    const eventObj = parsed as Record<string, unknown>;
    const event = eventObj?.event;
    if (event === "order.paid") {
      const payload = eventObj?.payload as Record<string, unknown>;
      const payment = payload?.payment as Record<string, unknown>;
      const paymentEntity = payment?.entity as Record<string, unknown>;
      return {
        eventType: "payment.success",
        providerOrderId: (paymentEntity?.order_id as string) || "",
        providerPaymentId: paymentEntity?.id as string,
        amount: paymentEntity?.amount ? Number(paymentEntity.amount) : undefined,
        currency: paymentEntity?.currency as string,
      };
    }

    if (event === "payment.failed") {
      const payload = eventObj?.payload as Record<string, unknown>;
      const payment = payload?.payment as Record<string, unknown>;
      const paymentEntity = payment?.entity as Record<string, unknown>;
      return {
        eventType: "payment.failed",
        providerOrderId: (paymentEntity?.order_id as string) || "",
        providerPaymentId: paymentEntity?.id as string,
        failureReason: (paymentEntity?.error_description as string) || "Payment failed",
      };
    }

    return {
      eventType: "unknown",
      providerOrderId: "",
    };
  }
}
