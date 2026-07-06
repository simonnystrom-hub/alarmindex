import Image from "next/image";
import type { SanityImage } from "@/lib/sanity/types";
import { screenshotUrl } from "@/lib/sanity/image";

type SnapshotScreenshotsProps = {
  newspaperName: string;
  date: string;
  aboveFold?: SanityImage | null;
  desktop?: SanityImage | null;
  desktopHeight?: number | null;
  /** Äldre snapshots — visas om desktop saknas */
  extended?: SanityImage | null;
  extendedHeight?: number | null;
};

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SnapshotScreenshots({
  newspaperName,
  date,
  aboveFold,
  desktop,
  desktopHeight,
  extended,
  extendedHeight,
}: SnapshotScreenshotsProps) {
  const aboveUrl = screenshotUrl(aboveFold, 390);
  const desktopUrl = screenshotUrl(desktop, 1280);
  const legacyExtendedUrl = screenshotUrl(extended, 390);

  const overviewUrl = desktopUrl ?? legacyExtendedUrl;
  const overviewWidth = desktopUrl ? 1280 : 390;
  const overviewHeight = desktopUrl
    ? (desktopHeight ?? 3200)
    : (extendedHeight ?? 2200);
  const overviewLabel = desktopUrl
    ? "Desktopöversikt"
    : legacyExtendedUrl
      ? "Utökad vy (äldre)"
      : null;

  if (!aboveUrl && !overviewUrl) {
    return null;
  }

  return (
    <details className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 sm:px-5 [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">Löpsedel</h2>
          <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
            Mobil (390×844) för poängsättning · desktop (1280 px) för översikt.
          </p>
        </div>
        <ChevronIcon className="h-5 w-5 shrink-0 text-[var(--ink-subtle)] transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-[var(--border)] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          {aboveUrl ? (
            <figure className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
              <figcaption className="border-b border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink)]">
                Mobil — above the fold
              </figcaption>
              <Image
                src={aboveUrl}
                alt={
                  aboveFold?.alt ??
                  `${newspaperName} löpsedel ${date} — synligt utan scroll (mobil)`
                }
                width={390}
                height={844}
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                className="h-auto w-full"
              />
            </figure>
          ) : null}

          {overviewUrl && overviewLabel ? (
            <figure className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
              <figcaption className="border-b border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--ink)]">
                {overviewLabel}
                {desktopUrl && desktopHeight ? (
                  <span className="ml-2 font-normal text-[var(--ink-subtle)]">
                    ({desktopHeight} px höjd)
                  </span>
                ) : null}
              </figcaption>
              <div className="max-h-[min(85vh,80rem)] overflow-y-auto">
                <Image
                  src={overviewUrl}
                  alt={
                    desktop?.alt ??
                    extended?.alt ??
                    `${newspaperName} löpsedel ${date} — desktopöversikt`
                  }
                  width={overviewWidth}
                  height={overviewHeight}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  className="h-auto w-full"
                />
              </div>
            </figure>
          ) : null}
        </div>
      </div>
    </details>
  );
}
