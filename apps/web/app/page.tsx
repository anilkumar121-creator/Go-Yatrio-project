import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { SectionTitle } from "@/components/common/section-title";
import { PageWrapper } from "@/components/layout/page-wrapper";

export default function HomePage() {
  return (
    <PageWrapper>
      <Section>
        <Container>
          <SectionTitle
            eyebrow="Foundation"
            title="GoYatrio project foundation"
            description="This screen intentionally contains no travel packages, booking flows, authentication, or business data."
          />
        </Container>
      </Section>
    </PageWrapper>
  );
}
