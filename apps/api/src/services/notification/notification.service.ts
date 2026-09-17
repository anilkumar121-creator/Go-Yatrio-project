import { Resend } from "resend";
import { env } from "../../config/env.js";
import type { Booking, CabBooking } from "@prisma/client";

export class NotificationService {
  private resend: Resend | null = null;

  constructor() {
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY);
    }
  }

  public async sendBookingConfirmation(data: {
    booking: Booking;
    cabBooking?: CabBooking | null;
    paymentSummary: {
      payableAmount: import("@prisma/client").Prisma.Decimal;
      advanceAmount: import("@prisma/client").Prisma.Decimal;
      outstandingAmount: import("@prisma/client").Prisma.Decimal;
      isFullyPaid: boolean;
      successfulPaymentsSum: import("@prisma/client").Prisma.Decimal;
    };
    paymentType: "ADVANCE" | "BALANCE";
  }) {
    const { booking, cabBooking, paymentSummary, paymentType } = data;

    if (!this.resend) {
      console.log(
        `[NotificationService] Booking confirmation notification skipped because email credentials are not configured in development. Intended for: ${booking.bookingReference}`,
      );
      return;
    }

    try {
      let subject = "GoYatrio Booking Confirmation";
      if (paymentType === "ADVANCE") {
        subject = `Advance Payment Successful - Booking ${booking.bookingReference}`;
      } else if (paymentType === "BALANCE" && paymentSummary.isFullyPaid) {
        subject = `Fully Paid - Booking ${booking.bookingReference}`;
      } else {
        subject = `Balance Payment Successful - Booking ${booking.bookingReference}`;
      }

      const htmlContent = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <h1 style="color: #0056b3;">${subject}</h1>
          <p>Hello,</p>
          <p>Thank you for your payment. Your booking is confirmed.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Booking Reference:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.bookingReference}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">&#8377;${booking.totalAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">&#8377;${paymentSummary.successfulPaymentsSum.toNumber()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Remaining Balance:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">&#8377;${paymentSummary.outstandingAmount.toNumber()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Booking Status:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.status}</td>
            </tr>
            ${
              cabBooking
                ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pickup Location:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${cabBooking.pickupLocation}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Drop Location:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${cabBooking.dropLocation}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pickup Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${cabBooking.pickupDate.toLocaleString()}</td>
            </tr>
            `
                : ""
            }
          </table>

          <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
            If you have any questions, please reply to this email or contact our support team.
          </p>
        </div>
      `;

      await this.resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: [booking.customerEmail],
        subject,
        html: htmlContent,
      });

      console.log(
        `[NotificationService] Successfully sent confirmation email for booking ${booking.bookingReference}`,
      );
    } catch (error) {
      console.error(
        `[NotificationService] Failed to send confirmation email for booking ${booking.bookingReference}:`,
        error,
      );
      // We do not rethrow, to ensure we don't break webhook processing
    }
  }
}
