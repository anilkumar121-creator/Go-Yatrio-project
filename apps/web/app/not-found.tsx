import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { SectionTitle } from "@/components/common/section-title";

export default function NotFoundPage() {
  return (
    <Section>
      <Container>
        <SectionTitle eyebrow="404" title="Page not found" description="The requested page is unavailable." />
      </Container>
    </Section>
  );
}
