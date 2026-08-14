import { cn } from "@/lib/utils";
import { Card } from "@/components/common/card";

type InquiryFormShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function InquiryFormShell({
  title,
  description,
  children,
  className,
}: InquiryFormShellProps) {
  return (
    <Card className={cn("p-6 tablet:p-8", className)}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </Card>
  );
}
