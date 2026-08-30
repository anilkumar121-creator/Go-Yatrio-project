import type { Metadata } from "next";

export type SeoRecord = {
  id: string;
  pageType: string;
  entityType?: string | null;
  entityId?: string | null;
  title: string;
  description: string;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  robots?: string | null;
};

export type ResolveSeoOptions = {
  pageType?: string;
  entityType?: string;
  entityId?: string;
  fallbackTitle: string;
  fallbackDescription: string;
  path?: string;
  image?: string;
  robots?: string;
};

const DEFAULT_OG_IMAGE = "/brand/goyatrio-logo.png";
const BASE_APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Fetch resolved SEO metadata for a page or entity from the API.
 * Safely catches network/JSON errors and returns null on failure.
 */
export async function fetchSeoMetadata(
  pageType: string,
  entityType?: string,
  entityId?: string,
): Promise<SeoRecord | null> {
  try {
    const params = new URLSearchParams({ pageType });
    if (entityType) params.set("entityType", entityType);
    if (entityId) params.set("entityId", entityId);

    const res = await fetch(`${BASE_APP_URL}/api/seo-metadata/by-page?${params.toString()}`, {
      next: { revalidate: 600, tags: ["seo-metadata"] },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as SeoRecord) || null;
  } catch {
    return null;
  }
}

/**
 * Resolves a complete Next.js Metadata object using database SEO overrides
 * with fallback to hardcoded defaults.
 */
export async function resolvePageMetadata(options: ResolveSeoOptions): Promise<Metadata> {
  const {
    pageType,
    entityType,
    entityId,
    fallbackTitle,
    fallbackDescription,
    path = "/",
    image = DEFAULT_OG_IMAGE,
    robots: fallbackRobots = "index, follow",
  } = options;

  let seoRecord: SeoRecord | null = null;
  if (pageType) {
    seoRecord = await fetchSeoMetadata(pageType, entityType, entityId);
  }

  const title = seoRecord?.title || fallbackTitle;
  const description = seoRecord?.description || fallbackDescription;
  const ogImage = seoRecord?.ogImage || image;
  const canonicalUrl = seoRecord?.canonicalUrl || path;
  const robotsString = seoRecord?.robots || fallbackRobots;

  const isNoIndex = robotsString.toLowerCase().includes("noindex");
  const isNoFollow = robotsString.toLowerCase().includes("nofollow");

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      siteName: "GoYatrio",
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: !isNoIndex,
      follow: !isNoFollow,
    },
  };
}

/**
 * Organization JSON-LD Schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "GoYatrio",
    url: BASE_APP_URL,
    logo: `${BASE_APP_URL}/brand/goyatrio-logo.png`,
    description:
      "Premium travel planning for domestic tours, luxury escapes, adventure trips, pilgrimage packages, cab services, and verified hotels across India.",
    telephone: "+91 98765 43210",
    email: "support@goyatrio.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "India",
    },
    sameAs: [
      "https://facebook.com/goyatrio",
      "https://instagram.com/goyatrio",
      "https://twitter.com/goyatrio",
    ],
  };
}

/**
 * TouristTrip JSON-LD Schema for Tour Packages
 */
export function generateTouristTripSchema(pkg: {
  title: string;
  description: string;
  slug: string;
  priceFrom?: number | string;
  currency?: string;
  durationDays?: number;
  durationNights?: number;
  featuredImage?: string | null;
  destinationName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.description,
    url: `${BASE_APP_URL}/packages/${pkg.slug}`,
    image: pkg.featuredImage || `${BASE_APP_URL}/brand/goyatrio-logo.png`,
    touristType: "All Travelers",
    itinerary: {
      "@type": "ItemList",
      numberOfItems: pkg.durationDays || 1,
    },
    offers: {
      "@type": "Offer",
      price: pkg.priceFrom ? String(pkg.priceFrom) : "0",
      priceCurrency: pkg.currency || "INR",
      availability: "https://schema.org/InStock",
      url: `${BASE_APP_URL}/packages/${pkg.slug}`,
    },
    provider: {
      "@type": "TravelAgency",
      name: "GoYatrio",
      url: BASE_APP_URL,
    },
  };
}

/**
 * TouristDestination JSON-LD Schema for Destination Detail Pages
 */
export function generateTouristDestinationSchema(destination: {
  name: string;
  description: string;
  slug: string;
  featuredImage?: string | null;
  state?: string | null;
  country?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description: destination.description,
    url: `${BASE_APP_URL}/destinations/${destination.slug}`,
    image: destination.featuredImage || `${BASE_APP_URL}/brand/goyatrio-logo.png`,
    containedInPlace: {
      "@type": "Place",
      name: [destination.state, destination.country || "India"].filter(Boolean).join(", "),
    },
  };
}

/**
 * BreadcrumbList JSON-LD Schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_APP_URL}${item.url}`,
    })),
  };
}
