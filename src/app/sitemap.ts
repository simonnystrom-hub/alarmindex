import type { MetadataRoute } from "next";
import { getNewspapers, getPublishedDaySummaries, getPublishedSnapshotPaths } from "@/lib/sanity/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteUrl) {
    return [{ url: "/", changeFrequency: "daily", priority: 1 }];
  }

  const base = siteUrl.replace(/\/$/, "");
  const [days, newspapers, editions] = await Promise.all([
    getPublishedDaySummaries(),
    getNewspapers(),
    getPublishedSnapshotPaths(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/dag`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/metodik`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const dayRoutes: MetadataRoute.Sitemap = days.map((day) => ({
    url: `${base}/dag/${day.date}`,
    lastModified: new Date(`${day.date}T12:00:00`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const newspaperRoutes: MetadataRoute.Sitemap = newspapers.flatMap((paper) => [
    {
      url: `${base}/tidning/${paper.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.75,
    },
    {
      url: `${base}/tidning/${paper.slug}/bedom`,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    },
  ]);

  const editionRoutes: MetadataRoute.Sitemap = editions
    .filter((row) => row.date && row.slug)
    .map((row) => ({
      url: `${base}/dag/${row.date}/${row.slug}`,
      lastModified: new Date(`${row.date}T12:00:00`),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  return [...staticRoutes, ...dayRoutes, ...newspaperRoutes, ...editionRoutes];
}
