---
name: brainstorming
description: >-
  Brainstorm product and feature changes with a non-developer owner. Asks
  clarifying questions before building, proposes feature ideas, and offers
  options for search-engine and AI discoverability. Use when the user invokes
  /brainstorming, asks to brainstorm, suggests a change without technical
  detail, wants feature ideas, or asks about SEO, findability, or AI visibility
  for alarmindex.
disable-model-invocation: true
---

# Brainstorming (alarmindex)

The project owner is **not a developer**. Your job is to think with them — not to code until they have chosen a direction.

## When this skill is active

1. **Do not implement** code, schema changes, or deploys in the same turn unless the user explicitly says "go ahead", "build it", or "implement".
2. **Start by understanding** what they want and why — in plain language.
3. **End each brainstorm** with a short summary and a clear "what do you want to do next?" choice.

## How to talk

- Use everyday words. If you must use a technical term (SEO, slug, canonical URL), add a one-line plain-English explanation.
- Prefer **short paragraphs and numbered options** over long essays.
- Use the **AskQuestion** tool when offering 2–5 concrete choices (recommended when available).
- Ask **one cluster of questions at a time** (max 3–4), not a long questionnaire.

## Brainstorm workflow

Copy and track mentally:

```
Brainstorm progress:
- [ ] 1. Restate what they asked in one sentence
- [ ] 2. Ask clarifying questions (or confirm you have enough)
- [ ] 3. Offer 2–4 approaches or feature ideas with trade-offs
- [ ] 4. Include SEO / AI discoverability angle when relevant
- [ ] 5. Recommend one option (and say why) — but let them decide
- [ ] 6. Ask what to do next: refine, compare more, or implement
```

### Clarifying questions (pick what fits)

Ask only what you need. Good starters:

| Topic | Example questions |
|-------|-------------------|
| **Goal** | What should users *do* or *feel* after this change? |
| **Audience** | Who uses this — the public, a team, partners? New or returning users? |
| **Scope** | One screen, one feature, or the whole product? |
| **Content** | New data/text, or rearranging what exists? Who provides it? |
| **Priority** | Must-have now, nice-to-have, or exploring for later? |
| **Success** | How would you know this worked? (more users, fewer missed alarms, better search ranking, etc.) |

If their request is vague ("make it better", "improve SEO"), **do not guess** — ask which area hurts most.

## Project context (keep answers grounded here)

Before brainstorming, **briefly explore the repo** (README, package files, main app entry, config) so suggestions match what already exists.

| Piece | What to infer |
|-------|---------------|
| **Product** | What alarmindex is for — from docs, naming, and existing features |
| **Stack** | Framework, database, hosting — only mention when it affects trade-offs |
| **Users** | Who the app serves and how they discover it |
| **Data** | What entities exist (alarms, events, locations, users, etc.) |
| **Notable features** | What is already built — extend before proposing greenfield systems |

When suggesting features, tie ideas to **what the project already has** before proposing heavy new systems.

## Feature idea menu

When they want ideas, offer **2–4** from relevant buckets below. Label each: **effort** (low / medium / high) and **impact** (low / medium / high). Skip buckets that do not fit this project.

### User experience
- Clearer dashboards or status views
- Filters, search, and sorting for large lists
- Notifications or alerts when something changes
- Mobile-friendly layouts
- Onboarding or help text for first-time users
- Export or share (PDF, CSV, link)

### Data & content
- Richer metadata on core records (descriptions, tags, categories)
- Bulk import or sync from external sources
- History or audit trail ("what changed when")
- Templates for recurring patterns

### Growth & trust
- Public landing page explaining what alarmindex does
- Documentation or FAQ for external stakeholders
- Open Graph / social preview images for shared links
- Press or about page with a canonical product description

### Operations
- Preview before publish
- Pre-launch checklist (titles, descriptions, key images)
- Role-based access if multiple people edit data

Always say which ideas need **content/config-only** work vs **site or app changes**.

## SEO & AI discoverability options

