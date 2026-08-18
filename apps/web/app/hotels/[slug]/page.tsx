import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, Bed, Users, Ruler, CheckCircle2, Building2, ArrowLeft } from "lucide-react";
import { Container } from "@/components/common/container";
import { Badge } from "@/components/common/badge";
import { Card } from "@/components/common/card";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CardMedia } from "@/components/cards/card-media";
import { HotelInquiryForm } from "@/components/hotels/hotel-inquiry-form";

type HotelImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};

type HotelAmenity = {
  id: string;
  name: string;
  icon: string | null;
};

type HotelRoomType = {
  id: string;
  roomName: string;
  roomDescription: string;
  maxGuests: number;
  bedType: string;
  roomSize: string | null;
  priceFrom: number;
};

type HotelDetail = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  destinationId: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  hotelCategory: string;
  starRating: number;
  featured: boolean;
  destination: {
    id: string;
    name: string;
    slug: string;
  };
  images: HotelImage[];
  featuredMedia: { secureUrl: string; altText?: string | null } | null;
  galleryMedia: { secureUrl: string }[] | null;
  amenities: HotelAmenity[];
  roomTypes: HotelRoomType[];
  packages: { id: string; title: string; slug: string; durationDays: number; priceFrom: number }[];
};

type RelatedHotel = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  city: string;
  hotelCategory: string;
  starRating: number;
  images: HotelImage[];
  featuredMedia: { secureUrl: string; altText?: string | null } | null;
  galleryMedia: { secureUrl: string }[] | null;
  roomTypes: HotelRoomType[];
};

async function getHotel(slug: string): Promise<HotelDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/hotels/${slug}`, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

async function getRelatedHotels(destinationSlug: string, excludeId: string): Promise<RelatedHotel[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/hotels/destination/${destinationSlug}?take=3`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload?.data ?? []).filter((h: RelatedHotel) => h.id !== excludeId).slice(0, 3);
  } catch {
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotel(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!hotel) {
    return { title: "Hotel Not Found | GoYatrio" };
  }

  const title = `${hotel.name} | ${hotel.hotelCategory} Hotel in ${hotel.city} | GoYatrio`;
  const description = `${hotel.shortDescription} Check room availability, tariffs, amenities, and hotel inquiries at ${hotel.name}`;
  const imageUrl = hotel.images[0]?.imageUrl ?? null;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/hotels/${hotel.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      url: `${baseUrl}/hotels/${hotel.slug}`,
      images: imageUrl ? [{ url: imageUrl, alt: hotel.name }] : undefined,
    },
  };
}

