import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <Container className="flex flex-col gap-4 py-8 tablet:flex-row tablet:items-center tablet:justify-between">
        <Logo variant="mark" />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} GoYatrio. Foundation only.
        </p>
      </Container>
    </footer>
  );
}
