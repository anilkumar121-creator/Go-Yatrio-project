import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Button } from "@/components/common/button";
import { DestinationCard } from "@/components/cards/destination-card";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { EmptyState } from "@/components/admin/empty-state";
import { StaggerContainer, StaggerItem } from "@/components/animation/motion";

import { resolvePageMetadata } from "@/components/seo/seo";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata({
    pageType: "destinations",
    fallbackTitle: "Explore Travel Destinations | GoYatrio",
    fallbackDescription:
      "Discover India's most beautiful travel destinations with GoYatrio. Explore handcrafted tour packages, hotels, and experiences.",
    path: "/destinations",
  });
}

type DestinationSummary = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  state: string | null;
  country: string;
  featuredImage: string | null;
  featuredMedia: { secureUrl: string; altText?: string | null } | null;
  featured: boolean;
};

export const revalidate = 300; // 5-minute ISR

async function getDestinations(): Promise<DestinationSummary[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/destinations?take=50`, {
      next: { revalidate: 300, tags: ["destinations"] },
    });

    if (!response.ok) return [];

    const payload = await response.json();
    return payload?.data?.data ?? [];
  } catch {
    return [];
  }
}

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <PageWrapper>
      <section className="bg-muted/20 py-16 tablet:py-20">
        <Container>
          <SectionTitle
            eyebrow="Explore With GoYatrio"
            title="Travel Destinations"
            description="Browse our handpicked destinations across India and plan your next unforgettable journey."
            align="center"
          />
        </Container>
      </section>

      <section className="py-14 tablet:py-20">
        <Container>
          {destinations.length === 0 ? (
            <EmptyState
              title="No destinations yet"
              description="Check back soon â€” we are adding new destinations regularly."
            />
          ) : (
            <StaggerContainer className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
              {destinations.map((destination) => (
                <StaggerItem key={destination.id}>
                  <DestinationCard
                    name={destination.name}
                    location={destination.state ?? destination.country}
                    description={destination.shortDescription}
                    image={
                      (destination.featuredMedia?.secureUrl ?? destination.featuredImage)
                        ? {
                            src:
                              destination.featuredMedia?.secureUrl ??
                              destination.featuredImage ??
                              "",
                            alt: destination.name,
                          }
                        : undefined
                    }
                    badge={destination.featured ? "Featured" : undefined}
                    ctaLabel="View Details"
                    ctaHref={`/destinations/${destination.slug}`}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          <div className="mt-12 flex justify-center">
            <Button asChild size="lg">
              <Link href="/packages" className="inline-flex items-center gap-1.5">
                Explore Tour Packages
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
