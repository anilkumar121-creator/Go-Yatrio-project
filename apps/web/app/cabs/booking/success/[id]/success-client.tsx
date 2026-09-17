"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { Container } from "@/components/common/container";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { useSearchParams } from "next/navigation";

interface InitialBookingData {
  status: string;
  bookingReference: string;
  cabBooking?: {
    pickupLocation: string;
    dropLocation?: string | null;
    pickupCity?: { name: string };
    pickupDate: string | Date;
    pickupTime: string;
    vehicle?: {
      vehicleName: string;
      vehicleType: string;
    };
    pricingSnapshot?: {
      totalFare: number;
    };
  };
  paymentSummary?: {
    isAdvanceSatisfied: boolean;
    isFullyPaid: boolean;
    payableAmount: number;
    outstandingAmount: number;
    advanceAmount: number;
  };
}

type Props = {
  id: string;
  initialBooking: InitialBookingData | null;
};

export function CabBookingSuccessClient({ id, initialBooking }: Props) {
  const searchParams = useSearchParams();
  const paymentQuery = searchParams.get("payment");
  const paymentId = searchParams.get("paymentId");
  const [booking, setBooking] = useState(initialBooking);
  const [status, setStatus] = useState(initialBooking?.status);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<string | null>(null);

  // Start polling if we are in processing mode. We prefer polling the specific paymentId.
  // Fall back to polling booking status if paymentId is missing (legacy).
  const [isPolling, setIsPolling] = useState(paymentQuery === "processing");
  const [pollingTimeout, setPollingTimeout] = useState(false);

  useEffect(() => {
    if (!isPolling) return;

    const pollStatus = async () => {
      try {
        if (paymentId) {
          const res = await fetch(`/api/payments/${paymentId}/status`);
          if (res.ok) {
            const data = await res.json();
            setPaymentStatus(data.status);
            if (data.paymentType) {
              setPaymentType(data.paymentType);
            }

            if (data.status === "SUCCESS" || data.status === "FAILED") {
              setIsPolling(false);
              clearInterval(intervalId);
              clearTimeout(timeoutId);

              // Refetch booking to update the summary in the UI
              const bRes = await fetch(`/api/bookings/${id}`);
              if (bRes.ok) {
                const bData = await bRes.json();
                setBooking(bData);
                setStatus(bData.status);
              }
            }
          }
        } else {
          // Legacy fallback
          const res = await fetch(`/api/bookings/${id}`);
          if (res.ok) {
            const data = await res.json();
            setBooking(data);
            setStatus(data.status);

            if (data.status !== "PENDING_PAYMENT") {
              setIsPolling(false);
              clearInterval(intervalId);
              clearTimeout(timeoutId);
            }
          }
        }
      } catch {
        // Silently ignore fetch errors during polling
      }
    };

    const intervalId = setInterval(pollStatus, 3000);

    const timeoutId = setTimeout(() => {
      setIsPolling(false);
      setPollingTimeout(true);
      clearInterval(intervalId);
    }, 60000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [id, isPolling]);

  const cab = booking?.cabBooking;
  const pricing = cab?.pricingSnapshot;

  const renderStatusHeader = () => {
    // If we tracked a specific payment and it failed
    if (paymentId && paymentStatus === "FAILED") {
      return (
        <>
          <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
            <XCircle className="size-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Payment Failed</h1>
          <p className="text-muted-foreground">
            The payment transaction failed. You can try again from the booking details page.
          </p>
        </>
      );
    }

    // If we tracked a specific payment and it succeeded, OR legacy fallback
    const isSuccess =
      (paymentId && paymentStatus === "SUCCESS") || (!paymentId && status === "CONFIRMED");

    if (isSuccess) {
      const isFullyPaid = booking?.paymentSummary?.isFullyPaid;

      return (
        <>
          <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="size-10 text-success" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Payment Successful</h1>
          <p className="text-muted-foreground">
            {isFullyPaid
              ? "Your booking is fully paid and confirmed. Have a safe journey!"
              : paymentType === "BALANCE"
                ? "Your balance payment was successful."
                : "Your advance payment was successful and your cab booking is confirmed."}
          </p>
        </>
      );
    }

    if (isPolling) {
      return (
        <>
          <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Clock className="size-10 text-blue-500 animate-spin" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Processing Payment</h1>
          <p className="text-muted-foreground">
            Payment submitted {"\u2014"} waiting for confirmation. Please do not close this page.
          </p>
        </>
      );
    }

    if (pollingTimeout) {
      return (
        <>
          <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="size-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Confirmation Pending</h1>
          <p className="text-muted-foreground">
            Payment confirmation is taking longer than expected. The status will update
            automatically once the gateway confirms it.
          </p>
        </>
      );
    }

    if (status === "CANCELLED") {
      return (
        <>
          <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
            <XCircle className="size-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Booking Cancelled</h1>
          <p className="text-muted-foreground">This booking has been cancelled.</p>
        </>
      );
    }

    // Default for PENDING_PAYMENT without processing state
    return (
      <>
        <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
          <Clock className="size-10 text-amber-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Booking Requested</h1>
        <p className="text-muted-foreground">
          {paymentQuery === "pending"
            ? "Your payment is pending. Please complete the payment to confirm your booking."
            : "Your cab booking request has been saved. Please complete your payment."}
        </p>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 md:py-20 flex items-center justify-center">
      <Container className="max-w-2xl">
        <Card className="p-8 border-border shadow-md">
          <div className="text-center mb-8">{renderStatusHeader()}</div>

          <div className="bg-muted/50 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
              <p className="text-xl font-mono font-bold tracking-wider">
                {booking ? booking.bookingReference : id.toUpperCase().substring(0, 8)}
              </p>
            </div>
            {booking && (
              <div className="md:text-right">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    status === "CONFIRMED"
                      ? "bg-success/10 text-success"
                      : status === "PENDING_PAYMENT"
                        ? "bg-amber-500/10 text-amber-600"
                        : status === "CANCELLED"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                  }`}
                >
                  {status}
                </div>
              </div>
            )}
          </div>

          {booking && cab && (
            <div className="space-y-6 mb-8 text-left">
              <h3 className="font-semibold text-lg border-b pb-2">Trip Summary</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Route</span>
                  <span className="font-medium">
                    {cab.pickupLocation} {"\u2192"} {cab.dropLocation || cab.pickupCity?.name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Date & Time</span>
                  <span className="font-medium">
                    {new Date(cab.pickupDate).toLocaleDateString()} at {cab.pickupTime}
                  </span>
                </div>
                {cab.vehicle && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Vehicle</span>
                    <span className="font-medium">
                      {cab.vehicle.vehicleName} ({cab.vehicle.vehicleType})
                    </span>
                  </div>
                )}
                {pricing?.totalFare && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Total Fare</span>
                    <span className="font-medium">
                      {"\u20B9"}
                      {pricing.totalFare}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center">
            {booking?.paymentSummary?.payableAmount
              ? booking.paymentSummary.payableAmount > 0 &&
                !isPolling && (
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={`/account/bookings/${id}`}>View Booking / Pay Now</Link>
                  </Button>
                )
              : status === "PENDING_PAYMENT" &&
                !isPolling && (
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={`/account/bookings/${id}`}>View Booking / Pay Now</Link>
                  </Button>
                )}
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/cabs">Browse More Cabs</Link>
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
