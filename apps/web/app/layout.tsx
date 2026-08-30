import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/layout/page-transition";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { ToastProvider } from "@/components/common/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "GoYatrio",
    template: "%s | GoYatrio",
  },
  description: "GoYatrio travel inquiry and booking foundation for India.",
  applicationName: "GoYatrio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "GoYatrio",
    title: "GoYatrio",
    description: "Pack your bags, we plan the rest.",
    images: [
      {
        url: "/brand/goyatrio-logo.png",
        width: 1536,
        height: 864,
        alt: "GoYatrio logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoYatrio",
    description: "Pack your bags, we plan the rest.",
    images: ["/brand/goyatrio-logo.png"],
  },
  icons: {
    icon: "/favicons/favicon.png",
    apple: "/brand/goyatrio-mark.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0057d9",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body>
        <ToastProvider>
          <Navbar />
          <PageTransition>
            <main id="main-content">{children}</main>
          </PageTransition>
          <Footer />
          <ScrollToTop />
        </ToastProvider>
      </body>
    </html>
  );
}
