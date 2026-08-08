import { cn } from "@/lib/utils";

export function PageWrapper({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-h-[calc(100vh-8rem)]", className)} {...props} />;
}
