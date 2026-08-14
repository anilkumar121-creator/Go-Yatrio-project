import { cn } from "@/lib/utils";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: "default" | "narrow" | "wide";
};

export function Container({
  className,
  width = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 laptop:px-8",
        width === "default" && "max-w-[var(--container)]",
        width === "narrow" && "max-w-[var(--container-narrow)]",
        width === "wide" && "max-w-[var(--container-wide)]",
        className,
      )}
      {...props}
    />
  );
}
