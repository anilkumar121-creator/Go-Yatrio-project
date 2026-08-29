"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, Mail, Phone, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";

export default function InquirySuccessPage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8 text-center space-y-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="size-12 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Inquiry Received!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for contacting GoYatrio. We have successfully received your inquiry.
            </p>
          </div>

          {ref && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
              <p className="text-sm font-medium text-green-800">Your Reference Number</p>
              <p className="text-2xl font-mono font-bold text-green-700">{ref}</p>
              <p className="text-xs text-green-600">
                Please save this number for future reference.
              </p>
            </div>
          )}

          <div className="space-y-4 text-sm text-muted-foreground border-t pt-6">
            <p>
              Our team will review your inquiry and get back to you within <strong>24 hours</strong>
              .
            </p>
            <p>
              You can expect a response via email or phone based on your preferred contact method.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4" />
              <span>Email confirmation sent</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4" />
              <span>We may call you</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>Response within 24h</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/">
                <ArrowLeft className="size-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/packages">Browse Packages</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
