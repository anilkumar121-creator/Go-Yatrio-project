"use client";

import { useState } from "react";
import { MessageSquare, X, PhoneCall, Send, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/button";

export function FloatingEnquiry() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-24 left-0 z-50 flex items-end sm:bottom-12 sm:items-center">
      {/* The Tab */}
      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-r-xl bg-primary text-primary-foreground shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] px-3 py-3 sm:px-4 sm:py-3.5 hover:pr-5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Open Enquiry Form"
        >
          <PhoneCall className="size-5" />
          <span className="hidden sm:inline font-bold tracking-wider text-sm">Callback</span>
          <ChevronRight className="size-4 opacity-70" />
        </button>
      </div>

      {/* The Panel */}
      <div
        className={`absolute left-0 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 transition-all duration-300 ease-in-out origin-left ${
          isOpen
            ? "scale-100 opacity-100 translate-x-2"
            : "scale-95 opacity-0 -translate-x-4 pointer-events-none"
        }`}
      >
        <div className="w-[85vw] max-w-sm sm:w-80 bg-background rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              <h3 className="font-bold">Request Callback</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
              aria-label="Close Enquiry Form"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form Content (UI Only) */}
          <div className="p-5">
            {isSubmitted ? (
              <div className="py-6 text-center flex flex-col items-center justify-center space-y-3">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Send className="size-6" />
                </div>
                <h4 className="font-bold text-foreground">Thanks!</h4>
                <p className="text-sm text-muted-foreground">Your enquiry has been received.</p>
                <p className="text-xs text-muted-foreground/60 italic">
                  (UI Demo only - Backend planned for Phase 14)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsOpen(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Leave your details and our travel experts will call you back shortly.
                </p>

                <form
                  className="flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsSubmitted(true);
                  }}
                >
                  <div>
                    <label htmlFor="enquiry-name" className="sr-only">
                      Name
                    </label>
                    <input
                      id="enquiry-name"
                      type="text"
                      placeholder="Your Name"
                      required
                      className="w-full text-sm px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="enquiry-phone" className="sr-only">
                      Phone Number
                    </label>
                    <input
                      id="enquiry-phone"
                      type="tel"
                      placeholder="Phone Number"
                      required
                      className="w-full text-sm px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="enquiry-interest" className="sr-only">
                      Interested In
                    </label>
                    <select
                      id="enquiry-interest"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      <option value="">Interested In...</option>
                      <option value="cabs">Cab Booking</option>
                      <option value="packages">Tour Packages</option>
                      <option value="hotels">Hotels</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2 font-bold flex items-center justify-center gap-2"
                  >
                    <Send className="size-4" />
                    <span>Submit Request</span>
                  </Button>
                </form>
              </>
            )}

            <div className="mt-4 pt-3 border-t border-border/50 text-center">
              <button
                onClick={() => setIsDismissed(true)}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
