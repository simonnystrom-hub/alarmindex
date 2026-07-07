# Besökarbedömningar — designspec

Status: **Fas 1–2 implementerad** (artikel-URL:er; löpsedlar återstår)

## Syfte

Besökare kan klistra in en URL från en listade tidning och få en alarmindex-bedömning. Resultatet sparas, kan delas via en kort länk, och syns på tidningssidan — separat från det dagliga löpsedelsindexet.

---

## Produktbeslut

| Fråga | Beslut |
|-------|--------|
| URL-typer | Både artikel och löpsedel — systemet avgör automatiskt |
| Synlighet | På respektive `/tidning/[slug]` — **inte** i dagliga rankningar |
| Körning | Asynkront; besökaren får e-post när klart (eller vid fel) |
| Publicering | Direkt (`auto_publish`), markerad som besökarinitierad |
| Medelvärden | Per tidning (aggregerat över alla besökarbedömningar) |
| Deduplicering | Samma normaliserade URL bedöms **en gång** — återanvänd befintlig |
| Delningslänk | `/bedomning/[kort-id]` (t.ex. `/bedomning/a3f9k2`) |
| E-post | **Krävs** — Resend skickar notis |
| Rate limit | Strikt: max 3/dag per e-post + CAPTCHA |
| Överlapp med daglig pipeline | Helt separat — även om URL matchar dagens löpsedel |
| Tidningssida UI | Formulär + lista (10 senaste) under dagliga grafer |
| OG / delningstext | *"Alarmindex 78/100 — «Rubriken här»"* (eller liknande) |
| Misslyckad scrape | Maila besökaren med felmeddelande |
| Lista | 10 senaste per tidning; **maskera e-post** i visning |
| GDPR | Samtycke via inskickning (se integritetstext) + **valfri** kryssruta för marknadsutskick |

---

## Användarflöde

```
Besökare → /tidning/[slug] → "Bedöm en artikel"
  → Ange URL + e-post + CAPTCHA + (valfritt) marknadsutskick
  → Domänvalidering + rate limit
  → URL redan i Sanity?
       ja  → Redirect till /bedomning/[id]
       nej → Skapa visitorAssessment (pending)
             → Köa worker-jobb
             → Bekräftelsesida: "Vi mailar dig när det är klart"
  → Worker: scrape + AI-scoring
       ok  → publicera → Resend: "Din bedömning är klar" + länk
       fel → Resend: "Bedömningen misslyckades" + kort förklaring
```

---

## Datamodell (Sanity)

Nytt dokument: `visitorAssessment`

| Fält | Typ | Kommentar |
|------|-----|-----------|
| `shortId` | string | Unik, URL-safe (6–8 tecken) |
| `sourceUrl` | string | Normaliserad URL — **unik** |
| `sourceUrlRaw` | string | Original från formulär |
| `urlType` | `article` \| `frontpage` | Automatiskt |
| `newspaper` | reference → `newspaper` | |
| `submittedAt` | datetime | |
| `submitterEmail` | string | Lagras; maskeras i publika queries |
| `marketingOptIn` | boolean | Valfri kryssruta |
| `status` | `pending` \| `processing` \| `published` \| `failed` | |
| `headlineText` | string | |
| `subheading` | string? | |
| `displayScore` | number | 0–100 |
| `threatIntensity` … | number | Samma dimensioner som `headlineScore` |
| `emotionPrimary` | string | |
| `emotionIntensity` | number | |
| `reasoning` | text | |
| `promptVersion` | string | |
| `modelVersion` | string | |
| `screenshot` | image? | Nice-to-have, fas 2+ |
| `failureReason` | string? | Vid `failed` |
| `isVisitorSubmitted` | boolean | Alltid `true` — tydlig markering |

**Deduplicering:** GROQ/fetch på `sourceUrl` före skapande. Vid träff returnera befintlig `shortId`.

**URL-normalisering:** lowercase host, ta bort `utm_*`/`fbclid`/spårparametrar, trailing slash, ev. `www.`-kanonisering.

---

## Arkitektur

```
Next.js (Vercel)                    alarmindex-studio (worker)
─────────────────                   ───────────────────────────
POST /api/assess                    scripts/process-assessment.ts
  → validera, CAPTCHA, rate limit     → Playwright / fetch
  → dedup i Sanity                    → scoreHeadlineWithAi()
  → skapa pending                     → patch Sanity → published
  → trigga worker                     → webhook till Resend (eller Vercel anropar Resend)
Resend                              GitHub Actions / VPS (kö)
  → klar / fel-mail
```

