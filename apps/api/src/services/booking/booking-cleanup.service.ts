import { prisma } from "../../db.js";
import { env } from "../../config/env.js";
import { PaymentStatus } from "../../db.js";

export class BookingCleanupService {
  /**
   * Cleans up stale PENDING_PAYMENT bookings.
   * A booking is considered stale if it was created before the configured timeout.
   * Bookings that have any SUCCESS payment are explicitly preserved.
   */
  public async cleanupStaleBookings() {
    console.log("[BookingCleanupService] Starting stale booking cleanup job...");
    const timeoutMinutes = env.BOOKING_PENDING_PAYMENT_TIMEOUT_MINUTES;
    const cutoffDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const result = {
      scanned: 0,
      cancelled: 0,
      skipped: 0,
      errors: 0,
    };

    try {
      // 1. Identify stale PENDING_PAYMENT bookings
      const staleBookings = await prisma.booking.findMany({
        where: {
          status: "PENDING_PAYMENT",
          createdAt: {
            lt: cutoffDate,
          },
        },
        select: {
          id: true,
          bookingReference: true,
        },
      });

      result.scanned = staleBookings.length;

      // 2. Process each booking safely
      for (const booking of staleBookings) {
        try {
          // Re-check payment state safely within a transaction
          await prisma.$transaction(async (tx) => {
            // Lock the booking row using existing concurrency architecture
            const lockedBooking = await tx.$queryRaw<{ status: string }[]>`
              SELECT status FROM "Booking"
              WHERE id = ${booking.id}
              FOR UPDATE
            `;

            if (lockedBooking.length === 0 || lockedBooking[0].status !== "PENDING_PAYMENT") {
              // Booking no longer exists or status has already changed (e.g., CONFIRMED)
              result.skipped++;
              return;
            }

            // Check if any SUCCESS payment exists for this booking
            const successfulPayments = await tx.payment.count({
              where: {
                bookingId: booking.id,
                status: PaymentStatus.SUCCESS,
              },
            });

            if (successfulPayments > 0) {
              // Safety net: Do not cancel if a successful payment exists
              result.skipped++;
              return;
            }

            // Conditionally transition the booking to CANCELLED
            await tx.booking.updateMany({
              where: {
                id: booking.id,
                status: "PENDING_PAYMENT",
              },
              data: {
                status: "CANCELLED",
              },
            });

            // If there's a CabBooking associated, cancel it too
            await tx.cabBooking.updateMany({
              where: {
                bookingId: booking.id,
              },
              data: {
                status: "CANCELLED",
              },
            });

            result.cancelled++;
          });
        } catch (error) {
          console.error(`[BookingCleanupService] Error cleaning up booking ${booking.id}:`, error);
          result.errors++;
        }
      }

      console.log(
        `[BookingCleanupService] Cleanup finished. Scanned: ${result.scanned}, Cancelled: ${result.cancelled}, Skipped: ${result.skipped}, Errors: ${result.errors}`,
      );
    } catch (error) {
      console.error("[BookingCleanupService] Critical failure during cleanup job:", error);
    }

    return result;
  }
}
