import type { LucideIcon } from "lucide-react";
import { FolderOpen } from "lucide-react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("flex flex-col items-center justify-center p-12 text-center border border-dashed border-border bg-card", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-6" size="sm">
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}