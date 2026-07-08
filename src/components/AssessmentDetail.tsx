import { ScoreBar } from '@/components/ScoreBar'
import { EMOTION_LABELS, type EmotionPrimary } from '@/lib/scoring'
import type { VisitorAssessment } from '@/lib/sanity/assessment-queries'
import { VISITOR_ASSESSMENT_LABEL } from '@/lib/score-labels'
import { newspaperColor } from '@/lib/newspaper-colors'

type AssessmentDetailProps = {
  assessment: VisitorAssessment
}

export function AssessmentDetail({ assessment }: AssessmentDetailProps) {
  const color = newspaperColor(assessment.newspaper.slug)
  const score = assessment.displayScore ?? 0

  if (assessment.status === 'pending' || assessment.status === 'processing') {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-[var(--accent)]">Bedömning pågår</p>
        <p className="mt-2 text-[var(--ink-muted)]">
          Vi analyserar rubriken och mailar dig när resultatet är klart. Sidan uppdateras automatiskt
          när bedömningen är publicerad.
        </p>
      </div>
    )
  }

  if (assessment.status === 'failed') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-900">Bedömningen misslyckades</p>
        <p className="mt-2 text-sm text-red-800">{assessment.failureReason}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <p className="inline-flex rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--ink-subtle)]">
          {VISITOR_ASSESSMENT_LABEL}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">{assessment.headlineText}</h2>
        {assessment.subheading ? (
          <p className="mt-2 text-sm text-[var(--ink-muted)]">{assessment.subheading}</p>
        ) : null}
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          {assessment.newspaper.name} · {new Date(assessment.submittedAt).toLocaleDateString('sv-SE')}
        </p>
        <div className="mt-5 max-w-sm">
          <ScoreBar score={score} label={VISITOR_ASSESSMENT_LABEL} accentColor={color} />
        </div>
      </article>

      {assessment.threatIntensity != null ? (
        <dl className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--ink-subtle)]">Hotintensitet</dt>
            <dd>{assessment.threatIntensity}/4</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-subtle)]">Personifiering</dt>
            <dd>{assessment.personalFraming}/4</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-subtle)]">Kontextlöshet</dt>
            <dd>{assessment.decontextualization}/4</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-subtle)]">Formspråk</dt>
            <dd>{assessment.formalIntensity}/4</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-subtle)]">Känsla</dt>
            <dd>
              {EMOTION_LABELS[assessment.emotionPrimary as EmotionPrimary] ??
                assessment.emotionPrimary}{' '}
              ({assessment.emotionIntensity}/4)
            </dd>
          </div>
        </dl>
      ) : null}

      {assessment.reasoning ? (
        <div className="rounded-2xl bg-[var(--surface-muted)] p-5 text-sm text-[var(--ink-muted)]">
          <p className="font-medium text-[var(--ink)]">Modellens motivering</p>
          <p className="mt-2">{assessment.reasoning}</p>
          {assessment.promptVersion ? (
            <p className="mt-3 text-xs text-[var(--ink-subtle)]">
              Metodversion {assessment.promptVersion} · Modell {assessment.modelVersion}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
