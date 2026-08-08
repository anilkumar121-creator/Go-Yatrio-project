import type { Metadata } from "next";

export type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
};

export function createSeoMetadata({ title, description, path = "/", image = "/brand/goyatrio-logo.png" }: SeoInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
