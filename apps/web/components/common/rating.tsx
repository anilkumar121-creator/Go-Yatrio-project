import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingProps = {
  value: number;
  size?: "sm" | "md" | "lg";
  count?: number;
  className?: string;
  label?: string;
};

const starSizes = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export function Rating({
  value,
  size = "sm",
  count,
  className,
  label,
}: RatingProps) {
  const percentage = Math.max(0, Math.min(100, (value / 5) * 100));
  const starClass = starSizes[size];
  const ariaLabel = label ?? `Rated ${value.toFixed(1)} out of 5 stars`;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative inline-flex shrink-0" role="img" aria-label={ariaLabel}>
        <span className="flex gap-0.5 text-muted-foreground/30" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={cn(starClass, "fill-current")} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-warning"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={cn(starClass, "shrink-0 fill-current")} />
          ))}
        </span>
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        {value.toFixed(1)}
        {count !== undefined ? ` (${count})` : ""}
      </span>
    </span>
  );
}
