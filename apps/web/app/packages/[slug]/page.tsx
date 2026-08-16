import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, CheckCircle2, XCircle, ImageIcon, Hotel, Utensils, Car, Clock, ArrowRight, Star, Building2 } from "lucide-react";
import { Container } from "@/components/common/container";
import { Badge } from "@/components/common/badge";
import { Card } from "@/components/common/card";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";
import { CardMedia } from "@/components/cards/card-media";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PackageInquiryForm } from "./package-inquiry-form";

type Activity = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  timing?: string | null;
};

type ItineraryDay = {
  id: string;
  dayNumber: number;
  sortOrder: number;
  title: string;
  description: string;
  city?: string | null;
  hotel?: string | null;
  meals?: string | null;
  transfers?: string | null;
  notes?: string | null;
  activities?: Activity[];
};

type Itinerary = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  isDefault: boolean;
  days: ItineraryDay[];
};

type PackageHotel = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  city: string;
  hotelCategory: string;
  starRating: number;
  featured: boolean;
  images: { id: string; imageUrl: string }[];
  amenities: { id: string; name: string }[];
  roomTypes: { id: string; priceFrom: number }[];
};

type PackageDetail = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  destinationId: string;
  durationDays: number;
  durationNights: number;
  priceFrom: number | string;
  currency: string;
  packageType: string;
  inclusions: string[];
  exclusions: string[];
  featuredImage: string | null;
  galleryImages: string[];
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  destination: {
    id: string;
    name: string;
    slug: string;
    country: string;
    state: string | null;
  };
  itineraries: Itinerary[];
  hotels: PackageHotel[];
};

