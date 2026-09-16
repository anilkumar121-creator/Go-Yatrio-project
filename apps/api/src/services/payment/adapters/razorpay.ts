import Razorpay from "razorpay";
import { PaymentGatewayAdapter } from "./payment-gateway.interface.js";
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
}
