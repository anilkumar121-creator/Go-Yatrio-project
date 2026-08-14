import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { CardMedia } from "@/components/cards/card-media";
import { cn } from "@/lib/utils";

type BlogCardProps = {
  title: string;
  category?: string;
  author?: string;
  date?: string;
  excerpt?: string;
  image?: { src: string; alt: string };
  ctaLabel?: string;
  ctaHref: string;
  className?: string;
};

export function BlogCard({
  title,
  category,
  author,
  date,
  excerpt,
  image,
  ctaLabel = "Read More",
  ctaHref,
  className,
}: BlogCardProps) {
  return (
    <Card className={cn("group overflow-hidden p-0 hover-lift", className)}>
      <div className="relative">
        <CardMedia src={image?.src} alt={image?.alt ?? title} aspect="landscape" />
        {category ? (
          <Badge variant="secondary" className="absolute left-3 top-3 shadow-sm">
            {category}
          </Badge>
        ) : null}
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {author ? <span>{author}</span> : null}
          {date ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {date}
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-6 text-foreground">{title}</h3>
        {excerpt ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
            {excerpt}
          </p>
        ) : null}
        <Link
          href={ctaHref}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {ctaLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
