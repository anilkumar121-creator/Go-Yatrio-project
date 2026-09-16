"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/input";
import { Label } from "@/components/common/label";
import { Button } from "@/components/common/button";
import { Textarea } from "@/components/common/textarea";
import { Card } from "@/components/common/card";
import { useToast } from "@/components/common/toast";

const customerSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

type CabCustomerDetailsFormProps = {
  bookingPayload: Record<string, unknown>; // Contains pickup, drop, dates, vehicleId, etc.
  requiresManualPricing?: boolean;
};

export function CabCustomerDetailsForm({
  bookingPayload,
  requiresManualPricing,
}: CabCustomerDetailsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [idempotencyKey] = useState(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return `idempotency-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      if (requiresManualPricing) {
        // Construct detailed message to include stops and extra info
        const stopsInfo = bookingPayload.stops
          ? `\nStops: ${JSON.stringify(bookingPayload.stops)}`
          : "";
        const notesInfo = data.notes ? `\nNotes: ${data.notes}` : "";
        const message = `Cab Inquiry for ${bookingPayload.vehicleCategory} - ${bookingPayload.tripType}.${stopsInfo}${notesInfo}`;

        const inquiryPayload = {
          tripType: bookingPayload.tripType,
          customerName: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          pickupLocation: bookingPayload.pickupLocation,
          dropLocation: bookingPayload.dropLocation,
          travelDate: bookingPayload.pickupDate,
          returnDate: bookingPayload.returnDate,
          passengers: bookingPayload.passengers,
          message: message,
        };

        const res = await fetch(`/api/cabs/${bookingPayload.vehicleId}/inquiry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inquiryPayload),
        });

        const responseData = await res.json();
        if (!res.ok) throw new Error(responseData.error || "Failed to submit inquiry");

        toast({
          title: "Inquiry Submitted",
          description:
            "Your request has been received. Our team will contact you with the fare confirmation.",
          variant: "default",
        });

        // Redirect to cab details page with success message parameter or just back to cabs
        router.push(`/cabs`);
      } else {
        const payload = {
          ...bookingPayload,
          ...data,
        };

        const res = await fetch("/api/cab-bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify(payload),
        });

        const responseData = await res.json();

        if (!res.ok) {
          throw new Error(responseData.error || "Failed to create booking");
        }

        toast({
          title: "Booking Created",
          description: "Your cab booking has been successfully created.",
          variant: "default",
        });

        // Use bookingId as the canonical parent Booking ID for the success page
        const parentBookingId = responseData.data?.bookingId || responseData.bookingId;
        router.push(`/cabs/booking/success/${parentBookingId}`);
      }
    } catch (error) {
      toast({
        title: requiresManualPricing ? "Inquiry Failed" : "Booking Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 border-border shadow-sm">
      <h2 className="text-xl font-bold mb-4">Customer Details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Full Name *</Label>
          <Input id="customerName" {...register("customerName")} placeholder="John Doe" />
          {errors.customerName && (
            <p className="text-xs text-destructive">{errors.customerName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email Address *</Label>
            <Input
              id="customerEmail"
              type="email"
              {...register("customerEmail")}
              placeholder="john@example.com"
            />
            {errors.customerEmail && (
              <p className="text-xs text-destructive">{errors.customerEmail.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone Number *</Label>
            <Input
              id="customerPhone"
              type="tel"
              {...register("customerPhone")}
              placeholder="+91 9876543210"
            />
            {errors.customerPhone && (
              <p className="text-xs text-destructive">{errors.customerPhone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Special Requests (Optional)</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Any specific instructions for the driver?"
            className="resize-none"
          />
        </div>

        <Button type="submit" size="lg" className="w-full mt-6" disabled={isSubmitting}>
          {isSubmitting
            ? "Processing..."
            : requiresManualPricing
              ? "Submit Inquiry"
              : "Confirm Booking"}
        </Button>
      </form>
    </Card>
  );
}
