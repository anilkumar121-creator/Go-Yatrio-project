import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { CardMedia } from "@/components/cards/card-media";
import { cn } from "@/lib/utils";

type DestinationCardProps = {
  name: string;
  location?: string;
  description?: string;
  image?: { src: string; alt: string };
  badge?: string;
  ctaLabel?: string;
  ctaHref: string;
  className?: string;
};

export function DestinationCard({
  name,
  location,
  description,
  image,
  badge,
  ctaLabel = "Explore",
  ctaHref,
  className,
}: DestinationCardProps) {
  return (
    <Card className={cn("group overflow-hidden p-0 hover-lift", className)}>
      <div className="relative">
        <CardMedia src={image?.src} alt={image?.alt ?? name} icon={MapPin} />
        {badge ? (
          <Badge variant="accent" className="absolute left-3 top-3 shadow-sm">
            {badge}
          </Badge>
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        {location ? (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {location}
          </p>
        ) : null}
        {description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground line-clamp-2">
            {description}
          </p>
        ) : null}
        <Link
          href={ctaHref}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {ctaLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
