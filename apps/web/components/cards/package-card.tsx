import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Rating } from "@/components/common/rating";
import { Price } from "@/components/common/price";
import { CardMedia } from "@/components/cards/card-media";
import { cn } from "@/lib/utils";

type PackageCardProps = {
  title: string;
  destination: string;
  duration: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  badge?: string;
  availability?: string;
  availableSeats?: number;
  image?: { src: string; alt: string };
  ctaLabel?: string;
  ctaHref: string;
  className?: string;
};

export function PackageCard({
  title,
  destination,
  duration,
  price,
  originalPrice,
  rating,
  reviews,
  badge,
  availability,
  availableSeats,
  image,
  ctaLabel = "View Package",
  ctaHref,
  className,
}: PackageCardProps) {
  return (
    <Card className={cn("group overflow-hidden p-0 hover-lift", className)}>
      <div className="relative">
        <CardMedia src={image?.src} alt={image?.alt ?? title} />
        {badge ? (
          <Badge className="absolute left-3 top-3 shadow-sm">{badge}</Badge>
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold leading-6 text-foreground">{title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden="true" />
            {destination}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {duration}
          </span>
        </div>
        {rating !== undefined ? (
          <div className="mt-2">
            <Rating value={rating} count={reviews} />
          </div>
        ) : null}
        {availability ? (
          <div className="mt-2">
            <span
              className={
                availability === "SOLD_OUT"
                  ? "text-xs font-semibold text-error"
                  : availability === "UPCOMING"
                    ? "text-xs font-semibold text-muted-foreground"
                    : "text-xs font-semibold text-success"
              }
            >
              {availability === "AVAILABLE"
                ? "Available"
                : availability === "LIMITED_SEATS"
                  ? `Only ${availableSeats ?? 0} seats left`
                  : availability === "SOLD_OUT"
                    ? "Sold Out"
                    : "Upcoming"}
            </span>
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <Price amount={price} originalAmount={originalPrice} per="per person" size="sm" />
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
