# Alarmindex

Dagligt formspråksindex för svenska nyhetsrubriker. Next.js-frontend som läser publicerad data från Sanity.

**Utökad guide:** [docs/PROJEKTGUIDE.md](docs/PROJEKTGUIDE.md) — arkitektur, terminalkommandon, felsökning och hur delarna kommunicerar.

## Kom igång

1. Skapa Sanity-projekt och kopiera project ID till `.env` (se `.env.example`)
2. Starta Studio i `../alarmindex-studio`, kör `npm run seed`
3. Starta frontend:

```bash
npm install
npm run dev
```

Öppna http://localhost:3000

## Sidor

| Sida | Beskrivning |
|------|-------------|
| `/` | Dagens rankade index |
| `/metodik` | Metodbeskrivning |
| `/tidning/[slug]` | Tidsserie per tidning |
| `/dag` | Lista över publicerade dagar |
| `/dag/[date]` | Alla tidningar en dag |
| `/dag/[date]/[slug]` | Rubriker + reasoning |
| `/llms.txt` | AI-synlighet |

## Arkitektur

```
Scraping → AI-scoring → kod (exponeringsvikt) → granskning i Studio → publicering → Next.js
```

Scoring-logik finns i `src/lib/scoring/` (spegel av Studio `lib/scoring.ts`).

## Förhandsvisning

Se `alarmindex-studio` README. Kräver `SANITY_PREVIEW_SECRET` och `SANITY_API_READ_TOKEN` i `.env.local`.

## Screenshots

Vid insamling sparas två mobilbilder per löpsedel:

1. **Above the fold** — exakt viewport (390×844 px), det läsaren ser utan att scrolla.
2. **Utökad vy** — från toppen nedåt, max **2200 px** höjd (~2,6 skärmar). Räcker för fler rubriker utan att fånga hela sidan.

Bilderna visas på dagsvyn per tidning och lagras i Sanity tillsammans med rubrikpoängen.

## Sanity

Kräver `NEXT_PUBLIC_SANITY_PROJECT_ID` och dataset `production` med publicerade `frontPageSnapshot`-dokument.
