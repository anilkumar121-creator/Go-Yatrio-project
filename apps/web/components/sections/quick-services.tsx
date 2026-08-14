import Link from "next/link";
import { Compass, Hotel, Car, Plane, ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { MotionDiv } from "@/components/animation/motion";

export type QuickServiceItem = {
  id: string;
  title: string;
  description: string;
  icon: "compass" | "hotel" | "car" | "plane";
  href?: string;
  comingSoon?: boolean;
};

const defaultServices: QuickServiceItem[] = [
  {
    id: "packages",
    title: "Tour Packages",
    description: "Curated domestic and international holiday packages tailored to your dream itinerary.",
    icon: "compass",
    href: "/packages",
  },
  {
    id: "hotels",
    title: "Hotel Booking",
    description: "Handpicked premium resorts, luxury stays, and budget-friendly hotels with instant confirmation.",
    icon: "hotel",
    href: "/hotels",
  },
  {
    id: "cabs",
    title: "Cab Booking",
    description: "Reliable outstation cabs, airport transfers, and local rentals with professional drivers.",
    icon: "car",
    href: "/cabs",
  },
  {
    id: "flights",
    title: "Flight Booking",
    description: "Best fare flight search engine and instant booking system for domestic & international routes.",
    icon: "plane",
    comingSoon: true,
  },
];

const iconMap = {
  compass: Compass,
  hotel: Hotel,
  car: Car,
  plane: Plane,
};

type QuickServicesProps = {
  services?: QuickServiceItem[];
  className?: string;
};

export function QuickServices({ services = defaultServices, className }: QuickServicesProps) {
  return (
    <section className={className}>
      <Container>
        <SectionTitle
          eyebrow="Our Offerings"
          title="Quick Travel Services"
          description="Everything you need for a seamless and memorable travel experience in one place."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon];
            return (
              <MotionDiv
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="group relative flex h-full flex-col justify-between p-6 transition-all duration-200 hover-lift hover:border-primary/50">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="size-6" aria-hidden="true" />
                      </div>
                      {service.comingSoon ? (
                        <Badge variant="accent">Coming Soon</Badge>
                      ) : null}
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-foreground">{service.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    {service.comingSoon ? (
                      <span className="text-sm font-medium text-muted-foreground italic">
                        Launching Soon
                      </span>
                    ) : service.href ? (
                      <Link
                        href={service.href}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                      >
                        Explore Service
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </Card>
              </MotionDiv>
            );
          })}
        </div>
      </Container>
    </section>
  );
}