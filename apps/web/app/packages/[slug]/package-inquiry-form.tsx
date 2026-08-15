"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import { Label } from "@/components/common/label";
import { Button } from "@/components/common/button";

type PackageInquiryFormProps = {
  packageId: string;
  packageTitle: string;
  destinationName: string;
};

export function PackageInquiryForm({
  packageId,
  packageTitle,
  destinationName,
}: PackageInquiryFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [numberOfTravelers, setNumberOfTravelers] = useState("2");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          travelDate: travelDate ? new Date(travelDate).toISOString() : undefined,
          numberOfTravelers: Number(numberOfTravelers) || 2,
          destination: destinationName,
          packageId,
          serviceType: "DOMESTIC_TOUR",
          budget: budget ? Number(budget) : undefined,
          message: message.trim() || `Inquiry for package: ${packageTitle}`,
          source: "package_detail_cta",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit inquiry.");
      }

      setSuccess(true);
      setFullName("");
      setEmail("");
      setPhone("");
      setTravelDate("");
      setMessage("");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to submit inquiry. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 p-5 text-center">
        <CheckCircle className="mx-auto size-8 text-success mb-2" />
        <h4 className="font-semibold text-foreground">Inquiry Received!</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Thank you for inquiring about <strong>{packageTitle}</strong>. Our travel specialist will contact you shortly.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setSuccess(false)}>
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage ? (
        <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="space-y-1">
        <Label htmlFor="inquiry-name" className="text-xs">Full Name *</Label>
        <Input
          id="inquiry-name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Ananya Sharma"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="inquiry-email" className="text-xs">Email Address *</Label>
        <Input
          id="inquiry-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="inquiry-phone" className="text-xs">Phone / WhatsApp *</Label>
        <Input
          id="inquiry-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="inquiry-date" className="text-xs">Travel Date</Label>
          <Input
            id="inquiry-date"
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="inquiry-travelers" className="text-xs">Travelers</Label>
          <Input
            id="inquiry-travelers"
            type="number"
            min={1}
            max={100}
            value={numberOfTravelers}
            onChange={(e) => setNumberOfTravelers(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="inquiry-budget" className="text-xs">Approx. Budget (INR)</Label>
        <Input
          id="inquiry-budget"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="e.g. 40000"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="inquiry-message" className="text-xs">Special Requests / Notes</Label>
        <Textarea
          id="inquiry-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any specific hotel preference, meals, or customize itinerary..."
        />
      </div>

      <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
        <Send className="size-4" />
        {isLoading ? "Submitting Inquiry..." : "Get Free Quote"}
      </Button>
    </form>
  );
}