import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Button } from "@/components/common/button";
import { PackageCard } from "@/components/cards/package-card";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { EmptyState } from "@/components/admin/empty-state";
import { StaggerContainer, StaggerItem } from "@/components/animation/motion";

import { resolvePageMetadata } from "@/components/seo/seo";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata({
    pageType: "packages",
    fallbackTitle: "All Tour Packages | GoYatrio",
    fallbackDescription:
      "Explore best-selling all-inclusive tour packages across India with GoYatrio. Customized holiday itineraries for couples, families, and solo travelers.",
    path: "/packages",
  });
}

type PackageSummary = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  durationDays: number;
  durationNights: number;
  priceFrom: number | string;
  discountedPrice: number | string | null;
  effectivePrice: number | string;
  originalPrice: number | string;
  priceBadge: string | null;
  currency: string;
  packageType: string;
  featuredImage: string | null;
  featuredMedia: { secureUrl: string; altText?: string | null } | null;
  featured: boolean;
  availability: "AVAILABLE" | "LIMITED_SEATS" | "SOLD_OUT" | "UPCOMING";
  availableSeats: number;
  destination?: { name: string; slug: string };
};

export const revalidate = 300; // 5-minute ISR

async function getPackages(): Promise<PackageSummary[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/packages?take=50`, {
      next: { revalidate: 300, tags: ["packages"] },
    });

    if (!response.ok) return [];

    const payload = await response.json();
    return payload?.data?.data ?? [];
  } catch {
    return [];
  }
}

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <PageWrapper>
      <section className="bg-muted/20 py-16 tablet:py-20">
        <Container>
          <SectionTitle
            eyebrow="Handcrafted Holidays"
            title="All Tour Packages"
            description="Browse all-inclusive travel packages curated by local travel experts with best price guarantees."
            align="center"
          />
        </Container>
      </section>

      <section className="py-14 tablet:py-20">
        <Container>
          {packages.length === 0 ? (
            <EmptyState
              title="No tour packages available"
              description="Check back soon Ã¢â‚¬â€  we are adding exciting new packages daily."
            />
          ) : (
            <StaggerContainer className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
              {packages.map((pkg) => (
                <StaggerItem key={pkg.id}>
                  <PackageCard
                    title={pkg.title}
                    destination={pkg.destination?.name ?? "India"}
                    duration={`${pkg.durationDays}D / ${pkg.durationNights}N`}
                    price={Number(pkg.effectivePrice ?? pkg.priceFrom)}
                    originalPrice={
                      Number(pkg.effectivePrice ?? pkg.priceFrom) <
                      Number(pkg.originalPrice ?? pkg.priceFrom)
                        ? Number(pkg.originalPrice ?? pkg.priceFrom)
                        : undefined
                    }
                    badge={pkg.priceBadge ?? (pkg.featured ? "Featured" : pkg.packageType)}
                    availability={pkg.availability ?? "AVAILABLE"}
                    availableSeats={pkg.availableSeats ?? 0}
                    image={
                      (pkg.featuredMedia?.secureUrl ?? pkg.featuredImage)
                        ? {
                            src: pkg.featuredMedia?.secureUrl ?? pkg.featuredImage ?? "",
                            alt: pkg.title,
                          }
                        : undefined
                    }
                    ctaHref={`/packages/${pkg.slug}`}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          <div className="mt-12 flex justify-center">
            <Button asChild size="lg">
              <Link href="/destinations" className="inline-flex items-center gap-1.5">
                Explore All Destinations
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
