import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Star, Search, ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CardMedia } from "@/components/cards/card-media";

import { resolvePageMetadata } from "@/components/seo/seo";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata({
    pageType: "hotels",
    fallbackTitle: "Handpicked Hotels & Stays in India | GoYatrio",
    fallbackDescription:
      "Browse handpicked hotels, resorts, houseboats, and luxury stays across India. Filter by category, star rating and destination.",
    path: "/hotels",
  });
}

type DestinationOption = {
  id: string;
  name: string;
  slug: string;
};

type HotelCard = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  city: string;
  state: string | null;
  hotelCategory: string;
  starRating: number;
  featured: boolean;
  destination: DestinationOption;
  featuredMedia: { secureUrl: string; altText?: string | null } | null;
  images: { id: string; imageUrl: string; altText: string | null }[];
  amenities: { id: string; name: string }[];
  roomTypes: { id: string; roomName: string; priceFrom: number }[];
};

async function getHotels(
  search = "",
  category = "",
  starRating = "",
  destination = "",
  sort = "newest",
  skip = 0,
): Promise<{ items: HotelCard[]; total: number }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const params = new URLSearchParams({ take: "9", skip: String(skip) });

    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (starRating) params.set("starRating", starRating);
    if (destination) params.set("destinationSlug", destination);
    if (sort !== "newest") params.set("sort", sort);

    const res = await fetch(`${baseUrl}/api/hotels?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return { items: [], total: 0 };
    const payload = await res.json();
    return { items: payload?.data ?? [], total: payload?.meta?.total ?? 0 };
  } catch {
    return { items: [], total: 0 };
  }
}

async function getDestinations(): Promise<DestinationOption[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/destinations?take=50`, {
      next: { revalidate: 600, tags: ["destinations"] },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    return payload?.data ?? [];
  } catch {
    return [];
  }
}

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    star?: string;
    destination?: string;
    sort?: string;
    page?: string;
  }>;
};
export default async function PublicHotelsPage({ searchParams }: Props) {
  const params = await searchParams;

  const search = params.search ?? "";
  const category = params.category ?? "";
  const starRating = params.star ?? "";
  const destination = params.destination ?? "";
  const sort = params.sort ?? "newest";
  const page = Number(params.page) || 1;
  const skip = (page - 1) * 9;

  const [result, destinations] = await Promise.all([
    getHotels(search, category, starRating, destination, sort, skip),
    getDestinations(),
  ]);

  const totalPages = Math.ceil(result.total / 9);

  const baseQuery = new URLSearchParams();
  if (search) baseQuery.set("search", search);
  if (category) baseQuery.set("category", category);
  if (starRating) baseQuery.set("star", starRating);
  if (destination) baseQuery.set("destination", destination);
  if (sort) baseQuery.set("sort", sort);

  return (
    <PageWrapper>
      {/* Page Header */}
      <section className="bg-primary/5 py-12 tablet:py-16 border-b border-border">
        <Container>
          <SectionTitle
            title="Handpicked Hotels & Stays"
            description="Discover premium resorts, boutique heritage stays, beachfront villas, and budget-friendly inns across India."
            align="left"
          />
        </Container>
      </section>

      {/* Filters & Search */}
      <section className="py-8 border-b border-border bg-background">
        <Container>
          <form className="grid grid-cols-1 gap-3 tablet:grid-cols-5" method="get" action="/hotels">
            <div className="tablet:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search hotels, cities..."
                  className="pl-9"
                />
              </div>
            </div>

            <select
              name="category"
              defaultValue={category}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              <option value="BUDGET">Budget</option>
              <option value="STANDARD">Standard</option>
              <option value="PREMIUM">Premium</option>
              <option value="LUXURY">Luxury</option>
            </select>

            <select
              name="star"
              defaultValue={starRating}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Any Star Rating</option>
              <option value="5">5 Star</option>
              <option value="4">4 Star</option>
              <option value="3">3 Star</option>
              <option value="2">2 Star</option>
              <option value="1">1 Star</option>
            </select>

            <select
              name="destination"
              defaultValue={destination}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>

            <div className="tablet:col-span-full flex flex-col tablet:flex-row items-start tablet:items-center gap-3">
              <select
                name="sort"
                defaultValue={sort}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <Button type="submit" size="sm">
                Apply Filters
              </Button>
              {search || category || starRating || destination || sort !== "newest" ? (
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                  <Link href="/hotels">Clear All</Link>
                </Button>
              ) : null}
            </div>
          </form>
        </Container>
      </section>
      {/* Hotel Cards Grid */}
      <section className="py-12 tablet:py-16">
        <Container>
          {result.items.length === 0 ? (
            <Card className="p-12 text-center">
              <MapPin className="mx-auto size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No Hotels Found</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Try adjusting your search or removing some filters to discover more handpicked
                stays.
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
                {result.items.map((hotel) => {
                  const minPrice = hotel.roomTypes[0]?.priceFrom ?? 0;
                  const imageUrl =
                    hotel.featuredMedia?.secureUrl ?? hotel.images[0]?.imageUrl ?? "";

                  return (
                    <Card
                      key={hotel.id}
                      className="overflow-hidden border border-border bg-card shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="relative aspect-[16/10]">
                        {imageUrl ? (
                          <CardMedia src={imageUrl} alt={hotel.name} className="h-full w-full" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                            <MapPin className="size-6" />
                          </div>
                        )}
                        {hotel.featured ? (
                          <Badge variant="accent" className="absolute left-3 top-3">
                            Featured
                          </Badge>
                        ) : null}
                        <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          {hotel.hotelCategory}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 justify-between">
                            <h2 className="text-lg font-semibold text-foreground leading-snug hover:text-primary">
                              <Link href={`/hotels/${hotel.slug}`}>{hotel.name}</Link>
                            </h2>
                            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                              {Array.from({ length: hotel.starRating }).map((_, idx) => (
                                <Star key={idx} className="size-3.5 fill-amber-500" />
                              ))}
                            </div>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3.5 text-primary" />
                            {hotel.city}, {hotel.destination.name}
                          </p>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {hotel.shortDescription}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {hotel.amenities.slice(0, 3).map((am) => (
                            <Badge
                              key={am.id}
                              variant="outline"
                              className="text-[11px] font-normal"
                            >
                              {am.name}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-3">
                          {minPrice ? (
                            <div>
                              <span className="block text-[11px] text-muted-foreground">
                                Starting from / night
                              </span>
                              <Price amount={minPrice} size="sm" />
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">
                              Custom Rates
                            </span>
                          )}

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
              {/* Pagination */}
              {totalPages > 1 ? (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const qs = new URLSearchParams(baseQuery);
                    qs.set("page", String(pageNum));
                    return (
                      <Button
                        key={pageNum}
                        asChild
                        size="sm"
                        variant={pageNum === page ? "primary" : "outline"}
                        className="h-9 w-9 p-0 font-mono"
                      >
                        <Link href={`/hotels?${qs.toString()}`}>{pageNum}</Link>
                      </Button>
                    );
                  })}
                </div>
              ) : null}
            </>
          )}
        </Container>
      </section>
    </PageWrapper>
  );
}
