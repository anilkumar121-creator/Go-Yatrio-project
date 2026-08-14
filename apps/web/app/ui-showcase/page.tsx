import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BedDouble, Camera, Car, Compass, Plus, SearchX } from "lucide-react";
import { uiFoundation } from "@goyatrio/ui";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { Alert } from "@/components/common/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/card";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import { Rating } from "@/components/common/rating";
import { Price } from "@/components/common/price";
import { Spinner } from "@/components/common/spinner";
import { Skeleton } from "@/components/common/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { PackageCard } from "@/components/cards/package-card";
import { DestinationCard } from "@/components/cards/destination-card";
import { HotelCard } from "@/components/cards/hotel-card";
import { CabCard } from "@/components/cards/cab-card";
import { BlogCard } from "@/components/cards/blog-card";
import { TestimonialCard } from "@/components/cards/testimonial-card";
import { FeatureSection } from "@/components/sections/feature-section";
import { StatsSection } from "@/components/sections/stats-section";
import { CtaSection } from "@/components/sections/cta-section";
import { PartnerSection } from "@/components/sections/partner-section";
import { EmptySearch } from "@/components/sections/empty-search";
import { ShowcaseSection, DemoBlock } from "@/components/showcase/showcase-section";
import {
  AccordionDemo,
  ChoiceControlsDemo,
  ConfirmationDialogDemo,
  DialogDemo,
  DropdownDemo,
  ErrorStateDemo,
  PaginationDemo,
  SearchBoxDemo,
  SelectDemo,
  TabsDemo,
  ToastDemo,
  TooltipDemo,
} from "@/components/showcase/showcase-demos";
import { createSeoMetadata } from "@/components/seo/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "UI Showcase",
  description:
    "Browse the reusable GoYatrio design system — buttons, forms, cards, feedback states, navigation patterns and content cards.",
  path: "/ui-showcase",
});

const colorEntries = Object.entries(uiFoundation.color);

const tokenGroups: { title: string; items: Record<string, string> }[] = [
  { title: "Radius", items: { ...uiFoundation.radius } },
  { title: "Shadow", items: { ...uiFoundation.shadow } },
  { title: "Spacing", items: { ...uiFoundation.spacing } },
  { title: "Container", items: { ...uiFoundation.container } },
  { title: "Duration", items: { ...uiFoundation.duration } },
];

const typeSamples: { label: string; className: string; text: string }[] = [
  {
    label: "Display — text-5xl",
    className: "text-5xl font-semibold leading-tight text-foreground",
    text: "The Himalayas await",
  },
  {
    label: "Heading 1 — text-4xl",
    className: "text-4xl font-semibold leading-tight text-foreground",
    text: "The Himalayas await",
  },
  {
    label: "Heading 2 — text-3xl",
    className: "text-3xl font-semibold leading-tight text-foreground",
    text: "The Himalayas await",
  },
  {
    label: "Heading 3 — text-2xl",
    className: "text-2xl font-semibold leading-tight text-foreground",
    text: "The Himalayas await",
  },
  {
    label: "Body — text-base",
    className: "text-base leading-7 text-foreground",
    text: "From the backwaters of Kerala to the high passes of Ladakh, every itinerary is crafted around the way you love to travel.",
  },
  {
    label: "Muted — text-sm",
    className: "text-sm leading-6 text-muted-foreground",
    text: "Secondary information such as descriptions, captions and helper text uses the muted foreground tone.",
  },
  {
    label: "Caption — text-xs",
    className: "text-xs uppercase tracking-widest text-muted-foreground",
    text: "Eyebrow · Caption · Meta",
  },
];

const buttonVariants: Array<
  "primary" | "secondary" | "accent" | "outline" | "ghost" | "destructive" | "success" | "link"
> = ["primary", "secondary", "accent", "outline", "ghost", "destructive", "success", "link"];

const badgeVariants: Array<
  | "default"
  | "secondary"
  | "accent"
  | "outline"
  | "muted"
  | "success"
  | "warning"
  | "error"
  | "info"
> = ["default", "secondary", "accent", "outline", "muted", "success", "warning", "error", "info"];

