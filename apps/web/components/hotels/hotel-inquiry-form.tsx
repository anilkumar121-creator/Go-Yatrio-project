"use client";

import { useState } from "react";
import { CalendarDays, Mail, MessageSquare, Phone, User, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import { Label } from "@/components/common/label";

type HotelInquiryFormProps = {
  hotelId: string;
  hotelName: string;
  destinationName?: string;
};

export function HotelInquiryForm({ hotelId, hotelName, destinationName }: HotelInquiryFormProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
    guests: 2,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/hotels/${hotelId}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          checkInDate: formData.checkInDate ? new Date(formData.checkInDate).toISOString() : undefined,
          checkOutDate: formData.checkOutDate ? new Date(formData.checkOutDate).toISOString() : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Inquiry submission failed.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit inquiry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-md border border-success/30 bg-success/10 p-6 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h4 className="mt-3 text-lg font-semibold text-foreground">Inquiry Sent Successfully!</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Thank you, {formData.customerName}. Our hotel expert will contact you shortly regarding {hotelName}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="hotel-inquiry-name" className="text-xs">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="hotel-inquiry-name"
              required
              className="pl-9"
              placeholder="e.g. Rahul Sharma"
              value={formData.customerName}
              onChange={(e) => handleChange("customerName", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="hotel-inquiry-email" className="text-xs">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="hotel-inquiry-email"
                type="email"
                required
                className="pl-9"
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hotel-inquiry-phone" className="text-xs">Phone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="hotel-inquiry-phone"
                required
                className="pl-9"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="hotel-inquiry-checkin" className="text-xs">Check-In Date *</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="hotel-inquiry-checkin"
                type="date"
                required
                className="pl-9"
                value={formData.checkInDate}
                onChange={(e) => handleChange("checkInDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="hotel-inquiry-checkout" className="text-xs">Check-Out Date *</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="hotel-inquiry-checkout"
                type="date"
                required
                className="pl-9"
                value={formData.checkOutDate}
                onChange={(e) => handleChange("checkOutDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hotel-inquiry-guests" className="text-xs">Number of Guests</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="hotel-inquiry-guests"
              type="number"
              min={1}
              max={50}
              className="pl-9"
              value={formData.guests}
              onChange={(e) => handleChange("guests", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hotel-inquiry-message" className="text-xs">Message / Special Requests</Label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Textarea
              id="hotel-inquiry-message"
              rows={3}
              className="pl-9"
              placeholder="Room preferences, arrival time, special occasions..."
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting Inquiry..." : "Send Hotel Inquiry"}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        Include {destinationName ?? "your destination"} and travel dates. Our team responds within 30 minutes.
      </p>
    </form>
  );
}
