import type { Metadata } from "next";
import type { SiteSettings } from "@/lib/sanity/types";
import {
  DAG_DESCRIPTION,
  DAG_TITLE,
  HOME_DESCRIPTION,
  METODIK_DESCRIPTION,
  METODIK_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SLOGAN,
  SITE_TITLE,
} from "@/lib/site-meta";

export function resolveSiteName(settings: SiteSettings | null): string {
  return settings?.siteName?.trim() || SITE_NAME;
}

export function resolveDefaultDescription(settings: SiteSettings | null): string {
  return settings?.defaultDescription?.trim() || SITE_DESCRIPTION;
}

export function resolveSiteSlogan(settings: SiteSettings | null): string {
  return settings?.siteSlogan?.trim() || SITE_SLOGAN;
}

export function buildPageTitle(
  pageTitle: string | undefined | null,
  fallback: string,
  siteName: string,
): string {
  const trimmed = pageTitle?.trim();
  if (!trimmed) return `${fallback} — ${siteName}`;
  return `${trimmed} — ${siteName}`;
}

export function buildPageMetadata(
  settings: SiteSettings | null,
  page: "home" | "metodik" | "dag",
): Metadata {
  const siteName = resolveSiteName(settings);

  switch (page) {
    case "home":
      return {
        title: settings?.homeTitle?.trim() || SITE_TITLE,
        description: settings?.homeDescription?.trim() || HOME_DESCRIPTION,
      };
    case "metodik":
      return {
        title: buildPageTitle(settings?.metodikTitle, METODIK_TITLE, siteName),
        description: settings?.metodikDescription?.trim() || METODIK_DESCRIPTION,
      };
    case "dag":
      return {
        title: buildPageTitle(settings?.dagTitle, DAG_TITLE, siteName),
        description: settings?.dagDescription?.trim() || DAG_DESCRIPTION,
      };
  }
}

export function buildRootMetadata(settings: SiteSettings | null, siteUrl?: string): Metadata {
  const siteName = resolveSiteName(settings);
  const description = resolveDefaultDescription(settings);
  const slogan = resolveSiteSlogan(settings);

  return {
    title: {
      default: settings?.homeTitle?.trim() || SITE_TITLE,
      template: `%s — ${siteName}`,
    },
    description,
    ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
    openGraph: {
      title: siteName,
      description: slogan,
      locale: "sv_SE",
      type: "website",
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: slogan,
    },
  };
}
