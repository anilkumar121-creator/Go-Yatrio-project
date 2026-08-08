"use client";

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/common/button";

export function ScrollToTop() {
  return (
    <Button
      aria-label="Scroll to top"
      className="fixed bottom-5 right-5 z-40 shadow-lg"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      size="icon"
      variant="secondary"
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </Button>
  );
}
