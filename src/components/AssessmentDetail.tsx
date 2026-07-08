import Link from 'next/link'
import { ScoreBar } from '@/components/ScoreBar'
import { EMOTION_LABELS, type EmotionPrimary } from '@/lib/scoring'
import type { VisitorAssessment } from '@/lib/sanity/assessment-queries'
import {
  VISITOR_ASSESSMENT_COMBINED_LABEL,
  VISITOR_ASSESSMENT_HEADLINE_LABEL,
  VISITOR_ASSESSMENT_LABEL,
  VISITOR_ASSESSMENT_LEAD_LABEL,
} from '@/lib/score-labels'
import { newspaperColor } from '@/lib/newspaper-colors'
import { internal04ToDisplay10 } from '@/lib/assessment/dimension-scale'

type AssessmentDetailProps = {
  assessment: VisitorAssessment
}

type DimensionFields = {
  threatIntensity?: number
  personalFraming?: number
  decontextualization?: number
  formalIntensity?: number
  emotionPrimary?: EmotionPrimary
  emotionIntensity?: number
  reasoning?: string
}

function combinedScoreNote(
  headlineScore: number,
  leadScore: number,
  combinedScore: number,
): string {
  const diff = leadScore - headlineScore
  if (diff > 0) {
    return `Ingressen bedöms högre än rubriken (${leadScore} mot ${headlineScore}) och lyfter det sammanlagda poänget till ${combinedScore}.`
  }
  if (diff < 0) {
    return `Rubriken bedöms högre än ingressen (${headlineScore} mot ${leadScore}). Det sammanlagda poänget blir ${combinedScore}.`
  }
  return `Rubrik och ingress bedöms lika (${headlineScore}). Det sammanlagda poänget blir ${combinedScore}.`
}

function DimensionGrid({ dimensions }: { dimensions: DimensionFields }) {
  if (dimensions.threatIntensity == null) return null

  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-[var(--ink-subtle)]">Hotintensitet</dt>
        <dd>{Math.round(internal04ToDisplay10(dimensions.threatIntensity ?? 0))}/10</dd>
      </div>
      <div>
        <dt className="text-[var(--ink-subtle)]">Personifiering</dt>
        <dd>{Math.round(internal04ToDisplay10(dimensions.personalFraming ?? 0))}/10</dd>
      </div>
      <div>
        <dt className="text-[var(--ink-subtle)]">Kontextlöshet</dt>
        <dd>
          {Math.round(internal04ToDisplay10(dimensions.decontextualization ?? 0))}/10
        </dd>
      </div>
      <div>
        <dt className="text-[var(--ink-subtle)]">Formspråk</dt>
        <dd>{Math.round(internal04ToDisplay10(dimensions.formalIntensity ?? 0))}/10</dd>
      </div>
      <div>
        <dt className="text-[var(--ink-subtle)]">Känsla</dt>
        <dd>
          {EMOTION_LABELS[dimensions.emotionPrimary as EmotionPrimary] ??
            dimensions.emotionPrimary}{' '}
          ({Math.round(internal04ToDisplay10(dimensions.emotionIntensity ?? 0))}/10)
        </dd>
      </div>
    </dl>
  )
}

