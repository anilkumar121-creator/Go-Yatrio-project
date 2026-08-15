import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";

type StatsCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  className?: string;
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection = "neutral",
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("p-5 transition-all duration-200 hover-lift hover:border-primary/40", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        {trend ? (
          <Badge
            variant={
              trendDirection === "up"
                ? "success"
                : trendDirection === "down"
                  ? "error"
                  : "muted"
            }
            className="shrink-0"
          >
            {trend}
          </Badge>
        ) : null}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{title}</p>
        {description ? <p className="mt-1 text-xs text-muted-foreground/80">{description}</p> : null}
      </div>
    </Card>
  );
}