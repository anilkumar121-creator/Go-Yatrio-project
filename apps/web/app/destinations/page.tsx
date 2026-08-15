import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Button } from "@/components/common/button";
import { DestinationCard } from "@/components/cards/destination-card";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { EmptyState } from "@/components/admin/empty-state";

export const metadata: Metadata = {
  title: "Explore Travel Destinations | GoYatrio",
  description:
    "Discover India's most beautiful travel destinations with GoYatrio. Explore handcrafted tour packages, hotels, and experiences.",
  openGraph: {
    title: "Explore Travel Destinations | GoYatrio",
    description:
      "Discover India's most beautiful travel destinations with GoYatrio. Explore handcrafted tour packages, hotels, and experiences.",
    type: "website",
    locale: "en_IN",
  },
};

type DestinationSummary = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  state: string | null;
  country: string;
  featuredImage: string | null;
  featured: boolean;
};

async function getDestinations(): Promise<DestinationSummary[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/destinations?take=50`, {
      cache: "no-store",
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
              description="Check back soon — we are adding new destinations regularly."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  name={destination.name}
                  location={destination.state ?? destination.country}
                  description={destination.shortDescription}
                  image={
                    destination.featuredImage
                      ? { src: destination.featuredImage, alt: destination.name }
                      : undefined
                  }
                  badge={destination.featured ? "Featured" : undefined}
                  ctaLabel="View Details"
                  ctaHref={`/destinations/${destination.slug}`}
                />
              ))}
            </div>
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