"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";

export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <form
      className="flex w-full max-w-sm gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        setSubscribed(true);
      }}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <Input
        id="newsletter-email"
        type="email"
        required
        placeholder="Enter your email"
        className="min-w-0 flex-1"
        disabled={subscribed}
      />
      <Button type="submit" disabled={subscribed} aria-label="Subscribe to newsletter">
        {subscribed ? "Subscribed" : (
          <>
            <Send className="size-4" aria-hidden="true" />
            Subscribe
          </>
        )}
      </Button>
    </form>
  );
}
