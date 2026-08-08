import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[var(--container)] px-4 sm:px-6 laptop:px-8", className)}
      {...props}
    />
  );
}
