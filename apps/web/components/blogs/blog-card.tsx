import Link from "next/link";
import { CalendarDays, Clock, Eye, ArrowRight } from "lucide-react";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Button } from "@/components/common/button";
import { CardMedia } from "@/components/cards/card-media";

export type BlogCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  featuredMedia?: { secureUrl: string; altText?: string | null } | null;
  readingTimeMinutes?: number;
  viewCount?: number;
  publishedAt?: string | null;
  author?: { id: string; name: string; slug: string } | null;
  categories?: { id: string; name: string; slug: string }[];
};

type BlogCardProps = {
  blog: BlogCardData;
  featured?: boolean;
};

export function BlogCard({ blog, featured = false }: BlogCardProps) {
  const date = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Draft";
  const imageUrl = blog.featuredMedia?.secureUrl ?? blog.featuredImage ?? "";

  return (
    <Card className={`overflow-hidden border border-border bg-card transition-all hover:shadow-md ${featured ? "shadow-lg" : "shadow-sm"}`}>
      <Link href={`/blogs/${blog.slug}`} className="block relative aspect-[16/10]">
        {imageUrl ? (
          <CardMedia src={imageUrl} alt={blog.title} className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-4xl">??</div>
        )}
        {featured ? <Badge variant="accent" className="absolute left-3 top-3">Featured</Badge> : null}
      </Link>

      <div className="p-5 space-y-3">
        {blog.categories && blog.categories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {blog.categories.slice(0, 2).map((c) => (
              <Badge key={c.id} variant="secondary" className="text-[11px]">{c.name}</Badge>
            ))}
          </div>
        ) : null}

        <h3 className="text-lg font-semibold text-foreground leading-snug hover:text-primary">
          <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{blog.excerpt}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground border-t border-border">
          {blog.author ? (
            <span className="font-medium text-foreground">{blog.author.name}</span>
          ) : null}
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5 text-primary" />
            {date}
          </span>
          {blog.readingTimeMinutes ? (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-primary" />
              {blog.readingTimeMinutes} min
            </span>
          ) : null}
          {typeof blog.viewCount === "number" ? (
            <span className="flex items-center gap-1">
              <Eye className="size-3.5 text-primary" />
              {blog.viewCount}
            </span>
          ) : null}
        </div>

        <div className="pt-1">
          <Button asChild size="sm" variant="outline" className="gap-1">
            <Link href={`/blogs/${blog.slug}`}>
              Read Article
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
