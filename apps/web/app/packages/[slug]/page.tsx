import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Calendar, CheckCircle2, XCircle, ImageIcon } from "lucide-react";
import { Container } from "@/components/common/container";
import { Badge } from "@/components/common/badge";
import { Card } from "@/components/common/card";
import { Price } from "@/components/common/price";
import { CardMedia } from "@/components/cards/card-media";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PackageInquiryForm } from "./package-inquiry-form";

type PackageDetail = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  destinationId: string;
  durationDays: number;
  durationNights: number;
  priceFrom: number | string;
  currency: string;
  packageType: string;
  inclusions: string[];
  exclusions: string[];
  featuredImage: string | null;
  galleryImages: string[];
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  destination: {
    id: string;
    name: string;
    slug: string;
    country: string;
    state: string | null;
  };
  itineraries: {
    id: string;
    dayNumber: number;
    title: string;
    description: string;
    accommodation: string | null;
    meals: string | null;
    activities: string | null;
  }[];
};

async function getPackage(slug: string): Promise<PackageDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/packages/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = await response.json();
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!pkg) {
    return { title: "Package Not Found | GoYatrio" };
  }

  const title = pkg.metaTitle ?? `${pkg.title} (${pkg.durationDays}D/${pkg.durationNights}N) | GoYatrio`;
  const description =
    pkg.metaDescription ??
    `${pkg.shortDescription} Book ${pkg.title} with GoYatrio. Best price starting from ${pkg.priceFrom} ${pkg.currency}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/packages/${pkg.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      url: `${baseUrl}/packages/${pkg.slug}`,
      images: pkg.featuredImage
        ? [{ url: pkg.featuredImage, alt: pkg.title }]
        : undefined,
    },
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const pkg = await getPackage(slug);

  if (!pkg) {
    notFound();
  }

  const gallery = pkg.galleryImages.length > 0
    ? pkg.galleryImages
    : pkg.featuredImage
      ? [pkg.featuredImage]
      : [];

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-primary">
        {pkg.featuredImage ? (
          <>
            <Image
              src={pkg.featuredImage}
              alt={pkg.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-800 to-secondary" aria-hidden="true" />
        )}

        <Container className="relative flex min-h-[26rem] flex-col justify-end py-14 tablet:min-h-[30rem]">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="accent">{pkg.packageType}</Badge>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90">
              <MapPin className="size-4 text-accent" />
              {pkg.destination.name}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90">
              <Calendar className="size-4 text-accent" />
              {pkg.durationDays} Days / {pkg.durationNights} Nights
            </span>
          </div>

          <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-white tablet:text-5xl">
            {pkg.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/85 tablet:text-lg">
            {pkg.shortDescription}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <Price amount={Number(pkg.priceFrom)} per="per person" size="lg" className="text-white" />
          </div>
        </Container>
      </section>

      {/* Main Content + Inquiry Form Sidebar */}
      <section className="py-14 tablet:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-10 tablet:grid-cols-3">
            {/* Package Content */}
            <div className="space-y-10 tablet:col-span-2">
              {/* Overview */}
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Package Overview</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">
                  {pkg.description.split("\n").filter(Boolean).map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              {(pkg.inclusions.length > 0 || pkg.exclusions.length > 0) ? (
                <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
                  {pkg.inclusions.length > 0 ? (
                    <Card className="p-6 border-l-4 border-l-success">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-success shrink-0" />
                        Inclusions
                      </h3>
                      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                        {pkg.inclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-success mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ) : null}

                  {pkg.exclusions.length > 0 ? (
                    <Card className="p-6 border-l-4 border-l-error">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <XCircle className="size-5 text-error shrink-0" />
                        Exclusions
                      </h3>
                      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                        {pkg.exclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-error mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ) : null}
                </div>
              ) : null}

              {/* Day by Day Itinerary Accordion */}
              {pkg.itineraries.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-6">Day-by-Day Itinerary</h2>
                  <div className="space-y-4">
                    {pkg.itineraries.map((day) => (
                      <Card key={day.id} className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            Day {day.dayNumber}
                          </span>
                          <h3 className="text-lg font-semibold text-foreground">{day.title}</h3>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground mt-2">{day.description}</p>

                        {(day.accommodation || day.meals) ? (
                          <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
                            {day.accommodation ? (
                              <span><strong>Stay:</strong> {day.accommodation}</span>
                            ) : null}
                            {day.meals ? (
                              <span><strong>Meals:</strong> {day.meals}</span>
                            ) : null}
                          </div>
                        ) : null}
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Photo Gallery */}
              {gallery.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-5">Tour Gallery</h2>
                  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
                    {gallery.map((src, idx) => (
                      <CardMedia
                        key={`${src}-${idx}`}
                        src={src}
                        alt={`${pkg.title} photo ${idx + 1}`}
                        icon={ImageIcon}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Sticky Inquiry Form Sidebar */}
            <aside>
              <div className="sticky top-24">
                <Card className="p-6 border border-border bg-card shadow-md">
                  <h3 className="text-xl font-semibold text-foreground mb-1">Book / Inquire Tour</h3>
                  <p className="text-xs text-muted-foreground mb-5">
                    Fill in your details below. Our travel expert will contact you within 30 minutes with a customized quote.
                  </p>

                  {/* Package Inquiry CTA Form Component */}
                  <PackageInquiryForm
                    packageId={pkg.id}
                    packageTitle={pkg.title}
                    destinationName={pkg.destination.name}
                  />
                </Card>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}