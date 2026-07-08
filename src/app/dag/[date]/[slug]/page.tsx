import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { VisitorAssessmentSection } from "@/components/VisitorAssessmentSection";
import { ScoreBar } from "@/components/ScoreBar";
import { SnapshotScreenshots } from "@/components/SnapshotScreenshots";
import { EMOTION_LABELS, type EmotionPrimary } from "@/lib/scoring";
import { OFFICIAL_DAILY_SCORE_LABEL } from "@/lib/score-labels";
import { getSnapshotForDate } from "@/lib/sanity/queries";
import { internal04ToDisplay10 } from "@/lib/assessment/dimension-scale";

type PageProps = {
  params: Promise<{ date: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date, slug } = await params;
  const snapshot = await getSnapshotForDate(slug, date);

  if (!snapshot) {
    return { title: "Saknas — Alarmindex" };
  }

  const score = snapshot.dailyScore ?? 0;
  const driving = snapshot.drivingHeadline?.text;

  return {
    title: `${snapshot.newspaper.name} ${date} — Alarmindex`,
    description: driving
      ? `Dagspoäng ${score}. Drivande rubrik: «${driving}».`
      : `Dagspoäng ${score} för ${snapshot.newspaper.name} ${date}.`,
  };
}

export default async function DayNewspaperPage({ params }: PageProps) {
  const { date, slug } = await params;
  const snapshot = await getSnapshotForDate(slug, date);
  if (!snapshot) notFound();

  const drivingId = snapshot.drivingHeadline?._id;

  return (
    <div className="space-y-8">
      <PageHeader
        backHref={`/dag/${date}`}
        backLabel={date}
        title={snapshot.newspaper.name}
        description={`Alla rubriker och poäng för ${date}.`}
      >
        <div className="space-y-3 pt-2">
          <div className="max-w-xs">
            <ScoreBar score={snapshot.dailyScore ?? 0} label={OFFICIAL_DAILY_SCORE_LABEL} />
          </div>
          <p className="text-sm text-[var(--ink-muted)]">
            <Link
              href={`/tidning/${slug}`}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Se {snapshot.newspaper.name}s summeringssida →
            </Link>
          </p>
        </div>
      </PageHeader>

      <SnapshotScreenshots
        newspaperName={snapshot.newspaper.name}
        date={date}
        aboveFold={snapshot.screenshotAboveFold}
        desktop={snapshot.screenshotDesktop}
        desktopHeight={snapshot.screenshotDesktopHeight}
        extended={snapshot.screenshotExtended}
        extendedHeight={snapshot.screenshotExtendedHeight}
      />

      <div className="space-y-4">
        {snapshot.headlines.map((headline) => {
          const isDriving = drivingId != null && headline._id === drivingId;

          return (
            <article
              key={headline._id}
              className={`rounded-2xl border bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] ${
                isDriving
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  {isDriving ? (
                    <p className="mb-2 inline-flex rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                      Drivande rubrik
                    </p>
                  ) : null}
                  <h2 className="text-lg font-semibold text-[var(--ink)]">{headline.text}</h2>
                  {headline.subheading ? (
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">{headline.subheading}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--ink-subtle)]">
                    {headline.aboveFoldMobile
                      ? "Synlig utan scroll (mobil)"
                      : "Kräver scroll (mobil)"}
                  </p>
                </div>
                {headline.score ? (
                  <div className="w-full sm:w-40">
                    <ScoreBar score={headline.score.displayScore} />
                  </div>
                ) : null}
              </div>

              {headline.score ? (
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--ink-subtle)]">Hotintensitet</dt>
                    <dd>
                      {Math.round(
                        internal04ToDisplay10(headline.score.threatIntensity),
                      )}
                      /10
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--ink-subtle)]">Personifiering</dt>
                    <dd>
                      {Math.round(
                        internal04ToDisplay10(headline.score.personalFraming),
                      )}
                      /10
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--ink-subtle)]">Kontextlöshet</dt>
                    <dd>
                      {Math.round(
                        internal04ToDisplay10(headline.score.decontextualization),
                      )}
                      /10
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--ink-subtle)]">Formspråk</dt>
                    <dd>
                      {Math.round(
                        internal04ToDisplay10(headline.score.formalIntensity),
                      )}
                      /10
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--ink-subtle)]">Känsla</dt>
                    <dd>
                      {EMOTION_LABELS[headline.score.emotionPrimary as EmotionPrimary] ??
                        headline.score.emotionPrimary}{" "}
                      ({Math.round(internal04ToDisplay10(headline.score.emotionIntensity))}/10)
                    </dd>
                  </div>
                </dl>
              ) : null}

              {headline.score?.reasoning ? (
                <div className="mt-4 rounded-xl bg-[var(--surface-muted)] p-3 text-sm text-[var(--ink-muted)]">
                  <p className="font-medium text-[var(--ink)]">Modellens motivering</p>
                  <p className="mt-1">{headline.score.reasoning}</p>
                  {headline.score.promptVersion ? (
                    <p className="mt-2 text-xs text-[var(--ink-subtle)]">
                      Metodversion {headline.score.promptVersion} · Modell{" "}
                      {headline.score.modelVersion}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <VisitorAssessmentSection slug={slug} name={snapshot.newspaper.name} />
    </div>
  );
}
