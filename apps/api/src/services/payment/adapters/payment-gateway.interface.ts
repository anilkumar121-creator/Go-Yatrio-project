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
}
