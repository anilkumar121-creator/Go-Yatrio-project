import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Hotel, Utensils, Car, Clock, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/common/container";
import { Badge } from "@/components/common/badge";
import { Card } from "@/components/common/card";
import { Price } from "@/components/common/price";
import { Button } from "@/components/common/button";
import { PageWrapper } from "@/components/layout/page-wrapper";

type Activity = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  timing: string | null;
};

type ItineraryDay = {
  id: string;
  dayNumber: number;
  sortOrder: number;
  title: string;
  description: string;
  city: string | null;
  hotel: string | null;
  meals: string | null;
  transfers: string | null;
  notes: string | null;
  activities: Activity[];
};

type ItineraryDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isDefault: boolean;
  package?: {
    id: string;
    title: string;
    slug: string;
    durationDays: number;
    durationNights: number;
    priceFrom: number | string;
    currency: string;
    destination?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  days: ItineraryDay[];
};

async function getItinerary(slug: string): Promise<ItineraryDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/itineraries/${slug}`, {
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
  const itinerary = await getItinerary(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!itinerary) {
    return { title: "Itinerary Not Found | GoYatrio" };
  }

  const title = `${itinerary.title} | Day-by-Day Schedule | GoYatrio`;
  const description =
    itinerary.description ??
    `Detailed ${itinerary.days.length}-Day itinerary schedule for ${itinerary.package?.title ?? "tour package"}. Includes activities, hotels, and meal plans.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/itineraries/${itinerary.slug}`,
    },
  };
}

export default async function PublicItineraryDetailPage({ params }: Props) {
  const { slug } = await params;
  const itinerary = await getItinerary(slug);

  if (!itinerary) {
    notFound();
  }

  return (
    <PageWrapper>
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-primary via-primary/95 to-secondary py-12 text-white">
        <Container>
          <div className="mb-4">
            <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white gap-1">
              <Link href="/itineraries">
                <ArrowLeft className="size-4" />
                Back to Itineraries
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant="accent">{itinerary.days.length} Days Itinerary</Badge>
            {itinerary.package?.destination?.name ? (
              <span className="inline-flex items-center gap-1 text-sm text-white/90 font-medium">
                <MapPin className="size-4 text-accent" />
                {itinerary.package.destination.name}
              </span>
            ) : null}
          </div>

          <h1 className="text-3xl font-semibold leading-tight tablet:text-4xl">{itinerary.title}</h1>
          {itinerary.description ? (
            <p className="mt-2 max-w-3xl text-base text-white/85 leading-relaxed">{itinerary.description}</p>
          ) : null}

          {itinerary.package ? (
            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-lg bg-white/10 backdrop-blur-sm p-4 border border-white/15">
              <div>
                <span className="text-xs text-white/70 block">Linked Tour Package</span>
                <Link
                  href={`/packages/${itinerary.package.slug}`}
                  className="font-semibold text-white hover:underline text-base"
                >
                  {itinerary.package.title}
                </Link>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <div>
                  <span className="text-xs text-white/70 block">Starting From</span>
                  <Price amount={Number(itinerary.package.priceFrom)} className="text-white" size="sm" />
                </div>
                <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href={`/packages/${itinerary.package.slug}`}>View Package & Book</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      {/* Main Day-by-Day Timeline Section */}
      <section className="py-12">
        <Container>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Calendar className="size-6 text-primary" />
                Detailed Day-by-Day Schedule
              </h2>
            </div>

            <div className="space-y-6">
              {itinerary.days.map((day) => (
                <Card key={day.id} className="p-6 border border-border bg-card shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-primary px-3 py-1 text-xs font-bold text-white font-mono shrink-0">
                        Day {day.dayNumber}
                      </span>
                      <h3 className="text-xl font-semibold text-foreground">{day.title}</h3>
                    </div>
                    {day.city ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                        <MapPin className="size-3.5 text-primary" />
                        {day.city}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground mt-2">{day.description}</p>

                  {/* Day Metadata Highlights */}
                  <div className="mt-5 grid grid-cols-1 gap-3 tablet:grid-cols-3 pt-4 border-t border-border text-xs">
                    {day.hotel ? (
                      <div className="flex items-center gap-2 text-foreground font-medium bg-muted/20 p-2.5 rounded-md">
                        <Hotel className="size-4 text-primary shrink-0" />
                        <span><strong>Stay:</strong> {day.hotel}</span>
                      </div>
                    ) : null}

                    {day.meals ? (
                      <div className="flex items-center gap-2 text-foreground font-medium bg-muted/20 p-2.5 rounded-md">
                        <Utensils className="size-4 text-primary shrink-0" />
                        <span><strong>Meals:</strong> {day.meals}</span>
                      </div>
                    ) : null}

                    {day.transfers ? (
                      <div className="flex items-center gap-2 text-foreground font-medium bg-muted/20 p-2.5 rounded-md">
                        <Car className="size-4 text-primary shrink-0" />
                        <span><strong>Transfers:</strong> {day.transfers}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Day Activities */}
                  {day.activities && day.activities.length > 0 ? (
                    <div className="mt-5 pt-4 border-t border-border">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Clock className="size-3.5 text-primary" />
                        Scheduled Activities & Sightseeing
                      </h4>
                      <ul className="space-y-2">
                        {day.activities.map((act) => (
                          <li
                            key={act.id}
                            className="flex flex-col tablet:flex-row tablet:items-center justify-between rounded-md border border-border/80 bg-background p-3 text-xs gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="size-4 text-success shrink-0" />
                              <span className="font-medium text-foreground">{act.title}</span>
                            </div>
                            {act.timing ? (
                              <Badge variant="outline" className="w-fit text-[11px] font-mono">
                                {act.timing}
                              </Badge>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Special Notes */}
                  {day.notes ? (
                    <div className="mt-4 rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <FileText className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Note:</strong> {day.notes}
                      </div>
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
