import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  Fuel,
  Snowflake,
  Users,
  Luggage,
  IndianRupee,
  MapPin,
  CheckCircle2,
  Clock,
  CalendarDays,
} from "lucide-react";
import { Container } from "@/components/common/container";
import { Badge } from "@/components/common/badge";
import { Card } from "@/components/common/card";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CardMedia } from "@/components/cards/card-media";
import { CabInquiryForm } from "@/components/cabs/cab-inquiry-form";

type CabDetail = {
  id: string;
  vehicleName: string;
  slug: string;
  vehicleType: string;
  description: string;
  capacity: number;
  luggageCapacity: number;
  ac: boolean;
  fuelType: string;
  driverAllowance: number;
  baseFare: number;
  extraKmCharge: number;
  nightCharge: number;
  priceFrom: number;
  currency: string;
  image: string | null;
  featuredMedia: { secureUrl: string; altText?: string | null } | null;
  galleryImages: string[];
  galleryMedia: { secureUrl: string }[] | null;
  tripTypes: string[];
  featured: boolean;
  destination?: { id: string; name: string; slug: string };
  amenities: { id: string; name: string }[];
  packages: { id: string; title: string; slug: string; durationDays: number; priceFrom: number }[];
};

type RelatedCab = {
  id: string;
  vehicleName: string;
  slug: string;
  vehicleType: string;
  capacity: number;
  priceFrom: number;
  image: string | null;
};

async function getCab(slug: string): Promise<CabDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/cabs/${slug}`, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

async function getRelatedCabs(destinationSlug: string, excludeId: string): Promise<RelatedCab[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/cabs/destination/${destinationSlug}?take=3`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload?.data ?? []).filter((c: RelatedCab) => c.id !== excludeId).slice(0, 3);
  } catch {
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cab = await getCab(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!cab) {
    return { title: "Cab Not Found | GoYatrio" };
  }

  const title = `${cab.vehicleName} | ${cab.vehicleType} Cab Rental | GoYatrio`;
  const description = `${cab.description} Check tariffs, seating, features, and availability for ${cab.vehicleName}.`;
  const imageUrl = cab.image ?? cab.galleryImages[0] ?? null;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/cabs/${cab.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      url: `${baseUrl}/cabs/${cab.slug}`,
      images: imageUrl ? [{ url: imageUrl, alt: cab.vehicleName }] : undefined,
    },
  };
}

