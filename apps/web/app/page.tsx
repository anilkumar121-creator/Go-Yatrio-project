import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { Button } from "@/components/common/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { DestinationCard } from "@/components/cards/destination-card";
import { PackageCard } from "@/components/cards/package-card";
import { TestimonialCard } from "@/components/cards/testimonial-card";
import {
  Hero,
  QuickServices,
  WhyChooseUs,
  TravelCategories,
  StatsSection,
  PartnerSection,
  NewsletterSection,
  CtaSection,
} from "@/components/sections";
import { MotionDiv } from "@/components/animation/motion";

const mockDestinations = [
  {
    id: "kashmir",
    name: "Kashmir",
    location: "Jammu & Kashmir, India",
    description: "Paradise on Earth featuring snow-capped Himalayas, serene Dal Lake shikaras, and Gulmarg meadows.",
    badge: "Trending",
    ctaHref: "/destinations/kashmir",
  },
  {
    id: "goa",
    name: "Goa",
    location: "West Coast, India",
    description: "Sun-kissed golden beaches, vibrant nightlife, Portuguese heritage, and thrilling watersports.",
    badge: "Popular",
    ctaHref: "/destinations/goa",
  },
  {
    id: "kerala",
    name: "Kerala",
    location: "South India",
    description: "God's Own Country with tranquil Alleppey backwater houseboats and Munnar tea gardens.",
    badge: "Top Rated",
    ctaHref: "/destinations/kerala",
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    location: "North West India",
    description: "Land of Kings featuring royal palaces, majestic desert forts, cultural heritage, and camel safaris.",
    badge: "Heritage",
    ctaHref: "/destinations/rajasthan",
  },
  {
    id: "andaman",
    name: "Andaman",
    location: "Bay of Bengal",
    description: "Exotic tropical islands, turquoise waters, pristine white-sand beaches, and vibrant coral reefs.",
    badge: "Exotic",
    ctaHref: "/destinations/andaman",
  },
  {
    id: "odisha",
    name: "Odisha",
    location: "East Coast, India",
    description: "Ancient heritage temples, golden Puri sea beach, Chilika Lake, and rich tribal art culture.",
    badge: "Cultural",
    ctaHref: "/destinations/odisha",
  },
];

const mockPackages = [
  {
    id: "kashmir-escape",
    title: "Kashmir Paradise Escape",
    destination: "Srinagar & Gulmarg",
    duration: "5N / 6D",
    price: 18999,
    originalPrice: 22999,
    rating: 4.9,
    reviews: 124,
    badge: "Best Seller",
    ctaHref: "/packages/kashmir-paradise-escape",
  },
  {
    id: "kerala-backwaters",
    title: "Kerala Backwaters & Hills",
    destination: "Munnar & Alleppey",
    duration: "4N / 5D",
    price: 15499,
    originalPrice: 18999,
    rating: 4.8,
    reviews: 98,
    badge: "Recommended",
    ctaHref: "/packages/kerala-backwaters-and-hills",
  },
  {
    id: "rajasthan-heritage",
    title: "Royal Rajasthan Heritage",
    destination: "Jaipur, Udaipur & Jodhpur",
    duration: "6N / 7D",
    price: 22500,
    originalPrice: 26999,
    rating: 4.9,
    reviews: 142,
    badge: "Popular",
    ctaHref: "/packages/royal-rajasthan-heritage",
  },
  {
    id: "goa-beach-holiday",
    title: "Goa Beach & Sun Holiday",
    destination: "North & South Goa",
    duration: "3N / 4D",
    price: 11999,
    originalPrice: 14999,
    rating: 4.7,
    reviews: 86,
    badge: "Hot Deal",
    ctaHref: "/packages/goa-beach-and-sun-holiday",
  },
  {
    id: "odisha-tribal-trail",
    title: "Odisha Golden Triangle & Culture",
    destination: "Bhubaneswar, Puri & Konark",
    duration: "5N / 6D",
    price: 14999,
    originalPrice: 17999,
    rating: 4.8,
    reviews: 64,
    badge: "Special",
    ctaHref: "/packages/odisha-golden-triangle-and-culture",
  },
  {
    id: "andaman-paradise",
    title: "Andaman Island Paradise",
    destination: "Port Blair & Havelock",
    duration: "5N / 6D",
    price: 26999,
    originalPrice: 31999,
    rating: 4.9,
    reviews: 110,
    badge: "Luxury",
    ctaHref: "/packages/andaman-island-paradise",
  },
];

