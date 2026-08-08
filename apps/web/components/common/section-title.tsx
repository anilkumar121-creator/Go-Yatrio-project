type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase text-secondary">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 text-4xl font-semibold text-foreground tablet:text-5xl">{title}</h1>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted-foreground tablet:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