export default async function PublicCabDetailPage({ params }: Props) {
  const { slug } = await params;
  const cab = await getCab(slug);

  if (!cab) {
    notFound();
  }

  const relatedCabs = cab.destination ? await getRelatedCabs(cab.destination.slug, cab.id) : [];
  const gallery = [
    cab.featuredMedia?.secureUrl,
    ...(cab.galleryMedia ?? []).map((m) => m.secureUrl),
    cab.image,
    ...cab.galleryImages,
  ].filter((url): url is string => typeof url === "string" && url.length > 0);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cab.vehicleName,
    description: cab.description,
    category: `Vehicle: ${cab.vehicleType}`,
    image: gallery[0] ?? undefined,
    offers: {
      "@type": "Offer",
      price: Number(cab.priceFrom),
      priceCurrency: cab.currency ?? "INR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="relative overflow-hidden bg-primary">
        {gallery[0] ? (
          <div className="relative">
            <CardMedia src={gallery[0]} alt={cab.vehicleName} className="w-full h-[22rem] tablet:h-[26rem]" />
            <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-800 to-secondary" aria-hidden="true" />
        )}

        <Container className="relative flex min-h-[18rem] flex-col justify-end py-10 tablet:min-h-[20rem]">
          <div className="mb-4">
            <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white gap-1">
              <Link href="/cabs">
                <ArrowLeft className="size-4" />
                Back to Cabs
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="accent">{cab.vehicleType}</Badge>
            {cab.destination ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90">
                <MapPin className="size-4 text-accent" />
                {cab.destination.name}
              </span>
            ) : null}
            {cab.ac ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90">
                <Snowflake className="size-4 text-accent" />
                Air Conditioned
              </span>
            ) : null}
          </div>

          <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-white tablet:text-5xl">
            {cab.vehicleName}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/85 tablet:text-lg">{cab.description}</p>

          <div className="mt-6 flex items-center gap-4">
            <Price amount={Number(cab.priceFrom)} per="rental starting" className="text-white" size="lg" />
          </div>
        </Container>
      </section>

      <section className="py-12 tablet:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-10 desktop:grid-cols-3">
            <div className="desktop:col-span-2 space-y-10">
              {gallery.length > 1 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-5">Cab Gallery</h2>
                  <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3">
                    {gallery.map((src, idx) => (
                      <CardMedia key={`${src}-${idx}`} src={src} alt={`${cab.vehicleName} photo ${idx + 1}`} className="aspect-[4/3]" />
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Vehicle Overview</h2>
                <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
                  <Card className="p-4 text-center bg-card">
                    <Users className="mx-auto size-5 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-foreground">{cab.capacity} Passengers</p>
                    <p className="text-[11px] text-muted-foreground">Seating Capacity</p>
                  </Card>
                  <Card className="p-4 text-center bg-card">
                    <Luggage className="mx-auto size-5 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-foreground">{cab.luggageCapacity} Bags</p>
                    <p className="text-[11px] text-muted-foreground">Luggage Space</p>
                  </Card>
                  <Card className="p-4 text-center bg-card">
                    <Fuel className="mx-auto size-5 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-foreground">{cab.fuelType}</p>
                    <p className="text-[11px] text-muted-foreground">Fuel Type</p>
                  </Card>
                  <Card className="p-4 text-center bg-card">
                    <Snowflake className="mx-auto size-5 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-foreground">{cab.ac ? "Yes" : "No"}</p>
                    <p className="text-[11px] text-muted-foreground">Air Conditioning</p>
                  </Card>
                </div>
              </div>

              {/* Pricing Details */}
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Pricing & Charges</h2>
                <Card className="p-6 space-y-3 border border-border bg-card">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base Fare</span>
                    <Price amount={Number(cab.baseFare)} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Extra KM Charge</span>
                    <span className="font-semibold text-foreground">?{Number(cab.extraKmCharge)} / km</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Night Charge</span>
                    <Price amount={Number(cab.nightCharge)} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Driver Allowance (per day)</span>
                    <Price amount={Number(cab.driverAllowance)} size="sm" />
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="font-semibold text-foreground">Rental Starting From</span>
                    <Price amount={Number(cab.priceFrom)} size="md" />
                  </div>
                </Card>
              </div>

              {/* Trip Types */}
              {cab.tripTypes.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Available Trip Types</h2>
                  <div className="flex flex-wrap gap-2">
                    {cab.tripTypes.map((trip) => (
                      <Badge key={trip} variant="secondary" className="text-xs">{trip}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Amenities */}
              {cab.amenities.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Vehicle Features</h2>
                  <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
                    {cab.amenities.map((am) => (
                      <div key={am.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/20 p-3 text-sm font-medium text-foreground">
                        <CheckCircle2 className="size-4 text-success shrink-0" />
                        {am.name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Packages */}
              {cab.packages.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Popular Tour Packages Using This Cab</h2>
                  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                    {cab.packages.map((pkg) => (
                      <Card key={pkg.id} className="p-5 border border-border bg-card shadow-sm">
                        <Link href={`/packages/${pkg.slug}`} className="font-semibold text-foreground hover:text-primary">
                          {pkg.title}
                        </Link>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{pkg.durationDays} Days Tour</span>
                          <Price amount={Number(pkg.priceFrom)} size="sm" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Travel Notes */}
              <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <p className="flex items-center gap-2 font-semibold">
                  <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                  Booking Notes
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-3.5" />
                  Night charges apply between 10 PM and 6 AM.
                </p>
                <p className="flex items-center gap-2">
                  <IndianRupee className="size-3.5" />
                  Final fare may vary by route, fuel price, and toll taxes.
                </p>
              </div>
            </div>

            <aside>
              <div className="sticky top-24">
                <Card className="p-6 border border-border bg-card shadow-md">
                  <h3 className="text-xl font-semibold text-foreground mb-1">Get Instant Quote</h3>
                  <p className="text-xs text-muted-foreground mb-5">
                    Send us your trip details for {cab.vehicleName} and receive exclusive rates.
                  </p>
                  <CabInquiryForm
                    cabId={cab.id}
                    cabName={cab.vehicleName}
                    destinationName={cab.destination?.name}
                  />
                </Card>
              </div>
            </aside>
          </div>

          {relatedCabs.length > 0 ? (
            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                More Cabs {cab.destination ? `in ${cab.destination.name}` : "Available"}
              </h2>
              <div className="grid grid-cols-1 gap-6 tablet:grid-cols-3">
                {relatedCabs.map((rel) => (
                  <Card key={rel.id} className="overflow-hidden border border-border bg-card shadow-sm transition-all hover:shadow-md">
                    <div className="relative aspect-[16/10]">
                      {rel.image ? (
                        <CardMedia src={rel.image} alt={rel.vehicleName} className="h-full w-full" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          <Car className="size-6" />
                        </div>
                      )}
                      <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                        {rel.vehicleType}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-foreground hover:text-primary">
                        <Link href={`/cabs/${rel.slug}`}>{rel.vehicleName}</Link>
                      </h3>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="size-3.5 text-primary" />
                          {rel.capacity} seats
                        </span>
                        <Price amount={Number(rel.priceFrom)} size="sm" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </PageWrapper>
  );
}
