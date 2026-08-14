import { cn } from "@/lib/utils";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h1",
  className,
}: SectionTitleProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "max-w-3xl",
        isCentered && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
          {eyebrow}
        </p>
      ) : null}
      <Heading className="mt-3 text-3xl font-semibold leading-tight text-foreground tablet:text-4xl desktop:text-5xl">
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-7 text-muted-foreground tablet:text-lg",
            isCentered && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
