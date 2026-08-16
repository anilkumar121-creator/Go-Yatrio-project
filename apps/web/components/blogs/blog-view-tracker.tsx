"use client";

import { useEffect } from "react";

export function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/blogs/${slug}/view`, { method: "POST" }).catch(() => undefined);
  }, [slug]);

  return null;
}
