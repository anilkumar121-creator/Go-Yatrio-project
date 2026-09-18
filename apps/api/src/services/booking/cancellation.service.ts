import { BookingStatus, CancellationReasonType, CancellationSource, Prisma } from "@prisma/client";
import { prisma } from "../../db.js";
import { AppError } from "../../utils/app-error.js";
import { PaymentReconciliationService } from "../payment/payment-reconciliation.service.js";
import { CancellationPolicyService } from "./cancellation-policy.service.js";

export class CancellationService {
  /**
   * Cancels a booking safely using row-level locking.
   * Calculates penalties and refundable amounts via active policies.
   */
  static async cancelBooking(params: {
    bookingId: string;
    cancellationSource: CancellationSource;
    reasonType: CancellationReasonType;
    reasonText?: string;
    cancelledByUserId?: string;
  }) {
    const { bookingId, cancellationSource, reasonType, reasonText, cancelledByUserId } = params;

    return await prisma.$transaction(async (tx) => {
      // 1. Acquire Row Lock
      const lockedBookings = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "bookings" WHERE "id" = ${bookingId} FOR UPDATE
      `;

      if (lockedBookings.length === 0) {
        throw new AppError("Booking not found", 404);
      }

      // 2. Fetch full booking details along with relations
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          cabBooking: true,
          payments: true,
          refunds: {
            where: { status: "PROCESSED" },
          },
        },
      });

      if (!booking) {
        throw new AppError("Booking not found", 404);
      }

      // 3. Validate current state
      if (
        booking.status === BookingStatus.CANCELLED ||
        booking.status === BookingStatus.COMPLETED
      ) {
        throw new AppError(`Booking cannot be cancelled from status: ${booking.status}`, 400);
      }

      // 4. Determine relevant date (e.g., trip start date)
      let relevantDate: Date;
      if (booking.serviceType === "CAB") {
        if (!booking.cabBooking?.pickupDate) {
          throw new AppError("Cab booking pickup date is missing", 500);
        }

        relevantDate = new Date(booking.cabBooking.pickupDate);

        if (booking.cabBooking.pickupTime) {
          const [hours, minutes] = booking.cabBooking.pickupTime.split(":").map(Number);
          if (!isNaN(hours) && !isNaN(minutes)) {
            relevantDate.setUTCHours(hours, minutes, 0, 0);
          }
        }
      } else {
        throw new AppError(
          `Cancellation for service type ${booking.serviceType} is not fully implemented yet`,
          501,
        );
      }

      // 5. Calculate financials
      const reconciliation = PaymentReconciliationService.reconcile(booking, booking.payments);

      const existingRefundsSum = booking.refunds.reduce(
        (sum, refund) => sum.add(new Prisma.Decimal(refund.amount)),
        new Prisma.Decimal(0),
      );

      // 6. Evaluate Policy
      const policyResult = await CancellationPolicyService.evaluatePolicy({
        serviceType: booking.serviceType,
        totalAmount: reconciliation.totalAmount,
        advanceAmount: reconciliation.advanceAmount,
        grossPaid: reconciliation.successfulPaymentsSum,
        existingRefunds: existingRefundsSum,
        relevantDate,
        tx,
      });

      // 7. Create Cancellation Record
      await tx.cancellationRecord.create({
        data: {
          bookingId: booking.id,
          cancellationSource,
          reasonType,
          reasonText,
          cancelledByUserId,
          totalBookingAmount: reconciliation.totalAmount,
          totalPaidAmount: reconciliation.successfulPaymentsSum,
          penaltyAmount: policyResult.penaltyAmount,
          refundableAmount: policyResult.refundableAmount,
          appliedPolicyId: policyResult.appliedPolicyId,
          policySnapshot: policyResult.policySnapshot as Prisma.InputJsonValue,
        },
      });

      // 8. Update Booking Status
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationSource,
          cancellationReasonType: reasonType,
          cancellationReason: reasonText,
          cancelledByUserId,
          cancellationPenaltyAmount: policyResult.penaltyAmount,
          refundableAmount: policyResult.refundableAmount,
          // DO NOT modify remainingAmount or advanceAmount here, as they reflect the original terms.
          // DO NOT mark payments as REFUNDED.
        },
        include: {
          cancellationRecord: true,
        },
      });

      // Update CabBooking if necessary
      if (booking.cabBooking) {
        await tx.cabBooking.update({
          where: { id: booking.cabBooking.id },
          data: {
            status: "CANCELLED",
          },
        });
      }

      return updatedBooking;
    });
  }
}
