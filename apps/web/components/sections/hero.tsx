import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container } from "@/components/common/container";
import { Button } from "@/components/common/button";

type HeroCta = {
  label: string;
  href: string;
};

type HeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  image?: { src: string; alt: string };
  overlay?: boolean;
  align?: "left" | "center";
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  searchArea?: React.ReactNode;
  className?: string;
};

export function Hero({
  title,
  subtitle,
  eyebrow,
  image,
  overlay = true,
  align = "center",
  primaryCta,
  secondaryCta,
  searchArea,
  className,
}: HeroProps) {
  const isCentered = align === "center";

  return (
    <section className={cn("relative overflow-hidden bg-primary", className)}>
      {image?.src ? (
        <>
          <Image
            src={image.src}
            alt={image.alt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {overlay ? <div className="absolute inset-0 bg-black/55" aria-hidden="true" /> : null}
        </>
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary via-blue-800 to-secondary"
          aria-hidden="true"
        />
      )}

      <Container
        className={cn(
          "relative flex min-h-[32rem] flex-col justify-center py-16 tablet:min-h-[38rem] desktop:min-h-[42rem]",
          isCentered && "items-center text-center",
        )}
      >
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white tablet:text-5xl desktop:text-6xl",
            isCentered && "mx-auto",
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              "mt-5 max-w-2xl text-base leading-7 text-white/85 tablet:text-lg",
              isCentered && "mx-auto",
            )}
          >
            {subtitle}
          </p>
        ) : null}
        {primaryCta || secondaryCta ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {primaryCta ? (
              <Button asChild size="lg">
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
            ) : null}
            {secondaryCta ? (
              <Button asChild variant="outline" size="lg" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
        {searchArea ? <div className="mt-10 w-full max-w-3xl">{searchArea}</div> : null}
      </Container>
    </section>
  );
}
