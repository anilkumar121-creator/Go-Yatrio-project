import Image from "next/image";
import { cn } from "@/lib/utils";
import { Container } from "@/components/common/container";

type Partner = {
  name: string;
  logo?: { src: string; alt: string };
};

type PartnerSectionProps = {
  partners: Partner[];
  title?: string;
  className?: string;
};

export function PartnerSection({
  partners,
  title = "Trusted travel partners",
  className,
}: PartnerSectionProps) {
  return (
    <section className={cn("py-14 tablet:py-16", className)} aria-labelledby="partner-section-title">
      <Container>
        {title ? (
          <h2
            id="partner-section-title"
            className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            {title}
          </h2>
        ) : null}
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {partners.map((partner) => (
            <li
              key={partner.name}
              className="flex h-16 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-semibold text-muted-foreground"
            >
              {partner.logo?.src ? (
                <Image
                  src={partner.logo.src}
                  alt={partner.logo.alt ?? partner.name}
                  width={96}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                partner.name
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
