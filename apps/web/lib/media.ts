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

/**
 * Validates whether a given string is a valid web image URL or relative path.
 * Rejects local filesystem paths (e.g. D:\..., C:\..., \\...), empty strings, or malformed values.
 */
export function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Reject Windows / DOS drive paths (e.g., "D:\...", "C:/...") or UNC paths ("\\...")
  if (/^[a-zA-Z]:[\\/]/.test(trimmed) || trimmed.startsWith("\\\\")) {
    return false;
  }

  // Accept valid web URLs (http://, https://) or relative web paths starting with /
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return true;
  }

  return false;
}

export function featuredUrl(item: MediaResolvable): string | null {
  const record = item as {
    featuredMedia?: ResolvedMedia | null;
    featuredImage?: string | null;
    image?: string | null;
    images?: { imageUrl?: string }[] | null;
  };

  const candidate =
    record.featuredMedia?.secureUrl ??
    record.featuredImage ??
    record.image ??
    record.images?.[0]?.imageUrl ??
    null;

  return isValidImageUrl(candidate) ? candidate : null;
}

export function galleryUrls(item: MediaResolvable): string[] {
  const record = item as {
    galleryMedia?: ResolvedMedia[] | null;
    galleryImages?: string[] | null;
    images?: { imageUrl?: string }[] | null;
  };

  const mediaUrls = (record.galleryMedia ?? []).map((m) => m.secureUrl).filter(isValidImageUrl);
  const legacyUrls = [
    ...(record.galleryImages ?? []),
    ...(record.images?.map((img) => img.imageUrl) ?? []),
  ].filter(isValidImageUrl) as string[];

  if (mediaUrls.length > 0) return mediaUrls;
  return legacyUrls;
}

/**
 * Transforms a Cloudinary URL to add auto format (f_auto), auto quality (q_auto),
 * and width constraining (w_<width>, c_limit) to drastically reduce image weight.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  width?: number,
  height?: number,
): string {
  if (!url || !isValidImageUrl(url)) return "";

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // If already transformed with f_auto/q_auto, return as-is
  if (
    url.includes("/upload/f_auto") ||
    url.includes("/upload/q_auto") ||
    url.includes("/upload/w_")
  ) {
    return url;
  }

  const transformParts: string[] = ["f_auto", "q_auto"];
  if (width) transformParts.push(`w_${width}`);
  if (height) transformParts.push(`h_${height}`);
  if (width || height) transformParts.push("c_limit");

  const transformString = transformParts.join(",");
  return url.replace("/upload/", `/upload/${transformString}/`);
}
