import type { Metadata } from "next";
import Link from "next/link";
import {
  Car,
  Users,
  Fuel,
  Snowflake,
  MapPin,
  Search,
  ArrowRight,
  Briefcase,
  Calendar,
  ShieldCheck,
  CreditCard,
  Clock,
} from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { CardMedia } from "@/components/cards/card-media";

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

type CityOption = {
  id: string;
  name: string;
  stateId: string;
  state?: { name: string };
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
  serviceLocations?: { city: CityOption }[];
};

type LookupItem = {
  id: string;
  value: string;
  label: string;
  description: string | null;
  sortOrder: number;
};

// Directly fetch from backend API
const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type PackageCard = {
  id: string;
  title: string;
  slug: string;
  durationDays: number;
  durationNights: number;
  priceFrom: number;
  featuredImage: string | null;
  destination?: { name: string };
};

type RoutePricingCard = {
  id: string;
  originCity: { name: string };
  destinationCity: { name: string };
  category: { label: string };
  basePrice: number;
};

async function getPackages(): Promise<PackageCard[]> {
  try {
    const res = await fetch(`${API_BASE}/api/packages?take=6`, {
      next: { revalidate: 600, tags: ["packages"] },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    return payload?.data ?? [];
  } catch {
    return [];
  }
}

async function getRoutePricings(): Promise<RoutePricingCard[]> {
  try {
    const res = await fetch(`${API_BASE}/api/route-pricing?take=8`, {
      next: { revalidate: 600, tags: ["route-pricing"] },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    return payload?.data ?? [];
  } catch {
    return [];
  }
}

async function getLookupItems(groupKey: string): Promise<LookupItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/lookups/${groupKey}`, {
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
  cityId = "",
  sort = "newest",
  skip = 0,
  take = 9,
): Promise<{ items: CabCard[]; total: number; networkError?: boolean }> {
  try {
    const params = new URLSearchParams({ take: String(take), skip: String(skip) });

    if (search) params.set("search", search);
    if (vehicleType) params.set("vehicleType", vehicleType);
    if (tripType) params.set("tripType", tripType);
    if (cityId) params.set("cityId", cityId);
    if (sort !== "newest") params.set("sort", sort);

    const res = await fetch(`${API_BASE}/api/cabs?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return { items: [], total: 0 };
    const payload = await res.json();
    return { items: payload?.data ?? [], total: payload?.meta?.total ?? 0 };
  } catch {
    return { items: [], total: 0, networkError: true };
  }
}

async function getCities(): Promise<CityOption[]> {
  try {
    const res = await fetch(`${API_BASE}/api/locations/cities?hasCabService=true&activeOnly=true`, {
      next: { revalidate: 600, tags: ["cities"] },
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
    originCityId?: string;
    destinationCityId?: string;
    travelDate?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function PublicCabsPage({ searchParams }: Props) {
  const params = await searchParams;

  const search = params.search ?? "";
  const vehicleType = params.type ?? "";
  const tripType = params.trip ?? "";
  const originCityId = params.originCityId ?? "";
  const destinationCityId = params.destinationCityId ?? "";
  const travelDate = params.travelDate ?? "";
  const sort = params.sort ?? "newest";
  const page = Number(params.page) || 1;
  const skip = (page - 1) * 9;

  const [result, allCities, showcaseCabsRes, vehicleTypes, tripTypes, packages, popularRoutes] =
    await Promise.all([
      getCabs(search, vehicleType, tripType, originCityId, sort, skip, 9),
      getCities(),
      getCabs("", "", "", "", "newest", 0, 50),
      getLookupItems("VEHICLE_TYPE"),
      getLookupItems("CAB_TRIP_TYPE"),
      getPackages(),
      getRoutePricings(),
    ]);

  const totalPages = Math.ceil((result.total || 0) / 9);

  const baseQuery = new URLSearchParams();
  if (search) baseQuery.set("search", search);
  if (vehicleType) baseQuery.set("type", vehicleType);
  if (tripType) baseQuery.set("trip", tripType);
  if (originCityId) baseQuery.set("originCityId", originCityId);
  if (destinationCityId) baseQuery.set("destinationCityId", destinationCityId);
  if (travelDate) baseQuery.set("travelDate", travelDate);
  if (sort && sort !== "newest") baseQuery.set("sort", sort);

  const uniqueShowcaseCabs = vehicleTypes
    .map((vt) => showcaseCabsRes.items?.find((cab: CabCard) => cab.vehicleType === vt.value))
    .filter(Boolean) as CabCard[];

  return (
    <PageWrapper>
      {/* 1. Hero Search Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary text-white py-16 tablet:py-24">
        <div className="absolute inset-0 bg-black/20" />
        <Container className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Book Your Cab Across India
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10">
              Reliable outstation taxis, local rentals, and airport transfers. Experience
              comfortable travel with GoYatrio.
            </p>

            <div className="bg-background rounded-2xl shadow-xl p-4 sm:p-6 text-foreground max-w-4xl mx-auto border border-border/50 backdrop-blur-sm">
              <form className="flex flex-col gap-6" method="get" action="/cabs">
                <fieldset className="flex flex-wrap items-center justify-center gap-2">
                  {tripTypes.map((trip) => (
                    <label key={trip.value} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="trip"
                        value={trip.value}
                        defaultChecked={tripType === trip.value}
                        className="peer sr-only"
                      />
                      <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full border border-border/60 bg-muted/30 text-foreground peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary transition-all hover:bg-muted">
                        {trip.label}
                      </span>
                    </label>
                  ))}
                </fieldset>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search className="size-5" />
                  </div>
                  <input
                    name="search"
                    type="text"
                    placeholder="Search cabs or vehicle models"
                    defaultValue={search}
                    className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <MapPin className="size-5" />
                    </div>
                    <select
                      name="originCityId"
                      defaultValue={originCityId}
                      className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
                    >
                      <option value="">Pickup City</option>
                      {allCities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <MapPin className="size-5" />
                    </div>
                    <select
                      name="destinationCityId"
                      defaultValue={destinationCityId}
                      className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
                    >
                      <option value="">Drop City</option>
                      {allCities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Calendar className="size-5" />
                    </div>
                    <input
                      type="date"
                      name="travelDate"
                      defaultValue={travelDate}
                      className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Car className="size-5" />
                    </div>
                    <select
                      name="type"
                      defaultValue={vehicleType}
                      className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
                    >
                      <option value="">Vehicle Class</option>
                      {vehicleTypes.map((vt) => (
                        <option key={vt.value} value={vt.value}>
                          {vt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-xl text-base font-semibold shadow-md lg:col-span-1 h-full py-3"
                  >
                    Search Cabs
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Strip */}
      <div className="bg-background border-b border-border shadow-sm relative z-20">
        <Container>
          <div className="flex overflow-x-auto gap-8 py-5 hide-scrollbar snap-x snap-mandatory">
            {[
              { icon: ShieldCheck, text: "Online Cab Booking" },
              { icon: MapPin, text: "City-Based Availability" },
              { icon: CreditCard, text: "Digital Payment Support" },
              { icon: Car, text: "Multiple Vehicle Options" },
              { icon: Clock, text: "Server-Calculated Fare" },
              { icon: Users, text: "Flexible Trip Types" },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-2 shrink-0 snap-start text-foreground/80 hover:text-primary transition-colors"
              >
                <benefit.icon className="size-5 text-primary" />
                <span className="font-semibold text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Promotional Banners */}
      <section className="pt-12 pb-8 bg-muted/20">
        <Container>
          <div className="flex overflow-x-auto gap-4 hide-scrollbar snap-x snap-mandatory pb-4">
            {[
              {
                title: "Explore Weekend Cab Options",
                desc: "Reliable cabs for your perfect weekend getaway.",
                code: "EXPLORE NOW",
                color: "from-blue-600 to-indigo-600",
              },
              {
                title: "Airport & City Transfers",
                desc: "Timely pickups and drops for a hassle-free journey.",
                code: "BOOK TRANSFER",
                color: "from-emerald-500 to-teal-600",
              },
              {
                title: "Comfortable Vehicles for Outstation Travel",
                desc: "Book comfortable SUVs for family trips.",
                code: "VIEW FLEET",
                color: "from-orange-500 to-red-600",
              },
            ].map((offer, i) => (
              <div
                key={i}
                className={`shrink-0 snap-center w-[85vw] max-w-sm sm:w-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-gradient-to-br ${offer.color} text-white p-6 relative`}
              >
                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2 leading-tight">{offer.title}</h3>
                  <p className="text-white/90 text-sm mb-5">{offer.desc}</p>
                  <div className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1.5 text-xs font-bold tracking-widest">
                    {offer.code}
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 opacity-20 rotate-12">
                  <Car className="size-32" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 2. Vehicle Showcase Category Section */}
      {uniqueShowcaseCabs.length > 0 && (
        <section className="py-16 border-b border-border bg-muted/30">
          <Container>
            <SectionTitle
              title="A Fleet for Every Need"
              description="From compact hatchbacks for quick city rides to luxury tempo travellers for group holidays."
              align="center"
            />
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {uniqueShowcaseCabs.map((cab) => (
                <Link
                  key={cab.id}
                  href={`/cabs?type=${cab.vehicleType}`}
                  className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-lg"
                >
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden p-4 flex items-center justify-center">
                    {cab.featuredMedia?.secureUrl || cab.image ? (
                      <CardMedia
                        src={cab.featuredMedia?.secureUrl ?? cab.image ?? ""}
                        alt={cab.vehicleType}
                        className="w-[90%] h-[90%] object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <Car className="size-16 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-4 text-center border-t border-border bg-card relative z-10">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {cab.vehicleType.replace(/_/g, " ")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                      Starting from{" "}
                      <Price
                        amount={Number(cab.priceFrom)}
                        size="sm"
                        className="font-bold text-foreground"
                      />
                      /km
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 3. Explore Destinations (City-based) */}
      {allCities.length > 0 && (
        <section className="py-12 border-b border-border bg-background">
          <Container>
            <div className="flex flex-col sm:flex-row items-end justify-between gap-4 mb-8">
              <SectionTitle
                title="Explore Destinations"
                description="Discover popular cities we operate in and book your next ride."
                align="left"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-primary/5 text-primary border-primary"
                >
                  All Destinations
                </Button>
              </div>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar">
              {allCities.map((cityItem) => (
                <Link
                  key={cityItem.id}
                  href={`/cabs?originCityId=${cityItem.id}`}
                  className="group relative shrink-0 snap-start rounded-2xl overflow-hidden w-36 h-48 border border-border bg-muted/50 hover:shadow-xl transition-all block"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="size-8 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center z-20 px-2">
                    <h4 className="font-bold text-base text-white drop-shadow-md line-clamp-1">
                      {cityItem.name}
                    </h4>
                    <p className="text-[10px] font-medium text-white/80 uppercase tracking-widest mt-1">
                      Explore
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 3.5. Popular Taxi Packages */}
      {packages.length > 0 && (
        <section className="py-12 border-b border-border bg-muted/10">
          <Container>
            <SectionTitle
              title="Popular Taxi Packages"
              description="Ready-made travel itineraries with comfortable vehicles."
              align="left"
            />
            <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-6 snap-x snap-mandatory mt-8">
              {packages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/packages/${pkg.slug}`}
                  className="group shrink-0 snap-start w-64 rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-video relative bg-muted overflow-hidden">
                    {pkg.featuredImage ? (
                      <CardMedia
                        src={pkg.featuredImage}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="size-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {pkg.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {pkg.durationDays} Days / {pkg.durationNights} Nights
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">From</span>
                      <Price amount={Number(pkg.priceFrom)} className="font-bold text-primary" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 4. The Fleet Listing Section */}
      <section className="py-16 bg-muted/10" id="fleet">
        <Container>
          <div className="flex flex-col sm:flex-row items-end justify-between gap-4 mb-8">
            <SectionTitle
              title="Available Cabs"
              description="Browse real vehicles available for immediate booking."
              align="left"
            />
            <div className="flex items-center gap-3 shrink-0">
              <form method="get" action="/cabs" className="relative flex items-center gap-2">
                <input type="hidden" name="originCityId" value={originCityId} />
                <input type="hidden" name="destinationCityId" value={destinationCityId} />
                <input type="hidden" name="travelDate" value={travelDate} />
                <input type="hidden" name="type" value={vehicleType} />
                <input type="hidden" name="trip" value={tripType} />
                <select
                  name="sort"
                  defaultValue={sort}
                  className="rounded-full border border-input bg-background px-4 py-2 text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
                >
                  <option value="newest">Sort: Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="capacity_desc">Highest Capacity</option>
                </select>
                <Button type="submit" variant="outline" size="sm" className="rounded-full">
                  Sort
                </Button>
              </form>
            </div>
          </div>

          {/* 5. Robust Empty States */}
          {result.networkError ? (
            <Card className="p-12 text-center max-w-2xl mx-auto border-destructive/20 bg-destructive/5">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
                <Car className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Cab Service Temporarily Unavailable
              </h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Cab service is temporarily unavailable. Please try again.
              </p>
              <Button asChild variant="outline">
                <Link href="/cabs">Try Again</Link>
              </Button>
            </Card>
          ) : result.items.length === 0 ? (
            <Card className="p-12 text-center max-w-2xl mx-auto border-dashed border-2">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Search className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No Cabs Match Your Search</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Try adjusting your filters, selecting a different city, or viewing all available
                fleet.
              </p>
              <Button asChild>
                <Link href="/cabs">View All Cabs</Link>
              </Button>
            </Card>
          ) : (
            <>
              <div className="flex overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-4 hide-scrollbar pb-6">
                {result.items.map((cab) => {
                  const displayCity = cab.serviceLocations?.[0]?.city?.name ?? "All Cities";
                  return (
                    <div
                      key={cab.id}
                      className="group shrink-0 snap-start w-[75vw] sm:w-72 lg:w-auto flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative aspect-[16/10] bg-white overflow-hidden p-4 border-b border-border/30 flex items-center justify-center">
                        {cab.featuredMedia?.secureUrl || cab.image ? (
                          <CardMedia
                            src={cab.featuredMedia?.secureUrl ?? cab.image ?? ""}
                            alt={cab.vehicleName}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                            <Car className="size-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex flex-col gap-2">
                          {cab.featured && (
                            <Badge
                              variant="accent"
                              className="shadow-sm w-fit font-bold tracking-wide text-[10px] px-2 py-0.5"
                            >
                              TOP RATED
                            </Badge>
                          )}
                        </div>
                        <span className="absolute top-2 right-2 rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase text-foreground shadow-sm backdrop-blur-md border border-border/50">
                          {cab.vehicleType.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              <Link href={`/cabs/${cab.slug}?${baseQuery.toString()}`}>
                                {cab.vehicleName}
                              </Link>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <MapPin className="size-3 text-primary" />
                              <span>{displayCity}</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-3 text-[11px] font-medium text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="size-3.5 text-primary/70" />
                            {cab.capacity} Seats
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="size-3.5 text-primary/70" />
                            {cab.luggageCapacity ?? 2} Bags
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Fuel className="size-3.5 text-primary/70" />
                            <span className="capitalize">{cab.fuelType.toLowerCase()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Snowflake className="size-3.5 text-sky-500" />
                            {cab.ac ? "AC" : "Non-AC"}
                          </div>
                        </div>

                        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                              Per Km
                            </span>
                            <Price
                              amount={Number(cab.priceFrom)}
                              className="text-sm font-extrabold text-foreground"
                            />
                          </div>
                          <Button
                            asChild
                            size="sm"
                            className="rounded-lg text-xs px-3 h-8 shadow-sm"
                          >
                            <Link href={`/cabs/${cab.slug}?${baseQuery.toString()}`}>Book Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const qs = new URLSearchParams(baseQuery);
                    qs.set("page", String(pageNum));
                    return (
                      <Button
                        key={pageNum}
                        asChild
                        size="icon"
                        variant={pageNum === page ? "primary" : "outline"}
                        className="rounded-full shadow-sm"
                      >
                        <Link href={`/cabs?${qs.toString()}`}>{pageNum}</Link>
                      </Button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      {/* 5. Popular Routes */}
      {popularRoutes.length > 0 && (
        <section className="py-12 bg-background border-t border-border">
          <Container>
            <SectionTitle
              title="Popular Routes"
              description="Frequently booked journeys with transparent pricing."
              align="left"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {popularRoutes.map((route) => (
                <div
                  key={route.id}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      {route.category.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-sm truncate">{route.originCity.name}</span>
                    <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                    <span className="font-bold text-sm truncate">{route.destinationCity.name}</span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground pt-3 border-t border-border/50 flex justify-between items-center">
                    <span>Starting from</span>
                    <Price
                      amount={Number(route.basePrice)}
                      className="font-bold text-foreground text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </PageWrapper>
  );
}
