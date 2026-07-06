import type { Metadata, Viewport } from "next";
import { Source_Serif_4, IBM_Plex_Sans } from "next/font/google";
import { PreviewBanner } from "@/components/PreviewBanner";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SITE_DESCRIPTION, SITE_NAME, SITE_SLOGAN, SITE_TITLE } from "@/lib/site-meta";
import "./globals.css";

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  adjustFontFallback: true,
  preload: false,
});

const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
  adjustFontFallback: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f1ea",
};

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  openGraph: {
    title: SITE_NAME,
    description: SITE_SLOGAN,
    locale: "sv_SE",
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_SLOGAN,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${serif.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-[var(--bg)] font-sans text-[var(--ink)] antialiased">
        <PreviewBanner />
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-4 sm:py-12">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
