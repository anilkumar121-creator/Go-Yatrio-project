import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GoYatrio",
    short_name: "GoYatrio",
    description: "GoYatrio travel inquiry and booking foundation.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0057d9",
    icons: [
      {
        src: "/favicons/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
