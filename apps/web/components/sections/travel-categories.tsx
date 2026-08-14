import Link from "next/link";
import { Sun, Mountain, Crown, Users, Heart, Compass, ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Card } from "@/components/common/card";
import { MotionDiv } from "@/components/animation/motion";

export type CategoryItem = {
  id: string;
  name: string;
  description: string;
  icon: "pilgrimage" | "adventure" | "luxury" | "family" | "honeymoon" | "weekend";
  count?: string;
  href: string;
};

const defaultCategories: CategoryItem[] = [
  {
    id: "pilgrimage",
    name: "Pilgrimage",
    description: "Sacred spiritual tours across India's holiest temples, shrines, and heritage sites.",
    icon: "pilgrimage",
    count: "45+ Packages",
    href: "/packages?category=pilgrimage",
  },
  {
    id: "adventure",
    name: "Adventure",
    description: "Trekking, river rafting, camping, and thrilling outdoor expeditions for adrenaline seekers.",
    icon: "adventure",
    count: "30+ Packages",
    href: "/packages?category=adventure",
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "5-star royal stays, private transfers, and bespoke high-end travel experiences.",
    icon: "luxury",
    count: "20+ Packages",
    href: "/packages?category=luxury",
  },
  {
    id: "family",
    name: "Family",
    description: "Wholesome, hassle-free vacations designed for comfort and enjoyment across all ages.",
    icon: "family",
    count: "60+ Packages",
    href: "/packages?category=family",
  },
  {
    id: "honeymoon",
    name: "Honeymoon",
    description: "Romantic, intimate escapes in scenic backwaters, hill stations, and beach resorts.",
    icon: "honeymoon",
    count: "35+ Packages",
    href: "/packages?category=honeymoon",
  },
  {
    id: "weekend",
    name: "Weekend Getaways",
    description: "Quick 2-3 day refreshing trips away from city hustle to rejuvenate your spirit.",
    icon: "weekend",
    count: "50+ Packages",
    href: "/packages?category=weekend",
  },
];

const iconMap = {
  pilgrimage: Sun,
  adventure: Mountain,
  luxury: Crown,
  family: Users,
  honeymoon: Heart,
  weekend: Compass,
};

type TravelCategoriesProps = {
  categories?: CategoryItem[];
  className?: string;
};

export function TravelCategories({ categories = defaultCategories, className }: TravelCategoriesProps) {
  return (
    <section className={className}>
      <Container>
        <SectionTitle
          eyebrow="Explore By Interest"
          title="Travel Categories"
          description="Find the perfect journey tailored to your personal travel style and preference."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = iconMap[category.icon];
            return (
              <MotionDiv
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link href={category.href} className="group block h-full">
                  <Card className="flex h-full flex-col justify-between p-6 transition-all duration-200 hover-lift group-hover:border-primary/50 group-hover:shadow-md">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                          <Icon className="size-6" aria-hidden="true" />
                        </div>
                        {category.count ? (
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {category.count}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-5 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <span>Explore {category.name}</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </div>
                  </Card>
                </Link>
              </MotionDiv>
            );
          })}
        </div>
      </Container>
    </section>
  );
}