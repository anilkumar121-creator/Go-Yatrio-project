"use client";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { Button } from "@/components/common/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <Section>
      <Container className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase text-error">500</p>
          <h1 className="mt-2 text-3xl font-semibold">Something went wrong</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The application shell caught an unexpected error.
          </p>
        </div>
        <Button onClick={reset}>Try again</Button>
      </Container>
    </Section>
  );
}
