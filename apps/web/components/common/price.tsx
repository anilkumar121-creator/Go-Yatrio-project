import { cn } from "@/lib/utils";

type PriceProps = {
  amount: number;
  currency?: string;
  per?: string;
  originalAmount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

const originalSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Price({
  amount,
  currency = "INR",
  per,
  originalAmount,
  size = "md",
  className,
}: PriceProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold text-foreground", sizeClasses[size])}>
        {formatAmount(amount, currency)}
      </span>
      {originalAmount !== undefined ? (
        <s className={cn("text-muted-foreground", originalSizeClasses[size])}>
          {formatAmount(originalAmount, currency)}
        </s>
      ) : null}
      {per ? (
        <span className="text-xs font-normal text-muted-foreground">{per}</span>
      ) : null}
    </span>
  );
}
