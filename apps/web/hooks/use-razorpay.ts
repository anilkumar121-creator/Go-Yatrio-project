"use client";

import { useState, useEffect, useCallback } from "react";
import type { RazorpayInstance, RazorpayOptions } from "../types/razorpay";

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    const handleLoad = () => {
      setIsLoaded(true);
      setError(null);
    };

    const handleError = () => {
      setError(new Error("Failed to load Razorpay SDK"));
    };

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      if (window.Razorpay) {
        setIsLoaded(true);
      }

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, []);

  const createRazorpayInstance = useCallback((options: RazorpayOptions): RazorpayInstance => {
    if (!window.Razorpay) {
      throw new Error("Razorpay SDK is not loaded yet");
    }
    return new window.Razorpay(options);
  }, []);

  return { isLoaded, error, createRazorpayInstance };
}
