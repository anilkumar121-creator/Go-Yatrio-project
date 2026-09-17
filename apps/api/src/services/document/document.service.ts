import PDFDocument from "pdfkit";
import { Booking, CabBooking, Payment, Vehicle } from "@prisma/client";
import { Prisma } from "@prisma/client";

export interface PaymentSummary {
  payableAmount: Prisma.Decimal;
  advanceAmount: Prisma.Decimal;
  outstandingAmount: Prisma.Decimal;
  isAdvanceSatisfied: boolean;
  isFullyPaid: boolean;
  successfulPaymentsSum: Prisma.Decimal;
}

export type FullCabBooking = CabBooking & {
  vehicle: Vehicle;
};

export class DocumentService {
  /**
   * Generates a Cab Booking Voucher PDF stream
   */
  public generateCabVoucher(
    booking: Booking,
    cabBooking: FullCabBooking,
    paymentSummary: PaymentSummary,
  ): PDFKit.PDFDocument {
    // We use a standard buffer/stream behavior in Express by returning the doc.
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // HEADER
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#0056b3")
      .text("GoYatrio", { align: "left" })
      .moveDown(0.2);

    doc
      .fontSize(10)
      .fillColor("gray")
      .font("Helvetica")
      .text("Cab Booking Voucher", { align: "left" })
      .moveDown(1);

    // BRANDING / BOOKING REF LINE
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#eeeeee").stroke().moveDown(1);

    // TWO COLUMNS: Customer & Booking Info
    const yTop = doc.y;

    // LEFT: Booking Info
    doc.fontSize(10).fillColor("#333").font("Helvetica-Bold").text("Booking Reference:", 50, yTop);
    doc.font("Helvetica").text(booking.bookingReference, 150, yTop);

    doc.font("Helvetica-Bold").text("Booking Status:", 50, yTop + 20);
    doc.font("Helvetica").text(booking.status, 150, yTop + 20);

    doc.font("Helvetica-Bold").text("Generated On:", 50, yTop + 40);
    doc.font("Helvetica").text(new Date().toLocaleString(), 150, yTop + 40);

    // RIGHT: Customer Info
    doc.font("Helvetica-Bold").text("Customer Name:", 320, yTop);
    doc.font("Helvetica").text(booking.customerName, 420, yTop);

    doc.font("Helvetica-Bold").text("Email:", 320, yTop + 20);
    doc.font("Helvetica").text(booking.customerEmail, 420, yTop + 20);

    doc.font("Helvetica-Bold").text("Phone:", 320, yTop + 40);
    doc.font("Helvetica").text(booking.customerPhone, 420, yTop + 40);

    // Reset Y to below the blocks
    doc.y = Math.max(doc.y, yTop + 70);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#eeeeee").stroke().moveDown(1.5);

    // TRIP DETAILS
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#0056b3")
      .text("Trip Information", 50, doc.y)
      .moveDown(0.5);

    doc.fontSize(10).fillColor("#333");
    const tripY = doc.y;

    // Left Column Trip
    doc.font("Helvetica-Bold").text("Trip Type:", 50, tripY);
    doc.font("Helvetica").text(cabBooking.tripType, 150, tripY);

    doc.font("Helvetica-Bold").text("Pickup Date:", 50, tripY + 20);
    doc
      .font("Helvetica")
      .text(
        `${cabBooking.pickupDate.toLocaleDateString()} ${cabBooking.pickupTime || ""}`,
        150,
        tripY + 20,
      );

    doc.font("Helvetica-Bold").text("Pickup Location:", 50, tripY + 40);
    doc.font("Helvetica").text(cabBooking.pickupLocation, 150, tripY + 40, { width: 150 });

    if (cabBooking.returnDate) {
      doc.font("Helvetica-Bold").text("Return Date:", 50, tripY + 80);
      doc
        .font("Helvetica")
        .text(
          `${cabBooking.returnDate.toLocaleDateString()} ${cabBooking.returnTime || ""}`,
          150,
          tripY + 80,
        );
    }

    // Right Column Trip
    doc.font("Helvetica-Bold").text("Vehicle:", 320, tripY);
    doc
      .font("Helvetica")
      .text(`${cabBooking.vehicle.vehicleName} (${cabBooking.vehicle.vehicleType})`, 400, tripY);

    doc.font("Helvetica-Bold").text("Passengers:", 320, tripY + 20);
    doc.font("Helvetica").text(cabBooking.passengers.toString(), 400, tripY + 20);

    if (cabBooking.dropLocation) {
      doc.font("Helvetica-Bold").text("Drop Location:", 320, tripY + 40);
      doc.font("Helvetica").text(cabBooking.dropLocation, 400, tripY + 40, { width: 140 });
    }

    doc.y = Math.max(doc.y, tripY + 110);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#eeeeee").stroke().moveDown(1.5);

    // FINANCIAL SUMMARY
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#0056b3")
      .text("Payment Summary", 50, doc.y)
      .moveDown(0.5);

    doc.fontSize(10).fillColor("#333");

    doc.font("Helvetica-Bold").text("Total Amount:", 50, doc.y, { continued: true });
    doc.font("Helvetica").text(`   ${booking.currency} ${booking.totalAmount}`);

    doc.font("Helvetica-Bold").text("Total Paid:", 50, doc.y + 15, { continued: true });
    doc
      .font("Helvetica")
      .text(`   ${booking.currency} ${paymentSummary.successfulPaymentsSum.toNumber()}`);

    doc.font("Helvetica-Bold").text("Remaining Balance:", 50, doc.y + 30, { continued: true });
    doc
      .font("Helvetica")
      .text(`   ${booking.currency} ${paymentSummary.outstandingAmount.toNumber()}`);

    doc.moveDown(3);
    doc
      .fontSize(8)
      .fillColor("gray")
      .text("This is a computer generated document and does not require a physical signature.", {
        align: "center",
      });

    return doc;
  }

