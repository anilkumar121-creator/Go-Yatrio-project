import type { Metadata } from "next";
import Link from "next/link";
import { Car, Users, Fuel, Snowflake, MapPin, Search, ArrowRight, Briefcase } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CardMedia } from "@/components/cards/card-media";
import { StaggerContainer, StaggerItem } from "@/components/animation/motion";

import { resolvePageMetadata } from "@/components/seo/seo";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata({
    pageType: "cabs",
    fallbackTitle: "Cab Rentals & Car Rental Services in India | GoYatrio",
    fallbackDescription:
      "Book local cabs, airport transfers, outstation taxis, and multi-day car rentals at the best prices with GoYatrio.",
    path: "/cabs",
  });
}

type DestinationOption = {
  id: string;
  name: string;
  slug: string;
  country?: string;
  featuredImage?: string | null;
  featuredMedia?: { secureUrl: string; altText?: string | null } | null;
};

type CabCard = {
  id: string;
  vehicleName: string;
  slug: string;
  vehicleType: string;
  description: string;
  capacity: number;
  luggageCapacity?: number;
  ac: boolean;
  fuelType: string;
  priceFrom: number;
  image: string | null;
  featuredMedia: { secureUrl: string; altText?: string | null } | null;
  tripTypes: string[];
  featured: boolean;
  destination?: DestinationOption;
};

type LookupItem = {
  id: string;
  value: string;
  label: string;
  description: string | null;
  sortOrder: number;
};

