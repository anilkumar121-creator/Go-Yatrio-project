import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { SectionTitle } from "@/components/common/section-title";

export default function MaintenancePage() {
  return (
    <Section>
      <Container>
        <SectionTitle
          eyebrow="Maintenance"
          title="GoYatrio is being prepared"
          description="This placeholder page is reserved for planned maintenance windows."
        />
      </Container>
    </Section>
  );
}