export default async function PublicHotelDetailPage({ params }: Props) {
  const { slug } = await params;
  const hotel = await getHotel(slug);

  if (!hotel) {
    notFound();
  }

  const relatedHotels = await getRelatedHotels(hotel.destination.slug, hotel.id);
  const gallery =
    hotel.galleryMedia && hotel.galleryMedia.length > 0
      ? hotel.galleryMedia.map((m) => ({ imageUrl: m.secureUrl, id: m.secureUrl, altText: null, sortOrder: 0 }))
      : hotel.images.length > 0
        ? hotel.images
        : [];
  const starRating = hotel.starRating;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.shortDescription,
    starRating: { "@type": "Rating", ratingValue: starRating },
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address,
      addressLocality: hotel.city,
      addressRegion: hotel.state ?? undefined,
      addressCountry: hotel.country,
    },
    image: gallery[0]?.imageUrl ?? undefined,
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/hotels/${hotel.slug}`,
  };

  return (
    <PageWrapper>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-primary">
        {hotel.featuredMedia?.secureUrl ?? gallery[0]?.imageUrl ? (
          <div className="relative">
            <CardMedia src={hotel.featuredMedia?.secureUrl ?? gallery[0]?.imageUrl ?? ""} alt={hotel.name} className="w-full h-[22rem] tablet:h-[28rem]" />
            <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-800 to-secondary" aria-hidden="true" />
        )}

        <Container className="relative flex min-h-[18rem] flex-col justify-end py-10 tablet:min-h-[22rem]">
          <div className="mb-4">
            <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white gap-1">
              <Link href="/hotels">
                <ArrowLeft className="size-4" />
                Back to Hotels
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="accent">{hotel.hotelCategory}</Badge>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90">
              <MapPin className="size-4 text-accent" />
              {hotel.destination.name}, {hotel.country}
            </span>
            <span className="inline-flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: starRating }).map((_, idx) => (
                <Star key={idx} className="size-4 fill-amber-400" />
              ))}
            </span>
          </div>

          <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-white tablet:text-5xl">
            {hotel.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/85 tablet:text-lg">
            {hotel.shortDescription}
          </p>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12 tablet:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-10 desktop:grid-cols-3">
            {/* Left Main Column */}
            <div className="desktop:col-span-2 space-y-10">
              {/* Gallery */}
              {gallery.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-5">Hotel Gallery</h2>
                  <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3">
                    {gallery.map((img) => (
                      <CardMedia
                        key={img.id}
                        src={img.imageUrl}
                        alt={img.altText ?? hotel.name}
                        className="aspect-[4/3]"
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Overview */}
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Hotel Overview</h2>
                <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {hotel.fullDescription}
                </p>
              </div>

              {/* Amenities */}
              {hotel.amenities.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Hotel Amenities</h2>
                  <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
                    {hotel.amenities.map((am) => (
                      <div key={am.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/20 p-3 text-sm font-medium text-foreground">
                        <CheckCircle2 className="size-4 text-success shrink-0" />
                        {am.name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Room Types */}
              {hotel.roomTypes.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Available Room Categories</h2>
                  <div className="space-y-4">
                    {hotel.roomTypes.map((room) => (
                      <Card key={room.id} className="p-6 border border-border bg-card shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{room.roomName}</h3>
                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{room.roomDescription}</p>
                          </div>
                          <Price amount={room.priceFrom} per="per night" size="sm" />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bed className="size-3.5 text-primary" />
                            Bed Type: {room.bedType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="size-3.5 text-primary" />
                            Max Guests: {room.maxGuests}
                          </span>
                          {room.roomSize ? (
                            <span className="flex items-center gap-1">
                              <Ruler className="size-3.5 text-primary" />
                              Room Size: {room.roomSize}
                            </span>
                          ) : null}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Hotel Information */}
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Hotel Information & Location</h2>
                <Card className="p-6 space-y-3 border border-border bg-card">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Building2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Address:</strong> {hotel.address}, {hotel.city}{hotel.state ? `, ${hotel.state}` : ""}, {hotel.country}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Star className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Star Rating:</strong> {hotel.starRating} Star {hotel.hotelCategory} Hotel</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Destination:</strong> {hotel.destination.name}</span>
                  </div>
                </Card>
              </div>

              {/* Associated Packages */}
              {hotel.packages.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Featured Holiday Packages</h2>
                  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                    {hotel.packages.map((pkg) => (
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
            </div>

            {/* Right Sidebar: Inquiry Form */}
            <aside>
              <div className="sticky top-24">
                <Card className="p-6 border border-border bg-card shadow-md">
                  <h3 className="text-xl font-semibold text-foreground mb-1">Check Availability</h3>
                  <p className="text-xs text-muted-foreground mb-5">
                    Send an inquiry to {hotel.name} and our team will respond with exclusive rates and offers.
                  </p>
                  <HotelInquiryForm
                    hotelId={hotel.id}
                    hotelName={hotel.name}
                    destinationName={hotel.destination.name}
                  />
                </Card>
              </div>
            </aside>
          </div>

          {/* Related Hotels */}
          {relatedHotels.length > 0 ? (
            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-foreground mb-6">More Hotels in {hotel.destination.name}</h2>
              <div className="grid grid-cols-1 gap-6 tablet:grid-cols-3">
                {relatedHotels.map((rel) => (
                  <Card key={rel.id} className="overflow-hidden border border-border bg-card shadow-sm transition-all hover:shadow-md">
                    <div className="relative aspect-[16/10]">
                      {rel.images[0] ? (
                        <CardMedia src={rel.images[0].imageUrl} alt={rel.name} className="h-full w-full" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          <Building2 className="size-6" />
                        </div>
                      )}
                      <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                        {rel.hotelCategory}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-semibold text-foreground hover:text-primary">
                          <Link href={`/hotels/${rel.slug}`}>{rel.name}</Link>
                        </h3>
                        <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                          {Array.from({ length: rel.starRating }).map((_, idx) => (
                            <Star key={idx} className="size-3 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      {rel.roomTypes[0] ? (
                        <div className="mt-3">
                          <Price amount={Number(rel.roomTypes[0].priceFrom)} size="sm" />
                        </div>
                      ) : null}
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
