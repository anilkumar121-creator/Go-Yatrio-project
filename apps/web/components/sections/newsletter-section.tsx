import { Container } from "@/components/common/container";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { MotionDiv } from "@/components/animation/motion";

type NewsletterSectionProps = {
  className?: string;
};

export function NewsletterSection({ className }: NewsletterSectionProps) {
  return (
    <section className={className}>
      <Container>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-8 shadow-sm tablet:p-12 desktop:p-16"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground tablet:text-3xl">
              Subscribe To Our Travel Newsletter
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Get exclusive tour package deals, seasonal discounts, and insider travel tips delivered straight to your inbox.
            </p>
            <div className="mt-8">
              <NewsletterForm />
            </div>
          </div>
        </MotionDiv>
      </Container>
    </section>
  );
}