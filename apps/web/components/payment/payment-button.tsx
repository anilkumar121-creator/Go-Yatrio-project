"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/button";
import { useToast } from "@/components/common/toast";
import { useRazorpay } from "../../hooks/use-razorpay";
import { CreditCard } from "lucide-react";

type PaymentButtonProps = {
  bookingId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  isAdvance?: boolean;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred.";
}

export function PaymentButton({
  bookingId,
  customerName,
  customerEmail,
  customerPhone,
  isAdvance = true,
}: PaymentButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { isLoaded, createRazorpayInstance } = useRazorpay();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/payments/${bookingId}/intent`, {
        method: "POST",
      });

      const intentData = await res.json();

      if (!res.ok) {
        toast({
          title: "Payment Unavailable",
          description: intentData.error || "Online payment is currently unavailable.",
          variant: "error",
        });
        return;
      }

      if (!intentData.gatewayKey) {
        toast({
          title: "Payment Unavailable",
          description: "Online payment is currently unavailable.",
          variant: "error",
        });
        return;
      }

      if (!isLoaded) {
        toast({
          title: "Payment SDK Not Ready",
          description: "Please wait or refresh the page and try again.",
          variant: "error",
        });
        return;
      }

      const options = {
        key: intentData.gatewayKey,
        amount: Math.round(Number(intentData.amount) * 100),
        currency: intentData.currency,
        name: "GoYatrio",
        description: isAdvance ? "Cab booking advance payment" : "Cab booking balance payment",
        order_id: intentData.providerOrderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        handler: function () {
          router.push(
            `/cabs/booking/success/${bookingId}?payment=processing&paymentId=${intentData.paymentId}`,
          );
        },
        modal: {
          ondismiss: function () {
            toast({
              title: "Payment Cancelled",
              description: "You have cancelled the payment.",
              variant: "default",
            });
            setIsProcessing(false);
          },
        },
      };

      try {
        const rzp = createRazorpayInstance(options);
        rzp.open();
      } catch (err: unknown) {
        toast({
          title: "Payment Error",
          description: getErrorMessage(err) || "Failed to open payment gateway.",
          variant: "error",
        });
        setIsProcessing(false);
      }
    } catch {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred while initiating payment.",
        variant: "error",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing || !isLoaded}
      className="w-full mt-4"
      size="lg"
    >
      <CreditCard className="mr-2 h-4 w-4" />
      {isProcessing ? "Processing..." : isAdvance ? "Pay Advance" : "Pay Remaining Balance"}
    </Button>
  );
}
