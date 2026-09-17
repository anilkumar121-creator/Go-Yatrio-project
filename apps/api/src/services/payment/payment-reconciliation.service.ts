import { Prisma } from "@prisma/client";

export type PaymentReconciliationResult = {
  totalAmount: Prisma.Decimal;
  advanceAmount: Prisma.Decimal;
  successfulPaymentsSum: Prisma.Decimal;
  outstandingAmount: Prisma.Decimal;
  isAdvanceSatisfied: boolean;
  isFullyPaid: boolean;
  payableAmount: Prisma.Decimal;
};

export class PaymentReconciliationService {
  /**
   * Reconciles the payment state for a given booking and its payments.
   * Returns authoritative calculations for payable amounts.
   */
  static reconcile(
    booking: {
      totalAmount: Prisma.Decimal | string | number;
      advanceAmount: Prisma.Decimal | string | number;
    },
    payments: { amount: Prisma.Decimal | string | number; status: string }[],
  ): PaymentReconciliationResult {
    const totalAmount = new Prisma.Decimal(booking.totalAmount);
    const advanceAmount = new Prisma.Decimal(booking.advanceAmount);

    const successfulPaymentsSum = payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum.add(new Prisma.Decimal(p.amount)), new Prisma.Decimal(0));

    const outstandingAmount = totalAmount.sub(successfulPaymentsSum);
    const isFullyPaid = successfulPaymentsSum.gte(totalAmount);
    const isAdvanceSatisfied = successfulPaymentsSum.gte(advanceAmount);

    let payableAmount: Prisma.Decimal;

    if (isFullyPaid) {
      payableAmount = new Prisma.Decimal(0);
    } else if (isAdvanceSatisfied) {
      payableAmount = outstandingAmount;
    } else {
      payableAmount = advanceAmount.sub(successfulPaymentsSum);
    }

    if (payableAmount.lt(0)) {
      payableAmount = new Prisma.Decimal(0);
    }

    return {
      totalAmount,
      advanceAmount,
      successfulPaymentsSum,
      outstandingAmount,
      isAdvanceSatisfied,
      isFullyPaid,
      payableAmount,
    };
  }
}
