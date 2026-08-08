import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <Container className="flex min-h-16 items-center justify-between gap-4">
        <Logo priority />
        <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm font-medium tablet:flex" />
      </Container>
    </header>
  );
}
