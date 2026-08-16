import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Eye, MapPin, Package, ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { Badge } from "@/components/common/badge";
import { Card } from "@/components/common/card";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { CardMedia } from "@/components/cards/card-media";
import { BlogContentRenderer } from "@/components/blogs/blog-content";
import { BlogLeadCta } from "@/components/blogs/blog-lead-cta";
import { BlogJsonLd } from "@/components/blogs/blog-jsonld";
import { BlogViewTracker } from "@/components/blogs/blog-view-tracker";
import { BlogCard, type BlogCardData } from "@/components/blogs/blog-card";

type BlogDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat: string;
  contentBlocks: unknown[] | null;
  faq: { question: string; answer: string }[] | null;
  featuredImage: string | null;
  galleryImages: string[];
  author: { id: string; name: string; slug: string; avatar: string | null; role: string | null; bio: string | null } | null;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  featured: boolean;
  viewCount: number;
  readingTimeMinutes: number;
  publishedAt: string | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  destinations: { id: string; name: string; slug: string }[];
  packages: { id: string; title: string; slug: string; durationDays: number; priceFrom: number }[];
};

async function getBlog(slug: string): Promise<BlogDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

async function getRelatedBlogs(slug: string): Promise<BlogCardData[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blogs/${slug}/related`, { cache: "no-store" });
    if (!res.ok) return [];
    const payload = await res.json();
    return payload?.data ?? [];
  } catch {
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!blog) {
    return { title: "Article Not Found | GoYatrio" };
  }

  const title = blog.seoTitle ?? `${blog.title} | GoYatrio Blog`;
  const description = blog.seoDescription ?? blog.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: blog.canonicalUrl ?? `${baseUrl}/blogs/${blog.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "en_IN",
      url: `${baseUrl}/blogs/${blog.slug}`,
      publishedTime: blog.publishedAt ?? undefined,
      images: blog.featuredImage ? [{ url: blog.featuredImage, alt: blog.title }] : undefined,
    },
  };
}

export default async function PublicBlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = await getRelatedBlogs(blog.slug);
  const date = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Draft";
  const primaryDestination = blog.destinations[0];

  return (
    <PageWrapper>
      <BlogViewTracker slug={blog.slug} />
      <BlogJsonLd
        headline={blog.title}
        description={blog.excerpt}
        image={blog.featuredImage}
        datePublished={blog.publishedAt}
        dateModified={blog.publishedAt}
        authorName={blog.author?.name}
        slug={blog.slug}
        categories={blog.categories}
        faq={blog.faq}
      />

      <section className="py-10 bg-muted/20 border-b border-border">
        <Container className="max-w-4xl">
          <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <Link href="/blogs">
              <ArrowLeft className="size-4" />
              Back to Blog
            </Link>
          </Button>

          <div className="mt-6 flex flex-wrap gap-2">
            {blog.categories.map((c) => (
              <Badge key={c.id} variant="secondary">{c.name}</Badge>
            ))}
            {blog.tags.map((t) => (
              <Badge key={t.id} variant="outline" className="text-[11px]">#{t.slug}</Badge>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight text-foreground tablet:text-4xl">
            {blog.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{blog.excerpt}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground border-t border-border pt-4">
            {blog.author ? (
              <span className="flex items-center gap-2">
                {blog.author.avatar ? (
                  <CardMedia src={blog.author.avatar} alt={blog.author.name} className="size-7 rounded-full" />
                ) : null}
                <span className="font-semibold text-foreground">{blog.author.name}</span>
                {blog.author.role ? <span>· {blog.author.role}</span> : null}
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5 text-primary" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-primary" />
              {blog.readingTimeMinutes} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3.5 text-primary" />
              {blog.viewCount} views
            </span>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container className="max-w-4xl">
          {blog.featuredImage ? (
            <div className="mb-10 overflow-hidden rounded-xl">
              <Image src={blog.featuredImage} alt={blog.title} width={1200} height={675} className="w-full object-cover" />
            </div>
          ) : null}

          <article>
            <BlogContentRenderer blocks={blog.contentBlocks as never} fallbackContent={blog.content} />
          </article>

          <div className="mt-10">
            <BlogLeadCta destinations={blog.destinations} />
          </div>

          {/* Related Destinations */}
          {blog.destinations.length > 0 ? (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-foreground mb-5 flex items-center gap-2">
                <MapPin className="size-6 text-primary" />
                Destinations in This Guide
              </h2>
              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                {blog.destinations.map((dest) => (
                  <Card key={dest.id} className="p-5 border-border">
                    <Link href={`/destinations/${dest.slug}`} className="font-semibold text-foreground hover:text-primary">
                      {dest.name}
                    </Link>
                    <div className="mt-2">
                      <Button asChild size="sm" variant="outline" className="gap-1">
                        <Link href={`/destinations/${dest.slug}`}>
                          Explore {dest.name}
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {/* Related Packages */}
          {blog.packages.length > 0 ? (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-foreground mb-5 flex items-center gap-2">
                <Package className="size-6 text-primary" />
                Featured Packages
              </h2>
              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                {blog.packages.map((pkg) => (
                  <Card key={pkg.id} className="p-5 border-border">
                    <Link href={`/packages/${pkg.slug}`} className="font-semibold text-foreground hover:text-primary">
                      {pkg.title}
                    </Link>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{pkg.durationDays} Days</span>
                      <Price amount={Number(pkg.priceFrom)} size="sm" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {/* Related Articles */}
          {relatedBlogs.length > 0 ? (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-foreground mb-5">Related Articles</h2>
              <div className="grid grid-cols-1 gap-6 tablet:grid-cols-3">
                {relatedBlogs.map((related) => (
                  <BlogCard key={related.id} blog={related} />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </PageWrapper>
  );
}
