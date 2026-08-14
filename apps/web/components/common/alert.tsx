import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-md border p-4 text-sm",
  {
    variants: {
      variant: {
        info: "border-info/30 bg-info/10 text-info",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
        error: "border-error/30 bg-error/10 text-error",
        muted: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

const alertIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  muted: Info,
};

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    title?: string;
    icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  };

export function Alert({
  className,
  variant = "info",
  title,
  icon: Icon,
  children,
  role = "alert",
  ...props
}: AlertProps) {
  const IconComponent = Icon ?? alertIcons[variant ?? "info"];

  return (
    <div className={cn(alertVariants({ variant }), className)} role={role} {...props}>
      <IconComponent className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex-1 space-y-1">
        {title ? <p className="font-semibold leading-5">{title}</p> : null}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
