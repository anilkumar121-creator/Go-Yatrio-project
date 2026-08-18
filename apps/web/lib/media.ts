export type ResolvedMedia = {
  id: string;
  publicId: string;
  secureUrl: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type MediaResolvable =
  | {
      featuredMedia?: ResolvedMedia | null;
      galleryMedia?: ResolvedMedia[] | null;
      featuredImage?: string | null;
      galleryImages?: string[] | null;
      images?: { imageUrl?: string }[] | null;
      image?: string | null;
    }
  | Record<string, unknown>;

export function featuredUrl(item: MediaResolvable): string | null {
  const record = item as {
    featuredMedia?: ResolvedMedia | null;
    featuredImage?: string | null;
    image?: string | null;
    images?: { imageUrl?: string }[] | null;
  };

  return (
    record.featuredMedia?.secureUrl ??
    record.featuredImage ??
    record.image ??
    record.images?.[0]?.imageUrl ??
    null
  );
}

export function galleryUrls(item: MediaResolvable): string[] {
  const record = item as {
    galleryMedia?: ResolvedMedia[] | null;
    galleryImages?: string[] | null;
    images?: { imageUrl?: string }[] | null;
  };

  const mediaUrls = (record.galleryMedia ?? []).map((m) => m.secureUrl).filter(Boolean);
  const legacyUrls = [
    ...(record.galleryImages ?? []),
    ...(record.images?.map((img) => img.imageUrl) ?? []),
  ].filter(Boolean) as string[];

  if (mediaUrls.length > 0) return mediaUrls;
  return legacyUrls;
}
