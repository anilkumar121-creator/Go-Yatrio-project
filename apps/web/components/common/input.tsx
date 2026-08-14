import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ className, invalid, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex min-h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "data-[invalid=true]:border-error data-[invalid=true]:focus-visible:outline-error",
        className,
      )}
      {...props}
    />
  );
}
