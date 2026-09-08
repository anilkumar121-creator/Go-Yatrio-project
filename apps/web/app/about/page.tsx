import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  ShieldCheck,
  HeartHandshake,
  Award,
  Users,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { generateBreadcrumbSchema, JsonLd } from "@/components/seo/seo";

export const metadata: Metadata = {
  title: "About Us | GoYatrio - Premium Travel & Tour Experiences",
  description:
    "Discover the story behind GoYatrio. We craft handcrafted domestic and international tours, luxury escapes, hotel stays, and cab bookings with personalized service.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/about`,
  },
};

const values = [
  {
    icon: Compass,
    title: "Handcrafted Itineraries",
    description:
      "Every tour is carefully curated with authentic local insights, balanced pacing, and verified handpicked accommodations.",
  },
  {
    icon: ShieldCheck,
    title: "100% Transparency & Safety",
    description:
      "No hidden costs, no surprise charges. Verified drivers, sanitized cabs, and 24/7 on-ground assistance.",
  },
  {
    icon: HeartHandshake,
    title: "Personalized Care",
    description:
      "From your initial inquiry to your return journey, our dedicated destination experts support you at every milestone.",
  },
  {
    icon: Award,
    title: "Best Value Guarantee",
    description:
      "Direct partnerships with premier hoteliers and transport providers ensure exceptional quality at unmatched rates.",
  },
];

export default function AboutPage() {
  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]);

  return (
    <PageWrapper>
      <JsonLd data={breadcrumbs} />

      {/* Hero Header */}
      <section className="bg-primary/5 py-14 tablet:py-20 border-b border-border">
        <Container>
          <div className="max-w-3xl space-y-4">
            <Badge variant="accent">About GoYatrio</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground tablet:text-5xl">
              Pack your bags, we plan the rest.
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground tablet:text-lg">
              GoYatrio is a premier travel experience company dedicated to making journeys across
              India and beyond seamless, enriching, and unforgettable.
            </p>
          </div>
        </Container>
      </section>

      {/* Story & Mission Section */}
      <section className="py-14 tablet:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-12 desktop:grid-cols-2 items-center">
            <div className="space-y-6">
              <SectionTitle
                eyebrow="Our Story"
                title="Redefining Modern Travel Planning"
                description="Built for travelers who seek authentic experiences without the hassle of fragmented planning."
                align="left"
              />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Founded with a passion for genuine exploration, GoYatrio brings together
                all-inclusive holiday packages, handpicked boutique stays, verified chauffeur-driven
                cab networks, and day-by-day dynamic itineraries into one unified platform.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Whether you are traversing the backwaters of Kerala, exploring the royal palaces of
                Rajasthan, trekking through the Himalayas of Ladakh, or relaxing on the golden
                beaches of Goa, our mission is to deliver travel moments that stay with you for a
                lifetime.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 border border-border bg-card text-center space-y-2">
                <Users className="size-8 text-primary mx-auto" />
                <span className="text-2xl font-bold text-foreground block">10,000+</span>
                <span className="text-xs text-muted-foreground">Happy Travelers</span>
              </Card>
              <Card className="p-6 border border-border bg-card text-center space-y-2">
                <MapPin className="size-8 text-primary mx-auto" />
                <span className="text-2xl font-bold text-foreground block">50+</span>
                <span className="text-xs text-muted-foreground">Destinations Covered</span>
              </Card>
              <Card className="p-6 border border-border bg-card text-center space-y-2">
                <ShieldCheck className="size-8 text-primary mx-auto" />
                <span className="text-2xl font-bold text-foreground block">100%</span>
                <span className="text-xs text-muted-foreground">Verified Partners</span>
              </Card>
              <Card className="p-6 border border-border bg-card text-center space-y-2">
                <Award className="size-8 text-primary mx-auto" />
                <span className="text-2xl font-bold text-foreground block">4.9/5</span>
                <span className="text-xs text-muted-foreground">Average Rating</span>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Values Section */}
      <section className="bg-muted/30 py-14 tablet:py-20 border-y border-border">
        <Container>
          <SectionTitle
            eyebrow="Why Choose Us"
            title="The GoYatrio Difference"
            description="Our foundational commitments that set every GoYatrio journey apart."
            align="center"
          />

          <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <Card key={i} className="p-6 border border-border bg-card space-y-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{v.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{v.description}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-14 tablet:py-20">
        <Container>
          <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/90 p-8 tablet:p-12 text-white flex flex-col tablet:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl font-bold tablet:text-3xl">
                Ready to Begin Your Next Adventure?
              </h2>
              <p className="text-sm text-white/85">
                Explore our curated holiday packages or get in touch with our team for a custom
                itinerary tailored to your schedule and budget.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button asChild variant="accent" size="lg">
                <Link href="/packages">Explore Packages</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/contact" className="gap-1.5 inline-flex items-center">
                  Contact Us
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
