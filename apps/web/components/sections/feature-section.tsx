import { cn } from "@/lib/utils";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";

type Feature = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
};

type FeatureSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  features: Feature[];
  className?: string;
};

export function FeatureSection({
  eyebrow,
  title,
  description,
  features,
  className,
}: FeatureSectionProps) {
  return (
    <section className={cn("py-16 tablet:py-20", className)}>
      <Container>
        <SectionTitle eyebrow={eyebrow} title={title} description={description} align="center" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 desktop:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-card p-6 shadow-sm hover-lift"
            >
              <div className="flex size-11 items-center justify-center rounded-md bg-primary/10">
                <feature.icon className="size-5 text-primary" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
