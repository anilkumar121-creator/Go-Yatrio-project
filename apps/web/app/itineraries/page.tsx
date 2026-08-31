import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { StaggerContainer, StaggerItem } from "@/components/animation/motion";

import { resolvePageMetadata } from "@/components/seo/seo";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata({
    pageType: "itineraries",
    fallbackTitle: "Custom Travel Itineraries | GoYatrio",
    fallbackDescription:
      "Explore curated day-by-day travel itineraries with detailed activities, hotel stays, meal plans, and transfers.",
    path: "/itineraries",
  });
}

type ItineraryListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isDefault: boolean;
  package?: {
    id: string;
    title: string;
    slug: string;
    durationDays: number;
    durationNights: number;
    priceFrom: number | string;
    currency: string;
    destination?: {
      name: string;
    };
  };
  days: {
    id: string;
    dayNumber: number;
    title: string;
    city: string | null;
    hotel: string | null;
    meals: string | null;
    activities: { title: string }[];
  }[];
};

export const revalidate = 300; // 5-minute ISR

async function getItineraries(): Promise<ItineraryListItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/itineraries?take=50`, {
      next: { revalidate: 300, tags: ["itineraries"] },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    return payload?.data ?? [];
  } catch {
    return [];
  }
}

export default async function PublicItinerariesPage() {
  const itineraries = await getItineraries();

  return (
    <PageWrapper>
      <section className="bg-primary/5 py-12 tablet:py-16 border-b border-border">
        <Container>
          <SectionTitle
            title="Handcrafted Day-by-Day Itineraries"
            description="Browse complete travel schedules designed by regional travel experts with hotel stays, activities, and transfers."
            align="left"
          />
        </Container>
      </section>

      <section className="py-12 tablet:py-16">
        <Container>
          {itineraries.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="mx-auto size-12 text-muted-foreground/60 mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No Itineraries Available</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Our team is actively crafting new holiday itineraries. Please check back shortly or
                request a custom plan.
              </p>
              <Button asChild className="mt-6" size="sm">
                <Link href="/packages">Explore Holiday Packages</Link>
              </Button>
            </Card>
          ) : (
            <StaggerContainer className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
              {itineraries.map((itin) => (
                <StaggerItem key={itin.id}>
                  <Card className="flex h-full flex-col justify-between overflow-hidden border border-border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="accent" className="font-mono text-xs">
                          {itin.days.length} Days Timeline
                        </Badge>
                        {itin.package?.destination?.name ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <MapPin className="size-3.5 text-primary" />
                            {itin.package.destination.name}
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-foreground leading-snug hover:text-primary transition-colors">
                          <Link href={`/itineraries/${itin.slug}`}>{itin.title}</Link>
                        </h2>
                        {itin.package?.title ? (
                          <p className="text-xs font-medium text-primary mt-1">
                            Package: {itin.package.title}
                          </p>
                        ) : null}
                      </div>

                      {itin.description ? (
                        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {itin.description}
                        </p>
                      ) : null}

                      {/* Timeline Highlights */}
                      <div className="space-y-2 border-t border-border pt-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Sample Day Schedule:
                        </span>
                        <ul className="space-y-1.5 text-xs text-foreground">
                          {itin.days.slice(0, 3).map((day) => (
                            <li key={day.id} className="flex items-start gap-2">
                              <span className="font-bold text-primary shrink-0">
                                Day {day.dayNumber}:
                              </span>
                              <span className="truncate">{day.title}</span>
                            </li>
                          ))}
                          {itin.days.length > 3 ? (
                            <li className="text-xs font-medium text-muted-foreground italic">
                              + {itin.days.length - 3} more days planned
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      {itin.package?.priceFrom ? (
                        <div>
                          <span className="block text-xs text-muted-foreground">Starting from</span>
                          <Price amount={Number(itin.package.priceFrom)} size="sm" />
                        </div>
                      ) : (
                        <div />
                      )}
                      <Button asChild size="sm" variant="outline" className="group">
                        <Link
                          href={`/itineraries/${itin.slug}`}
                          className="inline-flex items-center gap-1.5"
                        >
                          View Timeline
                          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </Container>
      </section>
    </PageWrapper>
  );
}
