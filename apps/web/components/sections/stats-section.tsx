import { cn } from "@/lib/utils";
import { Container } from "@/components/common/container";

type Stat = {
  value: string;
  label: string;
};

type StatsSectionProps = {
  stats: Stat[];
  className?: string;
  tone?: "default" | "primary";
};

export function StatsSection({
  stats,
  className,
  tone = "default",
}: StatsSectionProps) {
  return (
    <section className={cn("py-16 tablet:py-20", className)}>
      <Container>
        <dl
          className={cn(
            "grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border",
            tone === "default" ? "bg-border" : "bg-white/15",
          )}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center justify-center px-4 py-10 text-center",
                tone === "default" ? "bg-card" : "bg-primary",
              )}
            >
              <dd
                className={cn(
                  "text-3xl font-semibold tablet:text-4xl",
                  tone === "default" ? "text-foreground" : "text-white",
                )}
              >
                {stat.value}
              </dd>
              <dt
                className={cn(
                  "mt-2 text-sm",
                  tone === "default" ? "text-muted-foreground" : "text-white/80",
                )}
              >
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
