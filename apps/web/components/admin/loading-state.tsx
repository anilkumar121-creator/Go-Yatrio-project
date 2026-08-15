import { Skeleton } from "@/components/common/skeleton";
import { Card } from "@/components/common/card";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  rows?: number;
  className?: string;
};

export function LoadingState({ rows = 5, className }: LoadingStateProps) {
  return (
    <Card className={cn("p-6 space-y-4 border border-border bg-card", className)}>
      <Skeleton className="h-8 w-1/3 rounded-lg" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </Card>
  );
}