Playwright kan **inte** köras i Vercel serverless. Worker körs via befintlig studio-infra (utöka `daily`-mönstret) eller dedikerad kö.

### Miljövariabler (nya)

| Variabel | Var | Syfte |
|----------|-----|--------|
| `RESEND_API_KEY` | Vercel + worker | E-post |
| `RESEND_FROM_EMAIL` | Vercel | Avsändare |
| `TURNSTILE_SECRET_KEY` | Vercel | CAPTCHA |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Vercel | CAPTCHA widget |
| `ASSESSMENT_WEBHOOK_SECRET` | Vercel + worker | Säker jobbtriggning |

---

## Sidor & API

| Route | Syfte |
|-------|--------|
| `POST /api/assess` | Ta emot URL + e-post, dedup, köa |
| `/bedomning/[id]` | Publik bedömningssida med OG-taggar |
| `/tidning/[slug]` | Befintlig sida + avsnitt "Bedöm en artikel" + 10 senaste |

### OG-metadata (delning)

```
Titel:   Alarmindex 78/100 — Expressen
Beskrivning: «Rubriktext här». AI-bedömning av alarmistiskt formspråk.
Bild:    Ev. genererad OG-bild med poäng + rubrik (fas 4)
```

---

## Tidningssida — nytt avsnitt

Placering: **under** befintliga grafer/medelvärden.

1. **Formulär:** URL, e-post, CAPTCHA, kryssruta marknadsutskick (valfri)
2. **Integritetstext:** *"Genom att skicka in godkänner du att vi behandlar din e-postadress för att leverera bedömningen. [Läs mer om hur vi hanterar personuppgifter](/integritet)."*
3. **Lista:** 10 senaste besökarbedömningar för tidningen
   - Rubrik (trunkerad), poäng, datum, länk till `/bedomning/[id]`
   - E-post maskerad: `s***@example.com`

### Medelvärde per tidning

Ny KPI i samma avsnitt, t.ex.:

> **Snitt besökarbedömningar:** 62/100 (baserat på 47 bedömningar)

Separat från löpsedelns glidande medelvärde — tydlig etikett.

---

## E-post (Resend)

### Lyckad bedömning

- **Ämne:** Din alarmindex-bedömning är klar
- **Innehåll:** Rubrik, poäng, kort tolkning, länk till `/bedomning/[id]`

### Misslyckad bedömning

- **Ämne:** Vi kunde inte bedöma din länk
- **Innehåll:** Kort förklaring (`failureReason`), tips (kontrollera URL, artikel bakom paywall)

---

## Säkerhet

- Domänallowlist per tidning (från `newspaper.sourceUrl` + kända varianter)
- Max **3 bedömningar per e-post per dag**
- CAPTCHA (Cloudflare Turnstile)
- `ASSESSMENT_WEBHOOK_SECRET` för worker-anrop
- E-post lagras men exponeras aldrig i klartext på webben

---

## Scrape-strategi per URL-typ

| Typ | Metod |
|-----|--------|
| **Artikel** | 1) JSON-LD `headline` 2) `og:title` 3) tidningsspecifika selektorer |
| **Löpsedel** | Befintlig pipeline (`run-pipeline.ts`) — en körning, spara som visitorAssessment |

Artikelscraping utökar `newspaper-scrape-config.ts` med artikel-selektorer per tidning.

---

## Implementationsfaser

| Fas | Innehåll |
|-----|----------|
| **1** | Sanity-schema, `POST /api/assess`, dedup, worker (artikel via OG/JSON-LD), `/bedomning/[id]`, Resend |
| **2** | Formulär på tidningssida, CAPTCHA, rate limit, lista (10 st, maskerad e-post) |
| **3** | Löpsedels-URL:er via befintlig pipeline |
| **4** | Medelvärden per tidning, OG-bild för delning |
| **5** | Tidningsspecifika artikel-scrapers, screenshot av artikel |

---

## Öppna tekniska detaljer (vid implementation)

- Exakt format för `shortId` (nanoid 8 tecken?)
- Worker-triggning: GitHub `workflow_dispatch` vs polling från worker
- Om `marketingOptIn` ska synkas till extern lista (Resend Audience) direkt eller senare
