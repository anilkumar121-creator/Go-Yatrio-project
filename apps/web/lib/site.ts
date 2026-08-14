/**
 * Central site configuration for the GoYatrio design system.
 *
 * Contact details and social links below are PLACEHOLDERS. Replace them
 * with the real business information when it becomes available.
 */
export const siteConfig = {
  name: "GoYatrio",
  tagline: "Pack your bags, we plan the rest.",
  description:
    "Premium travel planning for domestic tours, international journeys, luxury escapes, adventure trips and pilgrimage packages across India and beyond.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  contact: {
    // PLACEHOLDERS - replace with real business details.
    email: "inquiries@goyatrio.in",
    phone: "+91 00000 00000",
    address: "India",
  },
  social: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "X (Twitter)", href: "#" },
    { label: "YouTube", href: "#" },
  ],
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Destinations", href: "/destinations" },
    { label: "Packages", href: "/packages" },
    { label: "Hotels", href: "/hotels" },
    { label: "Cab Booking", href: "/cab-booking" },
    { label: "Blogs", href: "/blogs" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footerLinks: {
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Blogs", href: "/blogs" },
      { label: "Contact", href: "/contact" },
    ],
    destinations: [
      { label: "Destinations", href: "/destinations" },
      { label: "Packages", href: "/packages" },
      { label: "Blogs", href: "/blogs" },
    ],
    services: [
      { label: "Hotel Booking", href: "/hotels" },
      { label: "Cab Booking", href: "/cab-booking" },
      { label: "Travel Inquiries", href: "/contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Refund Policy", href: "#" },
    ],
  },
} as const;