  /**
   * Generates a Payment Receipt PDF stream
   */
  public generatePaymentReceipt(
    booking: Booking,
    payment: Payment,
    paymentSummary: PaymentSummary,
  ): PDFKit.PDFDocument {
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // HEADER
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#0056b3")
      .text("GoYatrio", { align: "left" })
      .moveDown(0.2);

    doc
      .fontSize(10)
      .fillColor("gray")
      .font("Helvetica")
      .text("Payment Receipt", { align: "left" })
      .moveDown(1);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#eeeeee").stroke().moveDown(1);

    const yTop = doc.y;

    // LEFT: Receipt Info
    doc.fontSize(10).fillColor("#333").font("Helvetica-Bold").text("Receipt Number:", 50, yTop);
    doc.font("Helvetica").text(payment.paymentReference || payment.id, 150, yTop);

    doc.font("Helvetica-Bold").text("Booking Ref:", 50, yTop + 20);
    doc.font("Helvetica").text(booking.bookingReference, 150, yTop + 20);

    doc.font("Helvetica-Bold").text("Date:", 50, yTop + 40);
    doc.font("Helvetica").text(payment.createdAt.toLocaleString(), 150, yTop + 40);

    // RIGHT: Customer Info
    doc.font("Helvetica-Bold").text("Customer:", 320, yTop);
    doc.font("Helvetica").text(booking.customerName, 400, yTop);

    doc.font("Helvetica-Bold").text("Email:", 320, yTop + 20);
    doc.font("Helvetica").text(booking.customerEmail, 400, yTop + 20);

    doc.y = Math.max(doc.y, yTop + 70);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#eeeeee").stroke().moveDown(1.5);

    // PAYMENT DETAILS
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#0056b3")
      .text("Payment Details", 50, doc.y)
      .moveDown(0.5);

    doc.fontSize(10).fillColor("#333");

    // Receipt Amount emphasis
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(`Amount Paid: ${payment.currency} ${payment.amount.toNumber()}`, 50, doc.y)
      .moveDown(1);

    doc.fontSize(10);
    doc.font("Helvetica-Bold").text("Payment Status:", 50, doc.y, { continued: true });
    doc.font("Helvetica").text(`   ${payment.status}`);
    doc.moveDown(0.5);

    if (payment.paymentMethod) {
      doc.font("Helvetica-Bold").text("Payment Method:", 50, doc.y, { continued: true });
      doc.font("Helvetica").text(`   ${payment.paymentMethod}`);
      doc.moveDown(0.5);
    }
    if (payment.gatewayName) {
      doc.font("Helvetica-Bold").text("Gateway:", 50, doc.y, { continued: true });
      doc.font("Helvetica").text(`   ${payment.gatewayName}`);
      doc.moveDown(0.5);
    }
    if (payment.gatewayTransactionId) {
      doc.font("Helvetica-Bold").text("Transaction ID:", 50, doc.y, { continued: true });
      doc.font("Helvetica").text(`   ${payment.gatewayTransactionId}`);
      doc.moveDown(0.5);
    }

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#eeeeee").stroke().moveDown(1.5);

    // BOOKING SUMMARY
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#0056b3")
      .text("Booking Summary", 50, doc.y)
      .moveDown(0.5);

    doc.fontSize(10).fillColor("#333");
    doc.font("Helvetica-Bold").text("Booking Total:", 50, doc.y, { continued: true });
    doc.font("Helvetica").text(`   ${booking.currency} ${booking.totalAmount}`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Total Successfully Paid:", 50, doc.y, { continued: true });
    doc
      .font("Helvetica")
      .text(`   ${booking.currency} ${paymentSummary.successfulPaymentsSum.toNumber()}`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Remaining Amount:", 50, doc.y, { continued: true });
    doc
      .font("Helvetica")
      .text(`   ${booking.currency} ${paymentSummary.outstandingAmount.toNumber()}`);

    doc.moveDown(3);
    doc
      .fontSize(8)
      .fillColor("gray")
      .text("This is a computer generated document and does not require a physical signature.", {
        align: "center",
      });

    return doc;
  }
}
