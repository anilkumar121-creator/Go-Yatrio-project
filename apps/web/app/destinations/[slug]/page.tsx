import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ImageIcon, ArrowRight, Calendar, IndianRupee, Star, Building2 } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { Card } from "@/components/common/card";
import { Price } from "@/components/common/price";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CardMedia } from "@/components/cards/card-media";

type DestinationHotel = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  city: string;
  hotelCategory: string;
  starRating: number;
  featured: boolean;
  images: { id: string; imageUrl: string }[];
  roomTypes: { id: string; priceFrom: number }[];
};

type DestinationDetail = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  state: string | null;
  country: string;
  featuredImage: string | null;
  galleryImages: string[];
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  packages: {
    id: string;
    title: string;
    slug: string;
    durationDays: number;
    durationNights: number;
    priceFrom: number | string;
    currency: string;
  }[];
  hotels: DestinationHotel[];
};

async function getDestination(slug: string): Promise<DestinationDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/destinations/${slug}`, {
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
  const destination = await getDestination(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!destination) {
    return { title: "Destination Not Found | GoYatrio" };
  }

  const title = destination.metaTitle ?? `${destination.name} Tour Packages | GoYatrio`;
  const description =
    destination.metaDescription ??
    `${destination.name} travel guide. Explore ${destination.name} with GoYatrio tour packages, hotels, and experiences.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/destinations/${destination.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      url: `${baseUrl}/destinations/${destination.slug}`,
      images: destination.featuredImage
        ? [{ url: destination.featuredImage, alt: destination.name }]
        : undefined,
    },
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  const destination = await getDestination(slug);

  if (!destination) {
    notFound();
  }

  const gallery = destination.galleryImages.length > 0
    ? destination.galleryImages
    : destination.featuredImage
      ? [destination.featuredImage]
      : [];

  const featuredHotels = destination.hotels.filter((h) => h.featured);
  const otherHotels = destination.hotels.filter((h) => !h.featured);

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-primary">
        {destination.featuredImage ? (
          <>
            <Image
              src={destination.featuredImage}
              alt={destination.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-800 to-secondary" aria-hidden="true" />
        )}

        <Container className="relative flex min-h-[24rem] flex-col justify-end py-14 tablet:min-h-[28rem]">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-accent" aria-hidden="true" />
            <p className="text-sm font-semibold uppercase tracking-widest text-white/90">
              {[destination.state, destination.country].filter(Boolean).join(", ")}
            </p>
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white tablet:text-5xl">
            {destination.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 tablet:text-lg">
            {destination.shortDescription}
          </p>
        </Container>
      </section>

      {/* Overview + Highlights */}
      <section className="py-14 tablet:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-10 tablet:grid-cols-3">
            <div className="tablet:col-span-2">
              <h2 className="text-2xl font-semibold text-foreground">Destination Overview</h2>
              <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">
                {destination.description.split("\n").filter(Boolean).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {destination.packages.length > 0 ? (
                <div className="mt-10">
                  <h2 className="text-2xl font-semibold text-foreground">Tour Packages in {destination.name}</h2>
                  <div className="mt-5 grid grid-cols-1 gap-5 tablet:grid-cols-2">
                    {destination.packages.map((pkg) => (
                      <Card key={pkg.id} className="p-5 hover-lift">
                        <h3 className="font-semibold text-foreground">{pkg.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3.5" aria-hidden="true" />
                            {pkg.durationDays}D / {pkg.durationNights}N
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <IndianRupee className="size-3.5" aria-hidden="true" />
                            From {Number(pkg.priceFrom).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <Link href={`/packages/${pkg.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80">
                          View Package
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Hotels in Destination */}
              {destination.hotels.length > 0 ? (
                <div className="mt-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="size-6 text-primary" />
                      Stay Options in {destination.name}
                    </h2>
                    <Button asChild variant="outline" size="sm" className="gap-1">
                      <Link href={`/hotels?destination=${destination.slug}`}>
                        View All Hotels
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>

                  {/* Featured Hotels */}
                  {featuredHotels.length > 0 ? (
                    <div className="mt-6">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Featured Stays</span>
                      <div className="mt-3 grid grid-cols-1 gap-5 tablet:grid-cols-2">
                        {featuredHotels.map((hotel) => (
                          <HotelCard key={hotel.id} hotel={hotel} />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {otherHotels.length > 0 ? (
                    <div className="mt-6">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">More Hotels</span>
                      <div className="mt-3 grid grid-cols-1 gap-5 tablet:grid-cols-2">
                        {otherHotels.map((hotel) => (
                          <HotelCard key={hotel.id} hotel={hotel} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Highlights sidebar */}
            <aside>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground">Quick Highlights</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Badge variant="accent" className="shrink-0">Region</Badge>
                    {destination.state ?? destination.country}
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="accent" className="shrink-0">Country</Badge>
                    {destination.country}
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="accent" className="shrink-0">Status</Badge>
                    {destination.featured ? "Featured Destination" : "Popular Destination"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="accent" className="shrink-0">Packages</Badge>
                    {destination.packages.length} Available
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="accent" className="shrink-0">Hotels</Badge>
                    {destination.hotels.length} Stays
                  </li>
                </ul>
                <Button asChild className="mt-6 w-full">
                  <Link href="/inquiry">Plan Your Trip</Link>
                </Button>
              </Card>
            </aside>
          </div>

          {/* Gallery */}
          {gallery.length > 0 ? (
            <div className="mt-14">
              <h2 className="text-2xl font-semibold text-foreground">Gallery</h2>
              <div className="mt-5 grid grid-cols-1 gap-5 tablet:grid-cols-2 desktop:grid-cols-3">
                {gallery.map((src, index) => (
                  <CardMedia
                    key={`${src}-${index}`}
                    src={src}
                    alt={`${destination.name} gallery image ${index + 1}`}
                    icon={ImageIcon}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </PageWrapper>
  );
}

function HotelCard({ hotel }: { hotel: DestinationHotel }) {
  const minPrice = hotel.roomTypes[0]?.priceFrom ?? 0;
  const imageUrl = hotel.images[0]?.imageUrl ?? "";

  return (
    <Card className="overflow-hidden border border-border bg-card shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-[16/10]">
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
          <div className="flex items-center gap-0.5 text-amber-500">
            {Array.from({ length: hotel.starRating }).map((_, idx) => (
              <Star key={idx} className="size-3 fill-amber-500" />
            ))}
          </div>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-primary" />
          {hotel.city}, {hotel.hotelCategory}
        </p>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{hotel.shortDescription}</p>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          {minPrice ? (
            <div>
              <span className="block text-[11px] text-muted-foreground">Starting from / night</span>
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
}
