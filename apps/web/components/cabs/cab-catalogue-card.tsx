import React from "react";
import Link from "next/link";
import { Users, Briefcase, Fuel, Snowflake, MapPin, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";
import { CardMedia } from "@/components/cards/card-media";

type CityOption = {
  id: string;
  name: string;
  stateId: string;
  state?: { name: string };
};

export type CabCardType = {
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

type Props = {
  cab: CabCardType;
  baseQuery: URLSearchParams;
};

export function CabCatalogueCard({ cab, baseQuery }: Props) {
  const displayCity = cab.serviceLocations?.[0]?.city?.name ?? "All Cities";
  const imageUrl = cab.featuredMedia?.secureUrl ?? cab.image;

  return (
    <Card className="group overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-1/3 aspect-[16/10] md:aspect-auto md:min-h-[220px] bg-white border-b md:border-b-0 md:border-r border-border/30 flex items-center justify-center p-4">
          {imageUrl ? (
            <CardMedia
              src={imageUrl}
              alt={cab.vehicleName}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <span className="text-muted-foreground/30 font-semibold text-lg">No Image</span>
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

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            {/* Left side (Details) */}
            <div className="flex-1">
              <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                <Link href={`/cabs/${cab.slug}?${baseQuery.toString()}`}>{cab.vehicleName}</Link>
              </h3>

              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                <MapPin className="size-3.5 text-primary" />
                <span>{displayCity}</span>
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-2 text-xs font-medium text-muted-foreground mb-4">
                <div className="flex items-center gap-1.5">
                  <Users className="size-4 text-primary/70" />
                  {cab.capacity} Seats
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="size-4 text-primary/70" />
                  {cab.luggageCapacity ?? 2} Bags
                </div>
                <div className="flex items-center gap-1.5">
                  <Fuel className="size-4 text-primary/70" />
                  <span className="capitalize">{cab.fuelType.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Snowflake className="size-4 text-sky-500" />
                  {cab.ac ? "AC" : "Non-AC"}
                </div>
              </div>

              {cab.tripTypes && cab.tripTypes.length > 0 && (
                <div className="hidden md:flex flex-wrap gap-1.5">
                  {cab.tripTypes.map((trip) => (
                    <Badge
                      key={trip}
                      variant="outline"
                      className="text-[9px] uppercase tracking-wider bg-muted/20 text-muted-foreground border-border/50"
                    >
                      {trip}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Right side (Pricing & Action) */}
            <div className="flex flex-col md:items-end justify-between md:w-48 shrink-0 md:border-l border-border/50 md:pl-5 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0">
              <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end w-full mb-4 md:mb-0">
                <div className="flex flex-col md:items-end">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                    Starting Price
                  </span>
                  <Price
                    amount={Number(cab.priceFrom)}
                    className="text-xl md:text-2xl font-extrabold text-foreground"
                  />
                  <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    per km
                  </span>
                </div>
                <div className="md:mt-4 hidden md:flex items-center text-[10px] text-success font-medium">
                  <CheckCircle2 className="size-3 mr-1" />
                  Instant Quote Available
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full rounded-xl text-sm font-semibold shadow-md mt-auto"
              >
                <Link href={`/cabs/${cab.slug}?${baseQuery.toString()}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
