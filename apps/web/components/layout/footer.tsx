import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const socialIcons = {
  Facebook,
  Instagram,
  "X (Twitter)": Twitter,
  YouTube: Youtube,
} as const;

type LinkColumn = {
  title: string;
  links: readonly { label: string; href: string }[];
};

const linkColumns: LinkColumn[] = [
  { title: "Quick Links", links: siteConfig.footerLinks.quickLinks },
  { title: "Destinations", links: siteConfig.footerLinks.destinations },
  { title: "Services", links: siteConfig.footerLinks.services },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <Container className="grid gap-10 py-12 tablet:grid-cols-2 desktop:grid-cols-12 desktop:py-16">
        <div className="desktop:col-span-4">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            {siteConfig.description}
          </p>

          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${siteConfig.contact.email}`} className="transition-colors hover:text-foreground">
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-foreground">
                {siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{siteConfig.contact.address}</span>
            </li>
          </ul>

          <div className="mt-6">
            <p className="text-sm font-semibold text-foreground">Follow us</p>
            <ul className="mt-3 flex items-center gap-2">
              {siteConfig.social.map((social) => {
                const Icon = socialIcons[social.label as keyof typeof socialIcons];
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {linkColumns.map((column) => (
          <nav
            key={column.title}
            aria-label={`Footer ${column.title}`}
            className="desktop:col-span-2"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              {column.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="desktop:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Newsletter
          </h3>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Travel ideas and offers in your inbox.
          </p>
          <NewsletterForm />
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground tablet:flex-row">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-4">
            {siteConfig.footerLinks.legal.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
