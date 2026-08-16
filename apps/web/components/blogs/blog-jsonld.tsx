type BlogJsonLdProps = {
  headline: string;
  description: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string;
  publisherName?: string;
  slug: string;
  categories?: { name: string }[];
  faq?: { question: string; answer: string }[] | null;
};

export function BlogJsonLd({ headline, description, image, datePublished, dateModified, authorName, publisherName = "GoYatrio", slug, categories = [], faq }: BlogJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: image ?? undefined,
    datePublished: datePublished ?? undefined,
    dateModified: dateModified ?? undefined,
    author: authorName ? { "@type": "Person", name: authorName } : { "@type": "Organization", name: publisherName },
    publisher: { "@type": "Organization", name: publisherName },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/blogs/${slug}` },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl}/blogs` },
      ...categories.slice(0, 1).map((c, idx) => ({ "@type": "ListItem", position: idx + 3, name: c.name })),
    ],
  };

  const schemas: Record<string, unknown>[] = [articleSchema, breadcrumbSchema];

  if (faq && faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, idx) => (
        <script key={idx} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
    </>
  );
}
