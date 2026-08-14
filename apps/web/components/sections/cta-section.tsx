import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container } from "@/components/common/container";
import { Button } from "@/components/common/button";

type CtaSectionProps = {
  title: string;
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant?: "primary" | "card";
  className?: string;
};

export function CtaSection({
  title,
  description,
  primaryCta,
  secondaryCta,
  variant = "primary",
  className,
}: CtaSectionProps) {
  return (
    <section className={cn("py-16 tablet:py-20", className)}>
      <Container>
        <div
          className={cn(
            "flex flex-col items-start gap-6 rounded-lg p-8 tablet:p-12",
            variant === "primary"
              ? "bg-gradient-to-br from-primary via-blue-800 to-secondary text-white"
              : "border border-border bg-card text-foreground shadow-sm",
          )}
        >
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold leading-tight tablet:text-3xl">{title}</h2>
            {description ? (
              <p
                className={cn(
                  "mt-3 text-base leading-7",
                  variant === "primary" ? "text-white/85" : "text-muted-foreground",
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          {primaryCta || secondaryCta ? (
            <div className="flex flex-wrap gap-3">
              {primaryCta ? (
                <Button asChild size="lg" variant={variant === "primary" ? "accent" : "primary"}>
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              ) : null}
              {secondaryCta ? (
                <Button
                  asChild
                  size="lg"
                  variant={variant === "primary" ? "outline" : "outline"}
                  className={variant === "primary" ? "border-white/40 bg-white/10 text-white hover:bg-white/20" : undefined}
                >
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
