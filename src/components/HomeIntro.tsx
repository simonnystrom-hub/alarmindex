import Link from "next/link";

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

export function HomeIntro() {
  return (
    <details className="group max-w-3xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">Vad är alarmindex?</h2>
          <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
            Alarmistiskt formspråk i rubriker och löpsedlar — dag för dag.
          </p>
        </div>
        <ChevronIcon className="h-5 w-5 shrink-0 text-[var(--ink-subtle)] transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-4 border-t border-[var(--border)] px-5 py-5 sm:px-6 sm:py-6">
        <div className="space-y-3 text-[var(--ink-muted)] leading-relaxed">
          <p>
            Det här indexet mäter hur mycket svenska dagstidningars rubriker och löpsedlar
            använder <strong className="font-medium text-[var(--ink)]">alarmistiskt formspråk</strong>{" "}
            — språk som ska fånga uppmärksamhet genom hot, dramatik och känslomässig laddning.
            I centrum står ofta <strong className="font-medium text-[var(--ink)]">rädsla</strong>,
            men samma mönster kan också drivas av ilska, sorg eller avsky.
          </p>
          <p>
            Indexet bedömer inte om nyheterna är sanna, viktiga eller välgranskade — bara{" "}
            <em>hur</em> de presenteras i det du möter först på mobilen. Ett högre alarmindex
            betyder mer alarmistiska rubriker, inte viktigare nyheter.
          </p>
          <p>
            Här kan du jämföra hur hårt olika tidningar trycker på skräck och oro — dag för dag och
            över tid.
          </p>
        </div>

        <p className="border-t border-[var(--border)] pt-4 text-xs text-[var(--ink-subtle)]">
          Metod och avgränsningar finns på{" "}
          <Link href="/metodik" className="underline hover:text-[var(--ink-muted)]">
            metodiksidan
          </Link>
          .
        </p>
      </div>
    </details>
  );
}