async function getLookupItems(groupKey: string): Promise<LookupItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/lookups/${groupKey}`, {
      next: { revalidate: 600, tags: ["lookups"] },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    return payload?.data?.items ?? [];
  } catch {
    return [];
  }
}

async function getCabs(
  search = "",
  vehicleType = "",
  tripType = "",
  destination = "",
  sort = "newest",
  skip = 0,
  take = 9,
): Promise<{ items: CabCard[]; total: number }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const params = new URLSearchParams({ take: String(take), skip: String(skip) });

    if (search) params.set("search", search);
    if (vehicleType) params.set("vehicleType", vehicleType);
    if (tripType) params.set("tripType", tripType);
    if (destination) params.set("destinationSlug", destination);
    if (sort !== "newest") params.set("sort", sort);

    const res = await fetch(`${baseUrl}/api/cabs?${params.toString()}`, { cache: "no-store" });
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
    return Array.isArray(payload?.data) ? payload.data : (payload?.data?.data ?? []);
  } catch {
    return [];
  }
}

type Props = {
  searchParams: Promise<{
    search?: string;
    type?: string;
    trip?: string;
    destination?: string;
    sort?: string;
    page?: string;
    dest_filter?: string;
  }>;
};

export default async function PublicCabsPage({ searchParams }: Props) {
  const params = await searchParams;

  const search = params.search ?? "";
  const vehicleType = params.type ?? "";
  const tripType = params.trip ?? "";
  const destination = params.destination ?? "";
  const sort = params.sort ?? "newest";
  const page = Number(params.page) || 1;
  const skip = (page - 1) * 9;
  const destFilter = params.dest_filter ?? "all";

  const [result, allDestinations, showcaseCabsRes, vehicleTypes, tripTypes] = await Promise.all([
    getCabs(search, vehicleType, tripType, destination, sort, skip, 9),
    getDestinations(),
    getCabs("", "", "", "", "newest", 0, 50),
    getLookupItems("VEHICLE_TYPE"),
    getLookupItems("CAB_TRIP_TYPE"),
  ]);

  const totalPages = Math.ceil(result.total / 9);

  const baseQuery = new URLSearchParams();
  if (search) baseQuery.set("search", search);
  if (vehicleType) baseQuery.set("type", vehicleType);
  if (tripType) baseQuery.set("trip", tripType);
  if (destination) baseQuery.set("destination", destination);
  if (sort && sort !== "newest") baseQuery.set("sort", sort);

  const uniqueShowcaseCabs = Array.from(
    new Map(showcaseCabsRes.items.map((cab) => [cab.vehicleName, cab])).values(),
  );

  const displayDestinations = allDestinations.filter((d) => {
    if (destFilter === "domestic") return d.country === "India" || !d.country;
    return true;
  });

  return (
    <PageWrapper>
      <section className="bg-primary/5 py-12 tablet:py-16 border-b border-border">
        <Container>
          <SectionTitle
            title="Cab Rentals & Car Hire"
            description="From hatchbacks to luxury SUVs and tempo travellers — find the perfect cab for local, outstation, airport, and multi-day trips."
            align="left"
          />
        </Container>
      </section>

      <section className="py-8 border-b border-border bg-background">
        <Container>
          <form className="grid grid-cols-1 gap-3 tablet:grid-cols-5" method="get" action="/cabs">
            <div className="tablet:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search cabs, types..."
                  className="pl-9"
                />
              </div>
            </div>

            <select
              name="type"
              defaultValue={vehicleType}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Vehicle Types</option>
              {vehicleTypes.map((vt) => (
                <option key={vt.value} value={vt.value}>
                  {vt.label}
                </option>
              ))}
            </select>

            <select
              name="trip"
              defaultValue={tripType}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Trip Types</option>
              {tripTypes.map((trip) => (
                <option key={trip.value} value={trip.value}>
                  {trip.label}
                </option>
              ))}
            </select>

            <select
              name="destination"
              defaultValue={destination}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Destinations</option>
              {allDestinations.map((d) => (
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
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="capacity_desc">Most Seats</option>
              </select>
              <Button type="submit" size="sm">
                Apply Filters
              </Button>
              {search || vehicleType || tripType || destination || sort !== "newest" ? (
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                  <Link href="/cabs">Clear All</Link>
                </Button>
              ) : null}
            </div>
          </form>
        </Container>
      </section>

      {uniqueShowcaseCabs.length > 0 && (
        <section className="py-12 border-b border-border bg-background">
          <Container>
            <SectionTitle
              title="Choose Your Comfort"
              description="Explore our wide range of vehicle models, from economical hatchbacks to luxury tempo travellers."
              align="center"
            />
            <div className="mt-8 flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-hide">
              {uniqueShowcaseCabs.map((cab) => (
                <Link
                  key={cab.id}
                  href={`/cabs?type=${cab.vehicleType}`}
                  className="group relative flex min-w-[280px] tablet:min-w-[320px] max-w-[320px] snap-center flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {cab.featuredMedia?.secureUrl || cab.image ? (
                      <CardMedia
                        src={cab.featuredMedia?.secureUrl ?? cab.image ?? ""}
                        alt={cab.vehicleName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-primary/10">
                        <Car className="size-10" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold text-white">
                      {cab.vehicleType.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {cab.vehicleName}
                    </h3>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="size-4 text-primary" />
                        {cab.capacity} Seats
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="size-4 text-primary" />
                        {cab.luggageCapacity ?? 2} Bags
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {allDestinations.length > 0 && (
        <section className="py-12 border-b border-border bg-background">
          <Container>
            <div className="mb-8 flex flex-col items-center justify-between gap-6 tablet:flex-row">
              <SectionTitle
                title="Explore Destinations"
                description="Book a cab for these popular destinations."
                align="left"
              />

              <div className="flex items-center gap-2 rounded-full border border-border p-1 bg-muted/30 overflow-x-auto max-w-full scrollbar-hide shrink-0">
                <Link
                  href="/cabs?dest_filter=all"
                  scroll={false}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${destFilter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  All
                </Link>
                <Link
                  href="/cabs?dest_filter=domestic"
                  scroll={false}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${destFilter === "domestic" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  Domestic
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 tablet:gap-4 tablet:grid-cols-3 desktop:grid-cols-4 lg:grid-cols-6">
              {displayDestinations.slice(0, 12).map((dest) => (
                <Link
                  key={dest.id}
                  href={`/cabs?destination=${dest.slug}`}
                  className="group relative flex aspect-[4/5] w-full flex-col overflow-hidden rounded-2xl bg-muted"
                >
                  {dest.featuredMedia?.secureUrl || dest.featuredImage ? (
                    <CardMedia
                      src={dest.featuredMedia?.secureUrl ?? dest.featuredImage ?? ""}
                      alt={dest.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                      <MapPin className="size-8 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:from-black/90" />
                  <div className="relative mt-auto p-4 text-center">
                    <h3 className="text-sm font-bold text-white tablet:text-base line-clamp-2">
                      {dest.name}
                    </h3>
                  </div>
                </Link>
              ))}
              {displayDestinations.length === 0 && (
                <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                  No destinations found for this category.
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      <section className="py-12 tablet:py-16 bg-primary/5">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <SectionTitle
              title="Our Cab Fleet"
              description="Choose from our wide range of well-maintained vehicles for your next journey."
              align="left"
            />
            {search || vehicleType || tripType || destination || sort !== "newest" ? (
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/cabs">View All Fleet</Link>
              </Button>
            ) : null}
          </div>

          {result.items.length === 0 ? (
            <Card className="p-12 text-center">
              <Car className="mx-auto size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No Cabs Found</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Try adjusting your search or removing filters to discover more vehicles.
              </p>
            </Card>
          ) : (
            <>
              <StaggerContainer className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
                {result.items.map((cab) => (
                  <StaggerItem key={cab.id}>
                    <Card className="group flex h-full flex-col overflow-hidden border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {cab.featuredMedia?.secureUrl || cab.image ? (
                          <CardMedia
                            src={cab.featuredMedia?.secureUrl ?? cab.image ?? ""}
                            alt={cab.vehicleName}
                            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                            <Car className="size-8" />
                          </div>
                        )}
                        {cab.featured ? (
                          <Badge variant="accent" className="absolute left-3 top-3 shadow-sm">
                            Featured
                          </Badge>
                        ) : null}
                        <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          {cab.vehicleType.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="flex flex-col flex-1 p-5">
                        <div className="mb-4">
                          <h2 className="text-lg font-bold text-foreground leading-snug hover:text-primary transition-colors line-clamp-1">
                            <Link href={`/cabs/${cab.slug}`}>{cab.vehicleName}</Link>
                          </h2>
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="size-3.5 text-primary" />
                            <span className="line-clamp-1">
                              {cab.destination?.name ?? "Available in All Destinations"}
                            </span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Users className="size-3.5 text-primary" />
                            {cab.capacity} Seats
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="size-3.5 text-primary" />
                            {cab.luggageCapacity ?? 2} Luggage
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Fuel className="size-3.5 text-primary" />
                            {cab.fuelType}
                          </span>
                          {cab.ac ? (
                            <span className="flex items-center gap-1.5 text-sky-600">
                              <Snowflake className="size-3.5" />
                              AC Available
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Starting from
                            </span>
                            <Price
                              amount={Number(cab.priceFrom)}
                              size="md"
                              className="text-primary font-bold"
                            />
                          </div>
                          <Button asChild size="sm" className="gap-1.5 font-semibold group/btn">
                            <Link href={`/cabs/${cab.slug}`}>
                              Book Taxi
                              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>

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
                        <Link href={`/cabs?${qs.toString()}`}>{pageNum}</Link>
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
