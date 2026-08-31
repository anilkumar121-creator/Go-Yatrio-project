"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/common/button";
import { EASE_OUT } from "@/components/animation/motion";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur transition-shadow duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-md"
      >
        Skip to content
      </a>

      <Container className="flex min-h-16 items-center justify-between gap-4">
        <Logo priority />

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 tablet:flex">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.98]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 tablet:flex">
          <Button asChild>
            <Link href="/contact">Plan a Trip</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="tablet:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </Button>
      </Container>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: reduced ? 0 : 0.25,
              ease: EASE_OUT,
            }}
            className="overflow-hidden border-t border-border bg-background tablet:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {siteConfig.navLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: reduced ? 0 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.2,
                    delay: reduced ? 0 : idx * 0.04,
                    ease: EASE_OUT,
                  }}
                >
                  <Link
                    href={link.href}
                    className="block rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduced ? 0 : 0.2,
                  delay: reduced ? 0 : siteConfig.navLinks.length * 0.04,
                  ease: EASE_OUT,
                }}
              >
                <Button asChild className="mt-2 w-full">
                  <Link href="/contact" onClick={() => setMenuOpen(false)}>
                    Plan a Trip
                  </Link>
                </Button>
              </motion.div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
