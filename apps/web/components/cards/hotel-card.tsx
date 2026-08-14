import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Rating } from "@/components/common/rating";
import { Price } from "@/components/common/price";
import { CardMedia } from "@/components/cards/card-media";
import { cn } from "@/lib/utils";

type HotelCardProps = {
  name: string;
  location: string;
  rating?: number;
  reviews?: number;
  facilities?: string[];
  pricePerNight: number;
  image?: { src: string; alt: string };
  ctaLabel?: string;
  ctaHref: string;
  className?: string;
};

export function HotelCard({
  name,
  location,
  rating,
  reviews,
  facilities = [],
  pricePerNight,
  image,
  ctaLabel = "View Hotel",
  ctaHref,
  className,
}: HotelCardProps) {
  return (
    <Card className={cn("group overflow-hidden p-0 hover-lift", className)}>
      <CardMedia src={image?.src} alt={image?.alt ?? name} />
      <div className="p-5">
        <h3 className="text-lg font-semibold leading-6 text-foreground">{name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {location}
        </p>
        {rating !== undefined ? (
          <div className="mt-2">
            <Rating value={rating} count={reviews} />
          </div>
        ) : null}
        {facilities.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {facilities.map((facility) => (
              <li key={facility}>
                <Badge variant="muted">{facility}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <Price amount={pricePerNight} per="per night" size="sm" />
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {ctaLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
