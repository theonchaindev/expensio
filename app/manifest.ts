import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Your Expenses",
    short_name: "Your Expenses",
    description: "Company expense management by dbfb",
    start_url: "/",
    display: "standalone",
    background_color: "#263469",
    theme_color: "#EC5F5B",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