const mockTestimonials = [
  {
    id: "1",
    name: "Ananya Sharma",
    location: "New Delhi",
    testimonial:
      "Our Kashmir family trip organized by GoYatrio was completely flawless! From private cab transfers to luxury houseboat stay in Srinagar, everything was top notch.",
    rating: 5,
  },
  {
    id: "2",
    name: "Rahul & Neha Verma",
    location: "Mumbai",
    testimonial:
      "GoYatrio made our Kerala honeymoon truly unforgettable. The Alleppey houseboat stay and tea plantation resort in Munnar were magical experiences.",
    rating: 5,
  },
  {
    id: "3",
    name: "Rajesh Mohanty",
    location: "Bhubaneswar",
    testimonial:
      "Booked a Tempo Traveller and hotel package for our family pilgrimage to Puri and Konark. Extremely reliable drivers and transparent pricing throughout!",
    rating: 5,
  },
  {
    id: "4",
    name: "Priya Sundaram",
    location: "Bengaluru",
    testimonial:
      "Customized itinerary for Rajasthan heritage tour was very smooth and pocket-friendly. Dedicated support team was available 24/7 whenever we needed help.",
    rating: 5,
  },
  {
    id: "5",
    name: "Vikram Singh",
    location: "Chandigarh",
    testimonial:
      "Best experience booking outstation cab for Himachal circuit. Safe driving, clean car, and very polite chauffeur throughout our 6-day mountain trip.",
    rating: 5,
  },
  {
    id: "6",
    name: "Sneha Kulkarni",
    location: "Pune",
    testimonial:
      "The Andaman package exceeded our expectations! Clear breakdown of costs with zero hidden fees. Highly recommend GoYatrio to all travel enthusiasts.",
    rating: 5,
  },
];

const mockStats = [
  { value: "25,000+", label: "Happy Travelers" },
  { value: "150+", label: "Destinations Covered" },
  { value: "300+", label: "Packages Available" },
  { value: "24/7", label: "Support Availability" },
];

const mockPartners = [
  { name: "Secure Bookings" },
  { name: "Verified Partners" },
  { name: "Customer Satisfaction" },
  { name: "Travel Assistance" },
  { name: "Luxury Hotel Alliance" },
];

export default function HomePage() {
  return (
    <PageWrapper>
      {/* SECTION 1 — HERO */}
      <Hero
        title="Discover India With GoYatrio"
        subtitle="Handcrafted tours, hotel bookings, cab services, and unforgettable travel experiences."
        primaryCta={{ label: "Explore Packages", href: "/packages" }}
        secondaryCta={{ label: "Plan Your Trip", href: "/inquiry" }}
      />

      {/* SECTION 2 — QUICK SERVICES */}
      <QuickServices className="py-16 tablet:py-20 bg-muted/30" />

      {/* SECTION 3 — FEATURED DESTINATIONS */}
      <section className="py-16 tablet:py-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 tablet:flex-row tablet:items-end">
            <SectionTitle
              eyebrow="Popular Getaways"
              title="Featured Destinations"
              description="Explore India's most iconic destinations with customized tour packages and local guides."
              align="left"
            />
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/destinations" className="inline-flex items-center gap-1.5">
                View All Destinations
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
            {mockDestinations.map((dest, index) => (
              <MotionDiv
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <DestinationCard
                  name={dest.name}
                  location={dest.location}
                  description={dest.description}
                  badge={dest.badge}
                  ctaHref={dest.ctaHref}
                />
              </MotionDiv>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 4 — FEATURED TOUR PACKAGES */}
      <section className="py-16 tablet:py-20 bg-muted/30">
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 tablet:flex-row tablet:items-end">
            <SectionTitle
              eyebrow="Trending Deals"
              title="Featured Tour Packages"
              description="All-inclusive tour packages meticulously planned for couples, families, and solo explorers."
              align="left"
            />
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/packages" className="inline-flex items-center gap-1.5">
                View All Packages
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
            {mockPackages.map((pkg, index) => (
              <MotionDiv
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <PackageCard
                  title={pkg.title}
                  destination={pkg.destination}
                  duration={pkg.duration}
                  price={pkg.price}
                  originalPrice={pkg.originalPrice}
                  rating={pkg.rating}
                  reviews={pkg.reviews}
                  badge={pkg.badge}
                  ctaHref={pkg.ctaHref}
                />
              </MotionDiv>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 5 — WHY CHOOSE GOYATRIO */}
      <WhyChooseUs className="py-16 tablet:py-20" />

      {/* SECTION 6 — TRAVEL CATEGORIES */}
      <TravelCategories className="py-16 tablet:py-20 bg-muted/30" />

      {/* SECTION 7 — TESTIMONIALS */}
      <section className="py-16 tablet:py-20">
        <Container>
          <SectionTitle
            eyebrow="Customer Reviews"
            title="What Our Travelers Say"
            description="Read verified testimonials from real travelers who chose GoYatrio for their holiday adventures."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
            {mockTestimonials.map((item, index) => (
              <MotionDiv
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <TestimonialCard
                  name={item.name}
                  location={item.location}
                  testimonial={item.testimonial}
                  rating={item.rating}
                />
              </MotionDiv>
            ))}
          </div>
        </Container>
      </section>

      {/* SECTION 8 — TRAVEL STATISTICS */}
      <StatsSection stats={mockStats} tone="primary" />

      {/* SECTION 9 — TRUST & PARTNERS */}
      <PartnerSection partners={mockPartners} title="Trust & Partner Guarantees" />

      {/* SECTION 10 — NEWSLETTER CTA */}
      <NewsletterSection className="py-16 tablet:py-20 bg-muted/30" />

      {/* SECTION 11 — FINAL CTA */}
      <CtaSection
        title="Ready For Your Next Journey?"
        description="Let GoYatrio design your dream holiday with customized itineraries, best hotel rates, and dedicated travel support."
        primaryCta={{ label: "Explore Packages", href: "/packages" }}
        secondaryCta={{ label: "Contact Us", href: "/contact" }}
      />
    </PageWrapper>
  );
}