export function AssessmentDetail({ assessment }: AssessmentDetailProps) {
  const color = newspaperColor(assessment.newspaper.slug)
  const combinedScore = assessment.displayScore ?? 0
  const headlineScore =
    assessment.headlineDisplayScore ?? assessment.displayScore ?? 0
  const leadScore = assessment.leadDisplayScore
  const hasLeadScore = leadScore != null && assessment.leadText
  const showSubheading =
    assessment.subheading &&
    assessment.subheading.trim() !== assessment.leadText?.trim()

  if (assessment.status === 'pending' || assessment.status === 'processing') {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-[var(--accent)]">Bedömning pågår</p>
        <p className="mt-2 text-[var(--ink-muted)]">
          Vi analyserar rubriken och ingressen och mailar dig när resultatet är klart. Sidan
          uppdateras automatiskt när bedömningen är publicerad.
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
        <p className="mt-3 text-sm text-[var(--ink-muted)]">
          {assessment.newspaper.name} ·{' '}
          {new Date(assessment.submittedAt).toLocaleDateString('sv-SE')}
        </p>
        <div className="mt-5 max-w-sm">
          <ScoreBar
            score={combinedScore}
            label={hasLeadScore ? VISITOR_ASSESSMENT_COMBINED_LABEL : VISITOR_ASSESSMENT_LABEL}
            accentColor={color}
          />
        </div>
        {hasLeadScore ? (
          <div className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
            <p>
              Sammanlagt poäng är medelvärdet av rubrik och ingress — båda bedöms med samma fem
              dimensioner.
            </p>
            <p className="font-medium text-[var(--ink)]">
              {combinedScoreNote(headlineScore, leadScore!, combinedScore)}
            </p>
            <p>
              Rubrik {headlineScore}/100 · Ingress {leadScore}/100
            </p>
          </div>
        ) : assessment.leadMissing ? (
          <p className="mt-2 text-sm text-amber-800">
            Ingress kunde inte läsas — bedömningen gäller endast rubriken.
          </p>
        ) : null}
      </article>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-subtle)]">
            {VISITOR_ASSESSMENT_HEADLINE_LABEL}
          </h2>
          <p className="text-xl font-semibold text-[var(--ink)]">{assessment.headlineText}</p>
          {showSubheading ? (
            <p className="text-sm text-[var(--ink-muted)]">{assessment.subheading}</p>
          ) : null}
          <div className="max-w-sm">
            <ScoreBar
              score={headlineScore}
              label={VISITOR_ASSESSMENT_HEADLINE_LABEL}
              accentColor={color}
            />
          </div>
        </div>
        <DimensionGrid
          dimensions={{
            threatIntensity: assessment.threatIntensity,
            personalFraming: assessment.personalFraming,
            decontextualization: assessment.decontextualization,
            formalIntensity: assessment.formalIntensity,
            emotionPrimary: assessment.emotionPrimary,
            emotionIntensity: assessment.emotionIntensity,
          }}
        />
        {assessment.reasoning ? (
          <div className="rounded-xl bg-[var(--surface-muted)] p-4 text-sm text-[var(--ink-muted)]">
            <p className="font-medium text-[var(--ink)]">Motivering</p>
            <p className="mt-2">{assessment.reasoning}</p>
          </div>
        ) : null}
      </section>

      {hasLeadScore ? (
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-subtle)]">
              {VISITOR_ASSESSMENT_LEAD_LABEL}
            </h2>
            <p className="text-base leading-relaxed text-[var(--ink)]">{assessment.leadText}</p>
            <p className="text-sm text-[var(--ink-muted)]">
              Artikelns inledande stycke — bedöms separat eftersom det ofta förstärker eller
              förtydligar rubrikens formspråk.{' '}
              <Link href="/metodik#besokarbedomningar" className="text-[var(--accent)] hover:underline">
                Läs mer i metodiken
              </Link>
              .
            </p>
            <div className="max-w-sm">
              <ScoreBar
                score={leadScore}
                label={VISITOR_ASSESSMENT_LEAD_LABEL}
                accentColor={color}
              />
            </div>
          </div>
          <DimensionGrid
            dimensions={{
              threatIntensity: assessment.leadThreatIntensity,
              personalFraming: assessment.leadPersonalFraming,
              decontextualization: assessment.leadDecontextualization,
              formalIntensity: assessment.leadFormalIntensity,
              emotionPrimary: assessment.leadEmotionPrimary,
              emotionIntensity: assessment.leadEmotionIntensity,
            }}
          />
          {assessment.leadReasoning ? (
            <div className="rounded-xl bg-[var(--surface-muted)] p-4 text-sm text-[var(--ink-muted)]">
              <p className="font-medium text-[var(--ink)]">Motivering</p>
              <p className="mt-2">{assessment.leadReasoning}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {assessment.promptVersion ? (
        <p className="text-xs text-[var(--ink-subtle)]">
          Metodversion {assessment.promptVersion} · Modell {assessment.modelVersion}
        </p>
      ) : null}
    </div>
  )
}
