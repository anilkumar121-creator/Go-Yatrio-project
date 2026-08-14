import { cn } from "@/lib/utils";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";

type BookingFormShellProps = {
  title: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
};

export function BookingFormShell({
  title,
  description,
  badge,
  children,
  className,
}: BookingFormShellProps) {
  return (
    <Card className={cn("p-6 tablet:p-8", className)}>
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {badge ? <Badge>{badge}</Badge> : null}
        </div>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </Card>
  );
}
