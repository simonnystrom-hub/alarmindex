type SendEmailParams = {
  to: string
  subject: string
  html: string
}

export async function sendAssessmentEmail(params: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim() ?? 'Alarmindex <noreply@alarmindex.com>'

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[resend:dev]', params.subject, '→', params.to)
      return
    }
    throw new Error('RESEND_API_KEY saknas')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Resend misslyckades: ${text}`)
  }
}

export function buildSuccessEmailHtml(params: {
  headline: string
  score: number
  newspaperName: string
  assessmentUrl: string
}): string {
  return `
    <p>Hej!</p>
    <p>Din alarmindex-bedömning för <strong>${escapeHtml(params.newspaperName)}</strong> är klar.</p>
    <p><strong>«${escapeHtml(params.headline)}»</strong></p>
    <p>Poäng: <strong>${params.score}/100</strong></p>
    <p><a href="${params.assessmentUrl}">Visa och dela bedömningen</a></p>
    <p style="color:#666;font-size:14px;">Alarmindex mäter alarmistiskt formspråk — inte sanningshalt eller nyhetsvärde.</p>
  `
}

export function buildFailureEmailHtml(params: {
  reason: string
  assessmentUrl?: string
}): string {
  return `
    <p>Hej!</p>
    <p>Vi kunde tyvärr inte bedöma länken du skickade in.</p>
    <p><strong>${escapeHtml(params.reason)}</strong></p>
    <p>Tips: kontrollera att URL:en är en artikel från en av våra listade tidningar, och att sidan inte kräver inloggning.</p>
    ${params.assessmentUrl ? `<p><a href="${params.assessmentUrl}">Visa status</a></p>` : ''}
  `
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
