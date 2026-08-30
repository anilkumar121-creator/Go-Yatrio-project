import type { Metadata } from "next";
import Link from "next/link";
import { Search, FileText } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { BlogCard, type BlogCardData } from "@/components/blogs/blog-card";

import { resolvePageMetadata } from "@/components/seo/seo";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata({
    pageType: "blogs",
    fallbackTitle: "Travel Blog & Destination Guides | GoYatrio",
    fallbackDescription:
      "Read expert travel guides, destination insights, package highlights, and trip-planning tips from the GoYatrio blog.",
    path: "/blogs",
  });
}

type CategoryOption = { id: string; name: string; slug: string };

async function getBlogs(
  search = "",
  category = "",
  tag = "",
  sort = "newest",
  skip = 0,
): Promise<{ items: BlogCardData[]; total: number }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const params = new URLSearchParams({ take: "9", skip: String(skip) });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    if (sort !== "newest") params.set("sort", sort);

    const res = await fetch(`${baseUrl}/api/blogs?${params.toString()}`, {
      next: { revalidate: 180, tags: ["blogs"] },
    });
    if (!res.ok) return { items: [], total: 0 };
    const payload = await res.json();
    return { items: payload?.data ?? [], total: payload?.meta?.total ?? 0 };
  } catch {
    return { items: [], total: 0 };
  }
}

async function getCategories(): Promise<CategoryOption[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blogs/categories`, {
      next: { revalidate: 600, tags: ["blog-categories"] },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    return payload?.data ?? [];
  } catch {
    return [];
  }
}

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function PublicBlogsPage({ searchParams }: Props) {
  const params = await searchParams;

  const search = params.search ?? "";
  const category = params.category ?? "";
  const tag = params.tag ?? "";
  const sort = params.sort ?? "newest";
  const page = Number(params.page) || 1;
  const skip = (page - 1) * 9;

  const [result, categories] = await Promise.all([
    getBlogs(search, category, tag, sort, skip),
    getCategories(),
  ]);

  const totalPages = Math.ceil(result.total / 9);

  const baseQuery = new URLSearchParams();
  if (search) baseQuery.set("search", search);
  if (category) baseQuery.set("category", category);
  if (tag) baseQuery.set("tag", tag);
  if (sort) baseQuery.set("sort", sort);

  return (
    <PageWrapper>
      <section className="bg-primary/5 py-12 tablet:py-16 border-b border-border">
        <Container>
          <SectionTitle
            title="Travel Blog & Destination Guides"
            description="Expert-written guides, trip-planning tips, and destination stories to inspire your next GoYatrio holiday."
            align="left"
          />
        </Container>
      </section>

      <section className="py-8 border-b border-border bg-background">
        <Container>
          <form className="grid grid-cols-1 gap-3 tablet:grid-cols-5" method="get" action="/blogs">
            <div className="tablet:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search articles, destinations, tips..."
                  className="pl-9"
                />
              </div>
            </div>

            <select
              name="category"
              defaultValue={category}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={sort}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_viewed">Most Viewed</option>
            </select>

            <div className="tablet:col-span-full flex items-center gap-3">
              <Button type="submit" size="sm">
                Apply Filters
              </Button>
              {search || category || tag || sort !== "newest" ? (
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                  <Link href="/blogs">Clear All</Link>
                </Button>
              ) : null}
            </div>
          </form>
        </Container>
      </section>

      <section className="py-12 tablet:py-16">
        <Container>
          {result.items.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="mx-auto size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No Articles Found</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Try a different search or remove filters to explore more travel stories.
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
                {result.items.map((blog, idx) => (
                  <BlogCard key={blog.id} blog={blog} featured={idx === 0 && page === 1} />
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const qs = new URLSearchParams(baseQuery);
                    qs.set("page", String(pageNum));
                    return (
                      <Button
                        key={pageNum}
                        asChild
                        size="sm"
                        variant={pageNum === page ? "primary" : "outline"}
                        className="h-9 w-9 p-0 font-mono"
                      >
                        <Link href={`/blogs?${qs.toString()}`}>{pageNum}</Link>
                      </Button>
                    );
                  })}
                </div>
              ) : null}
            </>
          )}
        </Container>
      </section>
    </PageWrapper>
  );
}
