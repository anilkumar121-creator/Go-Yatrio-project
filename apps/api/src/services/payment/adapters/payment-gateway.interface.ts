export interface NormalizedGatewayEvent {
  eventType:
    "payment.success" | "payment.failed" | "refund.processed" | "refund.failed" | "unknown";
  providerOrderId?: string;
  providerPaymentId?: string;
  providerRefundId?: string;
  amount?: number; // In minor units (paise)
  currency?: string;
  failureReason?: string;
  providerPayload?: Record<string, unknown>;
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

  /**
   * Initiates a refund on the provider.
   * @param providerPaymentId The original provider payment ID to refund.
   * @param amount The amount to refund in the lowest denomination (e.g., paise).
   * @param idempotencyKey An internal unique key to prevent duplicate refunds.
   */
  refundPayment(
    providerPaymentId: string,
    amount: number,
    idempotencyKey: string,
  ): Promise<{
    providerRefundId: string;
    amount: number;
    currency: string;
    status: string;
    providerMetadata?: Record<string, unknown>;
  }>;
}