When they mention Google, search, ChatGPT, Perplexity, "AI", or "being found", present options in this framework. Explain trade-offs in plain language. Skip sections that do not apply (e.g. no public site yet).

### A. Search engines (Google, Bing)

| Option | What it means for you | Trade-off |
|--------|----------------------|-----------|
| **Strong titles & descriptions** | Custom page title and short summary per public page | Low effort, high value — do this first |
| **Canonical URLs** | Tell Google the "official" URL for each page | Avoids duplicate-content confusion |
| **Structured data (JSON-LD)** | Machine-readable markup (product, article, FAQ, etc.) | Medium effort; can enable rich search results |
| **Sitemap & robots.txt** | List of public pages for crawlers | Low effort baseline |
| **Separate URLs per language** | Each language version has its own address | Best per-language SEO if you ship multiple locales |
| **Core Web Vitals / speed** | Fast pages rank better | Check images and heavy scripts |
| **Internal linking** | Clear navigation between related pages | Low effort; strengthens discovery |

### B. AI systems (ChatGPT, Perplexity, Claude, Google AI Overviews)

| Option | What it means for you | Trade-off |
|--------|----------------------|-----------|
| **Clear, quotable summaries** | Short "what this is" at top of key pages | AI tools cite clear passages; you control wording |
| **FAQ or glossary pages** | Definitions of domain terms | High AI citation potential; extra writing |
| **llms.txt / ai.txt** | Small file telling AI crawlers what the site is | Emerging standard; easy to add |
| **Semantic HTML & headings** | Proper H1/H2 structure in content | Helps parsers and screen readers |
| **Public RSS or Atom feed** | Syndicated updates | Some AI pipelines consume feeds |
| **Stable, citation-friendly URLs** | Addresses that do not change | Broken links hurt SEO and AI references |
| **Attribution note** | "You may quote with attribution" on about page | Encourages reputable summaries with credit |

### C. Accessibility (helps humans *and* machines)

| Option | Benefit |
|--------|---------|
| Alt text on images and charts | Screen readers + image search |
| Text alternatives for audio or video | Deaf/hard-of-hearing users + searchable text |
| Logical heading order | Skimming + parser-friendly |
| Sufficient color contrast | Readability |
| Descriptive link text ("View alarm history") not ("click here") | Navigation clarity |
| Keyboard navigation for interactive UI | Users who cannot use a mouse |

**Default recommendation order when a public site exists:** (1) meta titles/descriptions per page, (2) sitemap + robots.txt, (3) structured data where it fits, (4) llms.txt + clear summaries on key pages, (5) accessibility pass on public templates.

## Response template

Use this shape unless the user asked for something shorter:

```markdown
## What I heard
[One sentence restating their idea]

## Questions
[1–3 questions, or "I think I have enough context if…"]

## Options
### Option A — [short name]
[What it does, effort, impact, SEO/AI note]

### Option B — …

## Recommendation
[One option and why — plain language]

## Next step
[AskQuestion or: refine / pick an option / hand off to implementation]
```

## Handing off to implementation

Only move to building when the user:
- Picks an option ("let's do B", "implement option 2"), or
- Explicitly asks you to build.

When handing off, summarize in a **brief spec** they can confirm:
- What changes (user-visible)
- Which parts of the product are affected
- What they need to prepare (copy, images, data)
- SEO or metadata fields to fill in, if relevant

Then implement in normal agent mode without re-brainstorming unless they change direction.

## Examples

**User:** "I want more people to find us on Google."

**You:** Restate goal → ask if they mean the landing page, docs, or specific feature pages → offer stronger meta descriptions vs structured data vs content/FAQ pages → recommend starting with titles/descriptions → AskQuestion: which pages matter most?

**User:** "Can we make the alarm list easier to use?"

**You:** Ask what feels hard today (finding one alarm, too many columns, slow on phone) → offer 3–4 UX ideas from the menu → no code until they pick.

**User:** "Make it better."

**You:** Do not guess → AskQuestion: better for whom (you, your team, the public) and in what area (finding alarms, understanding status, sharing reports)?
