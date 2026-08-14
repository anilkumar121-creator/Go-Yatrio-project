import Image from "next/image";
import { Quote } from "lucide-react";
import { Card } from "@/components/common/card";
import { Rating } from "@/components/common/rating";
import { cn } from "@/lib/utils";

type TestimonialCardProps = {
  name: string;
  testimonial: string;
  rating?: number;
  location?: string;
  avatar?: { src: string; alt: string };
  className?: string;
};

export function TestimonialCard({
  name,
  testimonial,
  rating,
  location,
  avatar,
  className,
}: TestimonialCardProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "G";

  return (
    <Card className={cn("relative p-6", className)}>
      <Quote className="absolute right-5 top-5 size-8 text-muted" aria-hidden="true" />
      {rating !== undefined ? (
        <div>
          <Rating value={rating} />
        </div>
      ) : null}
      <blockquote className="mt-3">
        <p className="text-sm leading-7 text-foreground">&ldquo;{testimonial}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {avatar?.src ? (
          <Image
            src={avatar.src}
            alt={avatar.alt ?? name}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
            aria-hidden="true"
          >
            {initial}
          </span>
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          {location ? (
            <p className="text-xs text-muted-foreground">{location}</p>
          ) : null}
        </div>
      </figcaption>
    </Card>
  );
}
