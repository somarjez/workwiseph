import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WorkWise PH — Philippine Labor Market Outlook",
    short_name: "WorkWise PH",
    description: "Short-term Philippine labor forecasts with uncertainty and supporting PSA analysis.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3457d5",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
