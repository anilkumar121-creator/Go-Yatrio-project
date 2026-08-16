import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/destinations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/packages`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/itineraries`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/hotels`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/cabs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const [destinations, packages, hotels, cabs, blogs] = await Promise.all([
      fetch(`${baseUrl}/api/destinations?take=200`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch(`${baseUrl}/api/packages?take=200`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch(`${baseUrl}/api/hotels?take=200`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch(`${baseUrl}/api/cabs?take=200`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch(`${baseUrl}/api/blogs?take=200`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]);

    const destinationRoutes: MetadataRoute.Sitemap = (destinations?.data ?? []).map((d: { slug: string; updatedAt?: string }) => ({
      url: `${baseUrl}/destinations/${d.slug}`,
      lastModified: new Date(d.updatedAt ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const packageRoutes: MetadataRoute.Sitemap = (packages?.data ?? []).map((p: { slug: string; updatedAt?: string }) => ({
      url: `${baseUrl}/packages/${p.slug}`,
      lastModified: new Date(p.updatedAt ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const hotelRoutes: MetadataRoute.Sitemap = (hotels?.data ?? []).map((h: { slug: string; updatedAt?: string }) => ({
      url: `${baseUrl}/hotels/${h.slug}`,
      lastModified: new Date(h.updatedAt ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const cabRoutes: MetadataRoute.Sitemap = (cabs?.data ?? []).map((c: { slug: string; updatedAt?: string }) => ({
      url: `${baseUrl}/cabs/${c.slug}`,
      lastModified: new Date(c.updatedAt ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const blogRoutes: MetadataRoute.Sitemap = (blogs?.data ?? []).map((b: { slug: string; publishedAt?: string }) => ({
      url: `${baseUrl}/blogs/${b.slug}`,
      lastModified: new Date(b.publishedAt ?? Date.now()),
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    return [
      ...staticRoutes,
      ...destinationRoutes,
      ...packageRoutes,
      ...hotelRoutes,
      ...cabRoutes,
      ...blogRoutes,
    ];
  } catch {
    return staticRoutes;
  }
}