async function getPackage(slug: string): Promise<PackageDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/packages/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = await response.json();
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!pkg) {
    return { title: "Package Not Found | GoYatrio" };
  }

  const title = pkg.metaTitle ?? `${pkg.title} (${pkg.durationDays}D/${pkg.durationNights}N) | GoYatrio`;
  const description =
    pkg.metaDescription ??
    `${pkg.shortDescription} Book ${pkg.title} with GoYatrio. Best price starting from ${pkg.priceFrom} ${pkg.currency}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/packages/${pkg.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      url: `${baseUrl}/packages/${pkg.slug}`,
      images: pkg.featuredImage
        ? [{ url: pkg.featuredImage, alt: pkg.title }]
        : undefined,
    },
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const pkg = await getPackage(slug);

  if (!pkg) {
    notFound();
  }

  const gallery = pkg.galleryImages.length > 0
    ? pkg.galleryImages
    : pkg.featuredImage
      ? [pkg.featuredImage]
      : [];

  const activeItinerary = pkg.itineraries.find((i) => i.isDefault) ?? pkg.itineraries[0];

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-primary">
        {pkg.featuredImage ? (
          <>
            <Image
              src={pkg.featuredImage}
              alt={pkg.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-800 to-secondary" aria-hidden="true" />
        )}

        <Container className="relative flex min-h-[26rem] flex-col justify-end py-14 tablet:min-h-[30rem]">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="accent">{pkg.packageType}</Badge>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90">
              <MapPin className="size-4 text-accent" />
              {pkg.destination.name}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90">
              <Calendar className="size-4 text-accent" />
              {pkg.durationDays} Days / {pkg.durationNights} Nights
            </span>
          </div>

          <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-white tablet:text-5xl">
            {pkg.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/85 tablet:text-lg">
            {pkg.shortDescription}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <Price amount={Number(pkg.priceFrom)} per="per person" className="text-white" size="lg" />
          </div>
        </Container>
      </section>

      {/* Main Content Layout */}
      <section className="py-12 tablet:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-10 desktop:grid-cols-3">
            {/* Main Package Details Column */}
            <div className="desktop:col-span-2 space-y-10">
              {/* Overview */}
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Tour Overview</h2>
                <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {pkg.description}
                </p>
              </div>

              {/* Inclusions & Exclusions */}
              {(pkg.inclusions.length > 0 || pkg.exclusions.length > 0) ? (
                <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
                  {pkg.inclusions.length > 0 ? (
                    <Card className="p-6 border-l-4 border-l-success">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-success shrink-0" />
                        Inclusions
                      </h3>
                      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                        {pkg.inclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-success mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ) : null}

                  {pkg.exclusions.length > 0 ? (
                    <Card className="p-6 border-l-4 border-l-error">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <XCircle className="size-5 text-error shrink-0" />
                        Exclusions
                      </h3>
                      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                        {pkg.exclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-error mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ) : null}
                </div>
              ) : null}

              {/* Day by Day Itinerary Accordion / Timeline */}
              {activeItinerary && activeItinerary.days.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">Day-by-Day Itinerary</h2>
                      <p className="text-xs text-muted-foreground mt-1">{activeItinerary.title}</p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="gap-1">
                      <Link href={`/itineraries/${activeItinerary.slug}`}>
                        Full Timeline
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {activeItinerary.days.map((day) => (
                      <Card key={day.id} className="p-6 border border-border bg-card shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary font-mono">
                              Day {day.dayNumber}
                            </span>
                            <h3 className="text-lg font-semibold text-foreground">{day.title}</h3>
                          </div>
                          {day.city ? (
                            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded">
                              {day.city}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground mt-2">{day.description}</p>

                        {/* Activities */}
                        {day.activities && day.activities.length > 0 ? (
                          <div className="mt-4 pt-3 border-t border-border">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                              Key Activities
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {day.activities.map((act) => (
                                <Badge key={act.id} variant="secondary" className="text-xs">
                                  {act.title} {act.timing ? `(${act.timing})` : ""}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {(day.hotel || day.meals || day.transfers) ? (
                          <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
                            {day.hotel ? (
                              <span className="flex items-center gap-1">
                                <Hotel className="size-3.5 text-primary" />
                                <strong>Stay:</strong> {day.hotel}
                              </span>
                            ) : null}
                            {day.meals ? (
                              <span className="flex items-center gap-1">
                                <Utensils className="size-3.5 text-primary" />
                                <strong>Meals:</strong> {day.meals}
                              </span>
                            ) : null}
                            {day.transfers ? (
                              <span className="flex items-center gap-1">
                                <Car className="size-3.5 text-primary" />
                                <strong>Transfers:</strong> {day.transfers}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Associated Hotels */}
              {pkg.hotels.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Building2 className="size-6 text-primary" />
                    Handpicked Stays in This Package
                  </h2>
                  <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2">
                    {pkg.hotels.map((hotel) => {
                      const minPrice = hotel.roomTypes[0]?.priceFrom ?? 0;
                      const imageUrl = hotel.images[0]?.imageUrl ?? "";
                      return (
                        <Card key={hotel.id} className="overflow-hidden border border-border bg-card shadow-sm transition-all hover:shadow-md">
                          <div className="relative aspect-[16/9]">
                            {imageUrl ? (
                              <CardMedia src={imageUrl} alt={hotel.name} className="h-full w-full" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                                <Building2 className="size-6" />
                              </div>
                            )}
                            {hotel.featured ? <Badge variant="accent" className="absolute left-3 top-3">Featured</Badge> : null}
                          </div>
                          <div className="p-5">
                            <div className="flex items-center justify-between gap-2">
                              <Link href={`/hotels/${hotel.slug}`} className="text-lg font-semibold text-foreground hover:text-primary">
                                {hotel.name}
                              </Link>
                              <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                                {Array.from({ length: hotel.starRating }).map((_, idx) => (
                                  <Star key={idx} className="size-3 fill-amber-500" />
                                ))}
                              </div>
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="size-3.5 text-primary" />
                              {hotel.city} • {hotel.hotelCategory}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{hotel.shortDescription}</p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {hotel.amenities.slice(0, 3).map((am) => (
                                <Badge key={am.id} variant="outline" className="text-[11px] font-normal">{am.name}</Badge>
                              ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                              {minPrice ? (
                                <div>
                                  <span className="block text-[11px] text-muted-foreground">From / night</span>
                                  <Price amount={minPrice} size="sm" />
                                </div>
                              ) : null}
                              <Button asChild size="sm" variant="outline" className="gap-1">
                                <Link href={`/hotels/${hotel.slug}`}>
                                  View Hotel
                                  <ArrowRight className="size-3.5" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Photo Gallery */}
              {gallery.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-5">Tour Gallery</h2>
                  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
                    {gallery.map((src, idx) => (
                      <CardMedia
                        key={`${src}-${idx}`}
                        src={src}
                        alt={`${pkg.title} photo ${idx + 1}`}
                        icon={ImageIcon}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Sticky Inquiry Form Sidebar */}
            <aside>
              <div className="sticky top-24">
                <Card className="p-6 border border-border bg-card shadow-md">
                  <h3 className="text-xl font-semibold text-foreground mb-1">Book / Inquire Tour</h3>
                  <p className="text-xs text-muted-foreground mb-5">
                    Fill in your details below. Our travel expert will contact you within 30 minutes with a customized quote.
                  </p>

                  {/* Package Inquiry CTA Form Component */}
                  <PackageInquiryForm
                    packageId={pkg.id}
                    packageTitle={pkg.title}
                    destinationName={pkg.destination.name}
                  />
                </Card>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
