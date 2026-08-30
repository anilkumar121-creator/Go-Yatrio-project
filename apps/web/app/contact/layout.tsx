import type { Metadata } from "next";
import { resolvePageMetadata } from "@/components/seo/seo";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata({
    pageType: "contact",
    fallbackTitle: "Contact GoYatrio | Travel Inquiry & Customer Support",
    fallbackDescription:
      "Get in touch with GoYatrio travel experts. Contact us for custom holiday planning, tour package bookings, hotels, and cabs.",
    path: "/contact",
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
