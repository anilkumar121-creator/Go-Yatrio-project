import type { MetadataRoute } from "next";

export const revalidate = 86400; // Cache sitemap for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticCandidates = [
    { pageType: "homepage", url: baseUrl, changeFrequency: "weekly" as const, priority: 1.0 },
    {
      pageType: "destinations",
      url: `${baseUrl}/destinations`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      pageType: "packages",
      url: `${baseUrl}/packages`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      pageType: "itineraries",
      url: `${baseUrl}/itineraries`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      pageType: "hotels",
      url: `${baseUrl}/hotels`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    { pageType: "cabs", url: `${baseUrl}/cabs`, changeFrequency: "weekly" as const, priority: 0.8 },
    {
      pageType: "blogs",
      url: `${baseUrl}/blogs`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      pageType: "contact",
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  try {
    const [destinations, packages, hotels, cabs, blogs, seoMetadata] = await Promise.all([
      fetch(`${baseUrl}/api/destinations?take=200`, {
        next: { revalidate: 86400, tags: ["sitemap-destinations"] },
      })
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${baseUrl}/api/packages?take=200`, {
        next: { revalidate: 86400, tags: ["sitemap-packages"] },
      })
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${baseUrl}/api/hotels?take=200`, {
        next: { revalidate: 86400, tags: ["sitemap-hotels"] },
      })
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${baseUrl}/api/cabs?take=200`, { next: { revalidate: 86400, tags: ["sitemap-cabs"] } })
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${baseUrl}/api/blogs?take=200`, {
        next: { revalidate: 86400, tags: ["sitemap-blogs"] },
      })
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${baseUrl}/api/seo-metadata`, { next: { revalidate: 86400, tags: ["sitemap-seo"] } })
        .then((r) => r.json())
        .catch(() => null),
    ]);

    // Map of noindex pageTypes
    const noIndexSet = new Set<string>();
    const seoList = Array.isArray(seoMetadata?.data) ? seoMetadata.data : [];
    for (const item of seoList) {
      if (item.robots?.toLowerCase().includes("noindex")) {
        noIndexSet.add(item.pageType);
      }
    }

    const staticRoutes: MetadataRoute.Sitemap = staticCandidates
      .filter((candidate) => !noIndexSet.has(candidate.pageType))
      .map((candidate) => ({
        url: candidate.url,
        lastModified: new Date(),
        changeFrequency: candidate.changeFrequency,
        priority: candidate.priority,
      }));

    const destinationList = Array.isArray(destinations?.data) ? destinations.data : [];
    const destinationRoutes: MetadataRoute.Sitemap = destinationList.map(
      (d: { slug: string; updatedAt?: string }) => ({
        url: `${baseUrl}/destinations/${d.slug}`,
        lastModified: new Date(d.updatedAt ?? Date.now()),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    );

    const packageList = Array.isArray(packages?.data?.data)
      ? packages.data.data
      : Array.isArray(packages?.data)
        ? packages.data
        : [];
    const packageRoutes: MetadataRoute.Sitemap = packageList.map(
      (p: { slug: string; updatedAt?: string }) => ({
        url: `${baseUrl}/packages/${p.slug}`,
        lastModified: new Date(p.updatedAt ?? Date.now()),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    );

    const hotelList = Array.isArray(hotels?.data?.data)
      ? hotels.data.data
      : Array.isArray(hotels?.data)
        ? hotels.data
        : [];
    const hotelRoutes: MetadataRoute.Sitemap = hotelList.map(
      (h: { slug: string; updatedAt?: string }) => ({
        url: `${baseUrl}/hotels/${h.slug}`,
        lastModified: new Date(h.updatedAt ?? Date.now()),
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    );

    const cabList = Array.isArray(cabs?.data?.data)
      ? cabs.data.data
      : Array.isArray(cabs?.data)
        ? cabs.data
        : [];
    const cabRoutes: MetadataRoute.Sitemap = cabList.map(
      (c: { slug: string; updatedAt?: string }) => ({
        url: `${baseUrl}/cabs/${c.slug}`,
        lastModified: new Date(c.updatedAt ?? Date.now()),
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    );

    const blogList = Array.isArray(blogs?.data?.data)
      ? blogs.data.data
      : Array.isArray(blogs?.data)
        ? blogs.data
        : [];
    const blogRoutes: MetadataRoute.Sitemap = blogList.map(
      (b: { slug: string; publishedAt?: string }) => ({
        url: `${baseUrl}/blogs/${b.slug}`,
        lastModified: new Date(b.publishedAt ?? Date.now()),
        changeFrequency: "monthly",
        priority: 0.8,
      }),
    );

    return [
      ...staticRoutes,
      ...destinationRoutes,
      ...packageRoutes,
      ...hotelRoutes,
      ...cabRoutes,
      ...blogRoutes,
    ];
  } catch {
    return staticCandidates.map((candidate) => ({
      url: candidate.url,
      lastModified: new Date(),
      changeFrequency: candidate.changeFrequency,
      priority: candidate.priority,
    }));
  }
}
