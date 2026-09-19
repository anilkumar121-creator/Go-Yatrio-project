import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Briefcase, MapPin, Calendar, Car } from "lucide-react";
import { Container } from "@/components/common/container";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Price } from "@/components/common/price";
import { CabCustomerDetailsForm } from "@/components/cabs/cab-customer-details-form";
import { decodeStops } from "@/lib/cab-search-utils";
import { CardMedia } from "@/components/cards/card-media";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getCab(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/cabs/${slug}`, {
      next: { revalidate: 300, tags: [`cab-${slug}`, "cabs"] },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

async function getCities() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/locations/cities?take=200`, {
      next: { revalidate: 600, tags: ["cities"] },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    return Array.isArray(payload?.data)
      ? payload.data
      : (payload?.data?.items ?? payload?.data?.data ?? []);
  } catch {
    return [];
  }
}

export default async function CabBookingReviewPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const cab = await getCab(slug);
  if (!cab) {
    notFound();
  }

  // Use cab-search-utils to decode URL params
  const searchParamsDict = resolvedSearchParams as Record<string, string>;
  const searchState = {
    tripType: searchParamsDict.trip || "LOCAL",
    originCityId: searchParamsDict.from,
    destinationCityId: searchParamsDict.to,
    pickupDate: searchParamsDict.date,
    pickupTime: searchParamsDict.time,
    returnDate: searchParamsDict.returnDate,
    returnTime: searchParamsDict.returnTime,
    stops: decodeStops(searchParamsDict.stops),
  };
  const cities = await getCities();

  // Try to calculate fare
  let estimatedFare = 0;
  let isExactFare = false;
  let requiresManualPricing = false;
  const routePricingId = undefined;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const fareRes = await fetch(`${baseUrl}/api/cabs/calculate-fare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originCityId: searchState.originCityId,
        destinationCityId: searchState.destinationCityId,
        vehicleId: cab.id,
        categoryId: cab.categoryId || "",
        tripTypeId: searchState.tripType,
        passengers: 1,
      }),
    });
    if (fareRes.ok) {
      const fareData = await fareRes.json();
      if (fareData.success && fareData.data.available) {
        estimatedFare = fareData.data.fare;
        isExactFare = true;
      } else if (fareData.success && fareData.data.requiresManualPricing) {
        requiresManualPricing = true;
      } else {
        requiresManualPricing = true;
      }
    } else {
      requiresManualPricing = true;
    }
  } catch {
    requiresManualPricing = true;
  }

  const getCityName = (id?: string) => {
    if (!id) return "Unknown";
    const city = cities.find((c: { id: string; name: string }) => c.id === id);
    return city ? city.name : "Unknown Location";
  };

  const pickupLocation = searchState.originCityId
    ? getCityName(searchState.originCityId)
    : "Any City";
  const dropLocation = searchState.destinationCityId
    ? getCityName(searchState.destinationCityId)
    : searchState.tripType === "LOCAL" ||
        searchState.tripType === "ROUND_TRIP" ||
        searchState.tripType === "MULTI_DAY"
      ? pickupLocation
      : "Unknown";

  const bookingPayload = {
    vehicleId: cab.id,
    routePricingId,
    pickupLocation,
    dropLocation,
    distanceKm: undefined,
    pickupDate: searchState.pickupDate,
    pickupTime: searchState.pickupTime || "10:00",
    returnDate: searchState.returnDate || null,
    returnTime: searchState.returnTime || null,
    stops: searchState.stops.length > 0 ? searchState.stops : undefined,
    passengers: cab.capacity,
    tripType: searchState.tripType,
    vehicleCategory: cab.vehicleType,
    calculatedFare: estimatedFare,
    advanceAmount: estimatedFare * 0.2,
    remainingAmount: estimatedFare * 0.8,
  };

  const imageUrl = cab.featuredMedia?.secureUrl ?? cab.image;

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="bg-primary text-primary-foreground py-8">
        <Container>
          <Link
            href={`/cabs/${slug}?${new URLSearchParams(resolvedSearchParams as Record<string, string>).toString()}`}
            className="inline-flex items-center text-sm font-medium hover:underline opacity-80 mb-6 transition-opacity hover:opacity-100"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Cab Details
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Review & Book</h1>
          <p className="mt-2 text-primary-foreground/80">
            Confirm your trip details and complete your booking.
          </p>
        </Container>
      </div>

      <Container className="-mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CabCustomerDetailsForm
              bookingPayload={bookingPayload}
              requiresManualPricing={requiresManualPricing}
            />
          </div>

          <div className="space-y-6">
            <Card className="p-0 overflow-hidden border-border shadow-sm">
              {imageUrl && (
                <div className="aspect-[16/9] w-full relative">
                  <CardMedia src={imageUrl} alt={cab.vehicleName} className="object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl">{cab.vehicleName}</h3>
                  <Badge variant="outline">{cab.vehicleType}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Users className="size-4 mr-1" /> {cab.capacity}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="size-4 mr-1" /> {cab.luggageCapacity}
                  </div>
                  <div className="flex items-center">
                    <Car className="size-4 mr-1" /> {cab.ac ? "AC" : "Non-AC"}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="font-semibold text-sm">Trip Summary</h4>

                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Pickup</p>
                      <p className="text-muted-foreground">{pickupLocation}</p>
                    </div>
                  </div>

                  {searchState.tripType !== "LOCAL" && (
                    <div className="flex items-start gap-3">
                      <MapPin className="size-4 text-destructive mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Drop-off</p>
                        <p className="text-muted-foreground">{dropLocation}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="size-4 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Pickup Date & Time</p>
                      <p className="text-muted-foreground">
                        {searchState.pickupDate
                          ? new Date(searchState.pickupDate).toLocaleDateString()
                          : "TBD"}{" "}
                        at {searchState.pickupTime || "10:00"}
                      </p>
                    </div>
                  </div>

                  {searchState.returnDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="size-4 text-primary mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Return Date & Time</p>
                        <p className="text-muted-foreground">
                          {new Date(searchState.returnDate).toLocaleDateString()} at{" "}
                          {searchState.returnTime || "10:00"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {searchState.tripType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground text-sm">Total Fare</span>
                    {requiresManualPricing ? (
                      <span className="font-semibold text-warning text-sm">
                        Confirmation required
                      </span>
                    ) : (
                      <Price amount={estimatedFare} className="text-xl font-bold text-foreground" />
                    )}
                  </div>
                  {!isExactFare && !requiresManualPricing && (
                    <p className="text-[10px] text-muted-foreground text-right">
                      * Estimated base fare. Final price will be calculated offline.
                    </p>
                  )}
                  {requiresManualPricing && (
                    <p className="text-[10px] text-warning text-right">
                      * Authoritative fare could not be calculated. Manual review is required.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
