import { cn } from "@/lib/utils";
import { Container } from "@/components/common/container";
import { Skeleton } from "@/components/common/skeleton";
import { Spinner } from "@/components/common/spinner";

type LoadingSectionProps = {
  variant?: "skeleton-grid" | "spinner";
  count?: number;
  label?: string;
  className?: string;
};

export function LoadingSection({
  variant = "skeleton-grid",
  count = 6,
  label = "Loading",
  className,
}: LoadingSectionProps) {
  return (
    <section className={cn("py-16", className)} aria-busy="true" aria-label={label}>
      <Container>
        {variant === "spinner" ? (
          <div className="flex min-h-48 items-center justify-center">
            <Spinner label={label} />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 desktop:grid-cols-3">
            {Array.from({ length: count }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-md border border-border bg-card">
                <Skeleton shimmer className="aspect-[16/10] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton shimmer className="h-4 w-2/3" />
                  <Skeleton shimmer className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
