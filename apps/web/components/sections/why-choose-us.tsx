import { ShieldCheck, Compass, Tag, Headphones } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Card } from "@/components/common/card";
import { MotionDiv } from "@/components/animation/motion";

export type FeatureItem = {
  id: string;
  title: string;
  description: string;
  icon: "shield" | "compass" | "tag" | "headphones";
};

const defaultBenefits: FeatureItem[] = [
  {
    id: "experts",
    title: "Trusted Travel Experts",
    description: "Over a decade of industry experience crafting flawless journeys with verified local partners.",
    icon: "shield",
  },
  {
    id: "customized",
    title: "Customized Itineraries",
    description: "Personalized trip plans designed specifically around your preferences, schedule, and budget.",
    icon: "compass",
  },
  {
    id: "pricing",
    title: "Affordable Pricing",
    description: "Best rate guarantees with transparent pricing, zero hidden charges, and flexible payment options.",
    icon: "tag",
  },
  {
    id: "support",
    title: "24/7 Support",
    description: "Dedicated travel assistance available round-the-clock throughout your trip from start to finish.",
    icon: "headphones",
  },
];

const iconMap = {
  shield: ShieldCheck,
  compass: Compass,
  tag: Tag,
  headphones: Headphones,
};

type WhyChooseUsProps = {
  benefits?: FeatureItem[];
  className?: string;
};

export function WhyChooseUs({ benefits = defaultBenefits, className }: WhyChooseUsProps) {
  return (
    <section className={className}>
      <Container>
        <SectionTitle
          eyebrow="The GoYatrio Advantage"
          title="Why Choose GoYatrio"
          description="We take the hassle out of travel planning so you can focus on making lifelong memories."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon];
            return (
              <MotionDiv
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="flex h-full flex-col p-6 transition-all duration-200 hover-lift hover:border-primary/40">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
                </Card>
              </MotionDiv>
            );
          })}
        </div>
      </Container>
    </section>
  );
}