const alertSamples: {
  variant: "info" | "success" | "warning" | "error" | "muted";
  title: string;
  children: string;
}[] = [
  {
    variant: "info",
    title: "Travel advisory",
    children: "Carry a printed copy of your itinerary and ID for domestic flights.",
  },
  {
    variant: "success",
    title: "Booking confirmed",
    children: "Your package reference GY-2481 has been confirmed. Details are on the way.",
  },
  {
    variant: "warning",
    title: "Peak season pricing",
    children: "December departures are filling quickly and prices may rise soon.",
  },
  {
    variant: "error",
    title: "Payment failed",
    children: "We could not process your payment. Please check your card and try again.",
  },
  {
    variant: "muted",
    title: "Note",
    children: "Standard check-in is at 2 PM. Early check-in depends on availability.",
  },
];

const tocItems = [
  { id: "colors", label: "Colors & tokens" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges" },
  { id: "alerts", label: "Alerts" },
  { id: "cards", label: "Cards" },
  { id: "forms", label: "Forms" },
  { id: "data-display", label: "Data display" },
  { id: "feedback", label: "Feedback" },
  { id: "navigation", label: "Navigation & overlays" },
  { id: "content-cards", label: "Content cards" },
  { id: "sections", label: "Section patterns" },
];

export default function UiShowcasePage() {
  return (
    <PageWrapper>
      <header className="border-b border-border bg-card">
        <Container className="flex flex-col gap-6 py-10 tablet:py-14">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "UI Showcase" }]} />
          <SectionTitle
            eyebrow="Design System"
            title="GoYatrio UI Showcase"
            description="A living reference for the reusable components and design tokens that power GoYatrio. Every demo below is rendered with the shared component library — no bespoke styling."
          />
          <nav aria-label="Showcase sections" className="flex flex-wrap gap-2">
            {tocItems.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Container>
      </header>

      <Container className="flex flex-col gap-10 py-12 tablet:py-16">
        <ShowcaseSection
          id="colors"
          title="Colors & tokens"
          description="Brand, neutral and status palettes plus the radius, shadow, spacing and motion tokens used across the product."
          className="scroll-mt-24"
        >
          <DemoBlock label="Color tokens">
            <div className="grid gap-3 sm:grid-cols-2 desktop:grid-cols-3">
              {colorEntries.map(([token, value]) => (
                <div
                  key={token}
                  className="overflow-hidden rounded-md border border-border bg-card"
                >
                  <div className="h-16" style={{ backgroundColor: value }} aria-hidden="true" />
                  <div className="border-t border-border px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">--{token}</p>
                    <p className="text-xs text-muted-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </DemoBlock>
          <DemoBlock label="Radius, shadow, spacing & motion">
            <div className="grid gap-4 sm:grid-cols-2 desktop:grid-cols-3">
              {tokenGroups.map((group) => (
                <div key={group.title} className="rounded-md border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {group.title}
                  </p>
                  <dl className="mt-3 space-y-1.5">
                    {Object.entries(group.items).map(([key, value]) => (
                      <div key={key} className="flex items-baseline justify-between gap-4 text-sm">
                        <dt className="text-muted-foreground">{key}</dt>
                        <dd className="font-mono text-xs text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="typography"
          title="Typography"
          description="Inter is loaded through next/font and mapped to the global font token, with an 8px spacing grid for rhythm."
          className="scroll-mt-24"
        >
          <DemoBlock label="Type scale">
            <div className="space-y-6">
              {typeSamples.map((sample) => (
                <div key={sample.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {sample.label}
                  </p>
                  <p className={sample.className}>{sample.text}</p>
                </div>
              ))}
            </div>
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="buttons"
          title="Buttons"
          description="Primary, secondary, accent and status actions across sizes, including loading, disabled and as-child link states."
          className="scroll-mt-24"
        >
          <DemoBlock label="Variants">
            <div className="flex flex-wrap items-center gap-3">
              {buttonVariants.map((variant) => (
                <Button key={variant} variant={variant}>
                  {variant === "link" ? "Link button" : variant}
                </Button>
              ))}
            </div>
          </DemoBlock>
          <DemoBlock label="Sizes">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add" title="Add">
                <Plus className="size-4" aria-hidden="true" />
              </Button>
              <Button size="icon-sm" aria-label="Add small" title="Add small">
                <Plus className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </DemoBlock>
          <DemoBlock label="States">
            <div className="flex flex-wrap items-center gap-3">
              <Button loading>Submitting</Button>
              <Button disabled>Disabled</Button>
              <Button asChild>
                <Link href="#">As a link</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#">
                  View packages
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="badges"
          title="Badges"
          description="Compact labels for categories, statuses and highlights across every tone."
          className="scroll-mt-24"
        >
          <DemoBlock label="Variants">
            <div className="flex flex-wrap items-center gap-3">
              {badgeVariants.map((variant) => (
                <Badge key={variant} variant={variant}>
                  {variant}
                </Badge>
              ))}
            </div>
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="alerts"
          title="Alerts"
          description="Inline feedback with an icon, title and supporting message for informational and status contexts."
          className="scroll-mt-24"
        >
          <DemoBlock label="Variants">
            <div className="grid gap-4">
              {alertSamples.map((alert) => (
                <Alert key={alert.variant} variant={alert.variant} title={alert.title}>
                  {alert.children}
                </Alert>
              ))}
            </div>
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="cards"
          title="Cards"
          description="The base surface for headers, content and footer actions, composed from Card primitives."
          className="scroll-mt-24"
        >
          <DemoBlock label="Card composition">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Kerala Highlights</CardTitle>
                <CardDescription>4 days · Kochi to Munnar</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Cruise the backwaters, walk tea estates and unwind on the coast with private
                  transfers and handpicked stays included.
                </p>
              </CardContent>
              <CardFooter>
                <Button>View package</Button>
                <Button variant="outline">Save trip</Button>
              </CardFooter>
            </Card>
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="forms"
          title="Forms"
          description="Text inputs, textarea, select and choice controls composed with FormField for labels, descriptions and validation."
          className="scroll-mt-24"
        >
          <DemoBlock label="Text input & textarea">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="showcase-name" required>
                <Input id="showcase-name" placeholder="Ananya Sharma" />
              </FormField>
              <FormField
                label="Email address"
                htmlFor="showcase-email"
                error="Enter a valid email address."
              >
                <Input
                  id="showcase-email"
                  type="email"
                  placeholder="you@example.com"
                  defaultValue="invalid-email"
                  invalid
                />
              </FormField>
              <FormField
                label="Phone number"
                htmlFor="showcase-phone"
                description="We only use this to confirm your booking."
              >
                <Input id="showcase-phone" type="tel" placeholder="+91 00000 00000" disabled />
              </FormField>
              <FormField label="Travel notes" htmlFor="showcase-notes">
                <Textarea
                  id="showcase-notes"
                  placeholder="Tell us about your trip preferences..."
                />
              </FormField>
            </div>
          </DemoBlock>
          <DemoBlock label="Search, select & choice controls">
            <div className="grid gap-6">
              <SearchBoxDemo />
              <div className="grid gap-6 sm:grid-cols-3">
                <SelectDemo />
                <div className="sm:col-span-2">
                  <ChoiceControlsDemo />
                </div>
              </div>
            </div>
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="data-display"
          title="Data display"
          description="Ratings and pricing formatted for Indian travel contexts with INR and en-IN number formatting."
          className="scroll-mt-24"
        >
          <DemoBlock label="Rating">
            <div className="flex flex-wrap items-center gap-6">
              <Rating value={4.6} count={128} size="sm" />
              <Rating value={4.2} count={38} size="md" />
              <Rating value={3.8} size="lg" />
            </div>
          </DemoBlock>
          <DemoBlock label="Price">
            <div className="flex flex-wrap items-center gap-6">
              <Price amount={24999} per="per person" size="sm" />
              <Price amount={29999} originalAmount={34999} size="md" />
              <Price amount={1899} per="per night" size="lg" />
            </div>
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="feedback"
          title="Feedback"
          description="Loading, empty and error states keep users informed while content streams in."
          className="scroll-mt-24"
        >
          <DemoBlock label="Spinner">
            <div className="flex flex-wrap items-center gap-6">
              <Spinner label="Loading packages" />
              <Button loading>Submitting</Button>
            </div>
          </DemoBlock>
          <DemoBlock label="Skeleton">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3 rounded-md border border-border bg-card p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-3 rounded-md border border-border bg-card p-4">
                <Skeleton shimmer className="h-4 w-3/4" />
                <Skeleton shimmer className="h-4 w-1/2" />
                <Skeleton shimmer className="h-20 w-full" />
              </div>
            </div>
          </DemoBlock>
          <DemoBlock label="Empty state">
            <EmptyState
              icon={SearchX}
              title="No packages found"
              description="Try adjusting the destination or travel dates to see more options."
              action={<Button variant="outline">Clear filters</Button>}
            />
          </DemoBlock>
          <DemoBlock label="Error state">
            <ErrorStateDemo />
          </DemoBlock>
          <DemoBlock label="Pagination">
            <PaginationDemo />
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="navigation"
          title="Navigation & overlays"
          description="Breadcrumbs, tabs, accordions, menus, tooltips, dialogs and toasts for structured journeys and focused actions."
          className="scroll-mt-24"
        >
          <DemoBlock label="Breadcrumb">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Packages", href: "#" },
                { label: "Kerala Highlights" },
              ]}
            />
          </DemoBlock>
          <DemoBlock label="Tabs">
            <TabsDemo />
          </DemoBlock>
          <DemoBlock label="Accordion">
            <AccordionDemo />
          </DemoBlock>
          <DemoBlock label="Dropdown menu">
            <DropdownDemo />
          </DemoBlock>
          <DemoBlock label="Tooltip">
            <TooltipDemo />
          </DemoBlock>
          <DemoBlock label="Dialog">
            <DialogDemo />
          </DemoBlock>
          <DemoBlock label="Confirmation dialog">
            <ConfirmationDialogDemo />
          </DemoBlock>
          <DemoBlock label="Toast">
            <ToastDemo />
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="content-cards"
          title="Content cards"
          description="Domain-ready cards for packages, destinations, hotels, cabs, blogs and testimonials."
          className="scroll-mt-24"
        >
          <DemoBlock label="Card grid">
            <div className="grid gap-6 sm:grid-cols-2 desktop:grid-cols-3">
              <PackageCard
                title="Kerala Highlights"
                destination="Kochi, Munnar, Alleppey"
                duration="4 days"
                price={24999}
                originalPrice={29999}
                rating={4.8}
                reviews={1240}
                badge="Best seller"
                ctaHref="#"
              />
              <DestinationCard
                name="Ladakh"
                location="Jammu & Kashmir"
                description="High-altitude passes, monasteries and starlit camps on the roof of the world."
                badge="Adventure"
                ctaHref="#"
              />
              <HotelCard
                name="Lake Palace Retreat"
                location="Udaipur, Rajasthan"
                rating={4.9}
                reviews={312}
                facilities={["Lake view", "Spa", "Breakfast"]}
                pricePerNight={18500}
                ctaHref="#"
              />
              <CabCard
                vehicleName="Innova Crysta"
                vehicleType="SUV"
                seatingCapacity={6}
                price={6500}
                ctaHref="#"
              />
              <BlogCard
                title="Five underrated monsoon getaways in India"
                category="Travel tips"
                author="GoYatrio Team"
                date="Aug 2026"
                excerpt="Chasing the rains? These quiet corners of the Western Ghats deliver drama without the crowds."
                ctaHref="#"
              />
              <TestimonialCard
                name="Priya Menon"
                location="Bengaluru"
                rating={5}
                testimonial="Every detail was handled — transfers, stays, and even the local sim card. We simply showed up and enjoyed."
              />
            </div>
          </DemoBlock>
        </ShowcaseSection>

        <ShowcaseSection
          id="sections"
          title="Section patterns"
          description="Composable page sections for features, statistics, calls to action, partners and empty search results."
          className="scroll-mt-24"
        >
          <FeatureSection
            eyebrow="Why GoYatrio"
            title="Planned around you"
            description="Reusable section blocks that will power the public homepage and category pages."
            features={[
              {
                icon: Compass,
                title: "Curated routes",
                description: "Hand-built itineraries with local expertise baked in.",
              },
              {
                icon: BedDouble,
                title: "Handpicked stays",
                description: "Hotels and homestays vetted for comfort and location.",
              },
              {
                icon: Car,
                title: "Comfortable transfers",
                description: "Private cabs with experienced, dependable drivers.",
              },
              {
                icon: Camera,
                title: "Local experiences",
                description: "Culture, food and scenery worth the detour.",
              },
            ]}
          />
          <StatsSection
            stats={[
              { value: "50+", label: "Destinations" },
              { value: "12k", label: "Happy travellers" },
              { value: "4.8", label: "Average rating" },
              { value: "24h", label: "Response time" },
            ]}
          />
          <CtaSection
            title="Ready to plan your next trip?"
            description="Tell us your dates and preferences — our travel experts will craft an itinerary within 24 hours."
            primaryCta={{ label: "Plan a Trip", href: "/contact" }}
            secondaryCta={{ label: "Explore packages", href: "#" }}
          />
          <PartnerSection
            title="Trusted travel partners"
            partners={[
              { name: "Indian Railways" },
              { name: "OYO" },
              { name: "RedBus" },
              { name: "IRCTC" },
            ]}
          />
          <EmptySearch
            query="Shimla in March"
            action={<Button variant="outline">Clear search</Button>}
          />
        </ShowcaseSection>
      </Container>
    </PageWrapper>
  );
}
