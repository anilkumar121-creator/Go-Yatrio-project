import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/card";

type ShowcaseSectionProps = {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function ShowcaseSection({
  id,
  title,
  description,
  children,
  className,
}: ShowcaseSectionProps) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-heading` : undefined} className={className}>
      <Card>
        <CardHeader>
          <CardTitle id={id ? `${id}-heading` : undefined}>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="space-y-8">{children}</CardContent>
      </Card>
    </section>
  );
}

type DemoBlockProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function DemoBlock({ label, children, className }: DemoBlockProps) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className={cn("rounded-md border border-border bg-background p-4", className)}>
        {children}
      </div>
    </div>
  );
}
