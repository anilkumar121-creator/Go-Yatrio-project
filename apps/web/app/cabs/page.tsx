import type { Metadata } from "next";
import Link from "next/link";
import { Car, Users, Fuel, Snowflake, MapPin, Search, ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CardMedia } from "@/components/cards/card-media";

export const metadata: Metadata = {
  title: "Cab Rentals & Car Rental Services in India | GoYatrio",
  description: "Book local cabs, airport transfers, outstation taxis, and multi-day car rentals at the best prices with GoYatrio.",
  alternates: {
    canonical: "/cabs",
  },
};

type DestinationOption = {
  id: string;
  name: string;
  slug: string;
};

type CabCard = {
  id: string;
  vehicleName: string;
  slug: string;
  vehicleType: string;
  description: string;
  capacity: number;
  ac: boolean;
  fuelType: string;
  priceFrom: number;
  image: string | null;
  featuredMedia: { secureUrl: string; altText?: string | null } | null;
  tripTypes: string[];
  featured: boolean;
  destination?: DestinationOption;
};

const vehicleTypeOptions = [
  "HATCHBACK",
  "SEDAN",
  "SUV",
  "LUXURY_SUV",
  "TEMPO_TRAVELLER",
  "MINI_BUS",
  "BUS",
  "LUXURY",
];

const tripTypeOptions = [
  { value: "LOCAL", label: "Local Cab" },
  { value: "AIRPORT_TRANSFER", label: "Airport Transfer" },
  { value: "RAILWAY_TRANSFER", label: "Railway Transfer" },
  { value: "OUTSTATION", label: "Outstation Cab" },
  { value: "ONE_WAY", label: "One Way Cab" },
  { value: "ROUND_TRIP", label: "Round Trip Cab" },
  { value: "MULTI_DAY", label: "Multi-Day Cab" },
];

async function getCabs(search = "", vehicleType = "", tripType = "", destination = "", sort = "newest", skip = 0): Promise<{ items: CabCard[]; total: number }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const params = new URLSearchParams({ take: "9", skip: String(skip) });

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
    const res = await fetch(`${baseUrl}/api/destinations?take=50`, { cache: "no-store" });
    if (!res.ok) return [];
    const payload = await res.json();
    return payload?.data ?? [];
  } catch {
    return [];
  }
}

type Props = {
  searchParams: Promise<{ search?: string; type?: string; trip?: string; destination?: string; sort?: string; page?: string }>;
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

  const [result, destinations] = await Promise.all([
    getCabs(search, vehicleType, tripType, destination, sort, skip),
    getDestinations(),
  ]);

  const totalPages = Math.ceil(result.total / 9);

  const baseQuery = new URLSearchParams();
  if (search) baseQuery.set("search", search);
  if (vehicleType) baseQuery.set("type", vehicleType);
  if (tripType) baseQuery.set("trip", tripType);
  if (destination) baseQuery.set("destination", destination);
  if (sort) baseQuery.set("sort", sort);

  return (
    <PageWrapper>
      <section className="bg-primary/5 py-12 tablet:py-16 border-b border-border">
        <Container>
          <SectionTitle
            title="Cab Rentals & Car Hire"
            description="From hatchbacks to luxury SUVs and tempo travellers ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â find the perfect cab for local, outstation, airport, and multi-day trips."
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
                <Input type="text" name="search" defaultValue={search} placeholder="Search cabs, types..." className="pl-9" />
              </div>
            </div>

            <select name="type" defaultValue={vehicleType} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All Vehicle Types</option>
              {vehicleTypeOptions.map((vt) => (
                <option key={vt} value={vt}>{vt}</option>
              ))}
            </select>

            <select name="trip" defaultValue={tripType} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All Trip Types</option>
              {tripTypeOptions.map((trip) => (
                <option key={trip.value} value={trip.value}>{trip.label}</option>
              ))}
            </select>

            <select name="destination" defaultValue={destination} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All Destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.slug}>{d.name}</option>
              ))}
            </select>

            <div className="tablet:col-span-full flex flex-col tablet:flex-row items-start tablet:items-center gap-3">
              <select name="sort" defaultValue={sort} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="capacity_desc">Most Seats</option>
              </select>
              <Button type="submit" size="sm">Apply Filters</Button>
              {search || vehicleType || tripType || destination || sort !== "newest" ? (
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                  <Link href="/cabs">Clear All</Link>
                </Button>
              ) : null}
            </div>
          </form>
        </Container>
      </section>

      <section className="py-12 tablet:py-16">
        <Container>
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
              <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
                {result.items.map((cab) => (
                  <Card key={cab.id} className="overflow-hidden border border-border bg-card shadow-sm transition-all hover:shadow-md">
                    <div className="relative aspect-[16/10]">
                      {cab.featuredMedia?.secureUrl ?? cab.image ? (
                        <CardMedia src={cab.featuredMedia?.secureUrl ?? cab.image ?? ""} alt={cab.vehicleName} className="h-full w-full" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          <Car className="size-8" />
                        </div>
                      )}
                      {cab.featured ? <Badge variant="accent" className="absolute left-3 top-3">Featured</Badge> : null}
                      <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        {cab.vehicleType}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground leading-snug hover:text-primary">
                          <Link href={`/cabs/${cab.slug}`}>{cab.vehicleName}</Link>
                        </h2>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 text-primary" />
                          {cab.destination?.name ?? "All Destinations"}
                        </p>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{cab.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5 text-primary" />
                          {cab.capacity} seats
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel className="size-3.5 text-primary" />
                          {cab.fuelType}
                        </span>
                        {cab.ac ? (
                          <span className="flex items-center gap-1 text-sky-600">
                            <Snowflake className="size-3.5" />
                            AC
                          </span>
                        ) : null}
                      </div>

                      {cab.tripTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {cab.tripTypes.slice(0, 3).map((trip) => (
                            <Badge key={trip} variant="outline" className="text-[11px] font-normal">{trip}</Badge>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div>
                          <span className="block text-[11px] text-muted-foreground">Starting from</span>
                          <Price amount={Number(cab.priceFrom)} size="sm" />
                        </div>
                        <Button asChild size="sm" variant="outline" className="gap-1">
                          <Link href={`/cabs/${cab.slug}`}>
                            View Cab
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const qs = new URLSearchParams(baseQuery);
                    qs.set("page", String(pageNum));
                    return (
                      <Button key={pageNum} asChild size="sm" variant={pageNum === page ? "primary" : "outline"} className="h-9 w-9 p-0 font-mono">
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
