import Link from "next/link";
import Image from "next/image";
import { Quote, CheckCircle2, Info, AlertTriangle, ChevronDown } from "lucide-react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";

export type BlogContentBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: 2 | 3 | 4; content: string }
  | { type: "image"; attrs: { publicId?: string; url?: string; alt: string; caption?: string; align?: "left" | "center" | "right" } }
  | { type: "gallery"; images: { publicId?: string; url?: string; alt: string; caption?: string }[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; content: string; cite?: string }
  | { type: "code"; language?: string; code: string }
  | { type: "embed"; provider: "youtube" | "vimeo" | "generic"; url: string }
  | { type: "divider" }
  | { type: "cta"; title: string; description?: string; links: { label: string; href: string; variant?: "primary" | "outline" }[] }
  | { type: "callout"; variant: "info" | "warning" | "success"; title?: string; content: string }
  | { type: "accordion"; items: { title: string; content: string }[] }
  | { type: "linkCard"; title: string; url: string; description?: string }
  | { type: string; [key: string]: unknown };

function resolveCloudinaryImage(publicId: string, width = 1200): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "goyatrio";
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},q_auto,f_auto/${publicId}`;
}

function resolveImageAttrs(attrs: { publicId?: string; url?: string; alt: string; caption?: string; align?: "left" | "center" | "right" }): string | null {
  if (attrs.url && attrs.url.length > 0) return attrs.url;
  if (attrs.publicId && attrs.publicId.length > 0) return resolveCloudinaryImage(attrs.publicId);
  return null;
}

const alignClass: Record<string, string> = {
  left: "text-left mx-0",
  center: "text-center mx-auto",
  right: "text-right ml-auto",
};

export function BlogContentRenderer({ blocks, fallbackContent }: { blocks?: BlogContentBlock[] | null; fallbackContent?: string }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="space-y-4 text-base leading-7 text-muted-foreground whitespace-pre-line">
        {fallbackContent ?? ""}
      </div>
    );
  }

  return (
    <div className="blog-content space-y-6">
      {blocks.map((block, index) => (
        <BlockRenderer key={index} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: BlogContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="text-base leading-7 text-muted-foreground">{(block as { content: string }).content}</p>;

    case "heading": {
      const b = block as { level: number; content: string };
      const Tag = b.level === 2 ? "h2" : b.level === 3 ? "h3" : "h4";
      return <Tag className="font-semibold text-foreground scroll-mt-28">{b.content}</Tag>;
    }

    case "image": {
      const b = block as { attrs: { publicId?: string; url?: string; alt: string; caption?: string; align?: "left" | "center" | "right" } };
      const src = resolveImageAttrs(b.attrs);
      if (!src) return null;
      return (
        <figure className={`space-y-2 ${alignClass[b.attrs.align ?? "center"] ?? ""}`}>
          <Image src={src} alt={b.attrs.alt} width={1200} height={675} className="w-full rounded-lg object-cover" />
          {b.attrs.caption ? <figcaption className="text-center text-xs text-muted-foreground">{b.attrs.caption}</figcaption> : null}
        </figure>
      );
    }

    case "gallery":
      return (
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3">
          {(block as { images: { publicId?: string; url?: string; alt: string }[] }).images.map((img, idx) => {
            const src = resolveImageAttrs({ ...img, caption: undefined });
            return src ? (
              <Image key={idx} src={src} alt={img.alt} width={800} height={600} className="aspect-[4/3] w-full rounded-lg object-cover" />
            ) : null;
          })}
        </div>
      );

    case "list": {
      const b = block as { ordered: boolean; items: string[] };
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag className={`space-y-2 text-base leading-7 text-muted-foreground ${b.ordered ? "list-decimal list-inside" : "list-disc list-inside"}`}>
          {b.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </Tag>
      );
    }

    case "quote": {
      const b = block as { content: string; cite?: string };
      return (
        <blockquote className="rounded-md border-l-4 border-primary bg-muted/30 p-5">
          <p className="flex items-start gap-2 text-lg font-medium text-foreground">
            <Quote className="size-5 text-primary shrink-0 mt-1" />
            {b.content}
          </p>
          {b.cite ? <cite className="mt-2 block text-xs text-muted-foreground">â€” {b.cite}</cite> : null}
        </blockquote>
      );
    }

    case "code": {
      const b = block as { language?: string; code: string };
      return (
        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs text-foreground">
          <code className={b.language ? `language-${b.language}` : undefined}>{b.code}</code>
        </pre>
      );
    }

    case "embed": {
      const b = block as { url: string };
      return (
        <div className="aspect-video overflow-hidden rounded-lg border border-border">
          <iframe src={b.url} className="h-full w-full" allowFullScreen title="Embedded content" />
        </div>
      );
    }

    case "divider":
      return <hr className="border-border" />;

    case "cta": {
      const b = block as { title: string; description?: string; links: { label: string; href: string; variant?: "primary" | "outline" }[] };
      return (
        <Card className="border border-primary/20 bg-primary/5 p-6">
          <h4 className="text-lg font-semibold text-foreground">{b.title}</h4>
          {b.description ? <p className="mt-1 text-sm text-muted-foreground">{b.description}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {b.links.map((link, idx) => (
              <Button key={idx} asChild size="sm" variant={link.variant === "outline" ? "outline" : "primary"} className="gap-1">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </Card>
      );
    }

    case "callout": {
      const b = block as { variant: "info" | "warning" | "success"; title?: string; content: string };
      return (
        <div className={`flex items-start gap-2 rounded-md border p-4 text-sm ${
          b.variant === "warning"
            ? "border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-200"
            : b.variant === "success"
              ? "border-success/20 bg-success/10 text-foreground"
              : "border-sky-500/20 bg-sky-500/10 text-foreground"
        }`}>
          {b.variant === "warning" ? <AlertTriangle className="size-4 shrink-0 mt-0.5" /> : b.variant === "success" ? <CheckCircle2 className="size-4 shrink-0 mt-0.5" /> : <Info className="size-4 shrink-0 mt-0.5" />}
          <div>
            {b.title ? <strong>{b.title}</strong> : null}
            <p className="mt-0.5">{b.content}</p>
          </div>
        </div>
      );
    }

    case "accordion": {
      const b = block as { items: { title: string; content: string }[] };
      return (
        <details className="group rounded-md border border-border bg-muted/20 p-4">
          <summary className="flex cursor-pointer items-center justify-between font-semibold text-foreground">
            {b.items[0]?.title ?? "Details"}
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-3 text-sm text-muted-foreground">
            {b.items.map((item, idx) => (
              <div key={idx}>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1">{item.content}</p>
              </div>
            ))}
          </div>
        </details>
      );
    }

    case "linkCard": {
      const b = block as { title: string; url: string; description?: string };
      return (
        <Card className="p-5 border-border">
          <Link href={b.url} className="font-semibold text-foreground hover:text-primary">
            {b.title}
          </Link>
          {b.description ? <p className="mt-1 text-sm text-muted-foreground">{b.description}</p> : null}
        </Card>
      );
    }

    default:
      return null;
  }
}
