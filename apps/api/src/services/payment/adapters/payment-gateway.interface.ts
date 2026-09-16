export interface NormalizedGatewayEvent {
  eventType: "payment.success" | "payment.failed" | "unknown";
  providerOrderId: string;
  providerPaymentId?: string;
  amount?: number; // In minor units (paise)
  currency?: string;
  failureReason?: string;
}

export interface PaymentGatewayAdapter {
  /**
   * Creates a payment order on the provider.
   * @param amount The amount in the lowest denomination (e.g., paise for INR).
   * @param currency The 3-letter currency code (e.g., 'INR').
   * @param receipt An internal receipt or reference string.
   */
  createOrder(
    amount: number,
    currency: string,
    receipt: string,
  ): Promise<{
    providerOrderId: string;
    amount: number;
    currency: string;
  }>;

  /**
   * Verifies the cryptographic signature of the incoming webhook.
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;

  /**
   * Parses the raw payload into a NormalizedGatewayEvent.
   */
  parseWebhookEvent(payload: string): NormalizedGatewayEvent;
}
