export type ToastProps = {
  title: string;
  description?: string;
};

export function Toast({ title, description }: ToastProps) {
  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-lg" role="status">
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
