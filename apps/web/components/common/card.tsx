import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm", className)}
      {...props}
    />
  );
}
