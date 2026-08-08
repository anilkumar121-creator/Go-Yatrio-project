import { cn } from "@/lib/utils";

export function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-16 tablet:py-20 desktop:py-24", className)} {...props} />;
}
