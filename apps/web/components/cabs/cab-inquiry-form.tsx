"use client";

import { useState } from "react";
import { CalendarDays, Mail, MessageSquare, Phone, User, Users, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import { Label } from "@/components/common/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";

const tripTypeOptions = [
  { value: "LOCAL", label: "Local Cab" },
  { value: "AIRPORT_TRANSFER", label: "Airport Transfer" },
  { value: "RAILWAY_TRANSFER", label: "Railway Transfer" },
  { value: "OUTSTATION", label: "Outstation Cab" },
  { value: "ONE_WAY", label: "One Way Cab" },
  { value: "ROUND_TRIP", label: "Round Trip Cab" },
  { value: "MULTI_DAY", label: "Multi-Day Cab" },
];

type CabInquiryFormProps = {
  cabId: string;
  cabName: string;
  destinationName?: string;
};

export function CabInquiryForm({ cabId, cabName, destinationName }: CabInquiryFormProps) {
  const [formData, setFormData] = useState({
    tripType: "LOCAL",
    customerName: "",
    email: "",
    phone: "",
    pickupLocation: "",
    dropLocation: "",
    travelDate: "",
    returnDate: "",
    passengers: 2,
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
      const response = await fetch(`/api/cabs/${cabId}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          travelDate: formData.travelDate ? new Date(formData.travelDate).toISOString() : undefined,
          returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : undefined,
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
          Thank you, {formData.customerName}. Our cab expert will contact you shortly regarding {cabName}.
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
          <Label htmlFor="cab-inquiry-type" className="text-xs">Trip Type *</Label>
          <Select value={formData.tripType} onValueChange={(value) => handleChange("tripType", value)}>
            <SelectTrigger id="cab-inquiry-type" className="h-10">
              <SelectValue placeholder="Select Trip Type" />
            </SelectTrigger>
            <SelectContent>
              {tripTypeOptions.map((trip) => (
                <SelectItem key={trip.value} value={trip.value}>{trip.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cab-inquiry-name" className="text-xs">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="cab-inquiry-name"
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
            <Label htmlFor="cab-inquiry-email" className="text-xs">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="cab-inquiry-email"
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
            <Label htmlFor="cab-inquiry-phone" className="text-xs">Phone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="cab-inquiry-phone"
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
            <Label htmlFor="cab-inquiry-pickup" className="text-xs">Pickup Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="cab-inquiry-pickup"
                className="pl-9"
                placeholder="e.g. Airport / Hotel"
                value={formData.pickupLocation}
                onChange={(e) => handleChange("pickupLocation", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cab-inquiry-drop" className="text-xs">Drop Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="cab-inquiry-drop"
                className="pl-9"
                placeholder="e.g. Railway Station"
                value={formData.dropLocation}
                onChange={(e) => handleChange("dropLocation", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cab-inquiry-date" className="text-xs">Travel Date</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="cab-inquiry-date"
                type="date"
                className="pl-9"
                value={formData.travelDate}
                onChange={(e) => handleChange("travelDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cab-inquiry-return" className="text-xs">Return Date (Round Trip / Multi-Day)</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="cab-inquiry-return"
                type="date"
                className="pl-9"
                value={formData.returnDate}
                onChange={(e) => handleChange("returnDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cab-inquiry-guests" className="text-xs">Number of Passengers</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="cab-inquiry-guests"
              type="number"
              min={1}
              max={100}
              className="pl-9"
              value={formData.passengers}
              onChange={(e) => handleChange("passengers", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cab-inquiry-message" className="text-xs">Message / Special Requests</Label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Textarea
              id="cab-inquiry-message"
              rows={3}
              className="pl-9"
              placeholder="Pickup flight number, luggage details, special requests..."
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting Inquiry..." : "Send Cab Inquiry"}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        {destinationName ? `Serving ${destinationName} and nearby routes. ` : ""}Our team responds within 30 minutes.
      </p>
    </form>
  );
}
