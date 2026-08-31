import Link from "next/link";
import { ArrowRight, Car, Users } from "lucide-react";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Price } from "@/components/common/price";
import { CardMedia } from "@/components/cards/card-media";
import { cn } from "@/lib/utils";

type CabCardProps = {
  vehicleName: string;
  vehicleType: string;
  seatingCapacity: number;
  price: number;
  image?: { src: string; alt: string };
  ctaLabel?: string;
  ctaHref: string;
  className?: string;
};

export function CabCard({
  vehicleName,
  vehicleType,
  seatingCapacity,
  price,
  image,
  ctaLabel = "Book Cab",
  ctaHref,
  className,
}: CabCardProps) {
  return (
    <Card className={cn("group overflow-hidden p-0 hover-lift", className)}>
      <div className="relative">
        <CardMedia src={image?.src} alt={image?.alt ?? vehicleName} icon={Car} aspect="square" />
        <Badge className="absolute left-3 top-3 shadow-sm">{vehicleType}</Badge>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground">{vehicleName}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="size-3.5 shrink-0" aria-hidden="true" />
          Up to {seatingCapacity} passengers
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Price amount={price} per="per trip" size="sm" />
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {ctaLabel}
            <ArrowRight
              className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </Card>
  );
}
