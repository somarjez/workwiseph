import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const ROUTES = ["", "/overview", "/underemployment", "/age-gender", "/industry",
  "/education", "/workforce", "/forecasting", "/explore", "/report"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.7,
  }));
}
