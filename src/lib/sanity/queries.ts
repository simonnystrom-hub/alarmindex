import type {DailyEdition, HeadlineWithScore, Newspaper, SiteSettings, SnapshotDetail} from './types'
import {safeFetch, safeFetchOne} from './fetch'

const publishedFilter = '&& ($preview || publicationStatus == "published")'

const newspaperSlugField = `"slug": coalesce(slug.current, string::split(_id, "newspaper-")[1])`

const newspaperMatch = `(slug.current == $slug || _id == $newspaperId)`

export async function getNewspapers(): Promise<Newspaper[]> {
  return safeFetch(
    `*[_type == "newspaper" && active == true] | order(sortOrder asc) {
      _id, name, ${newspaperSlugField}, sortOrder
    }`,
  )
}

export async function getLatestPublishedDate(): Promise<string | null> {
  return safeFetchOne(
    `*[_type == "frontPageSnapshot" ${publishedFilter}] | order(date desc)[0].date`,
  )
}

export type PublishedDaySummary = {
  date: string
  newspaperCount: number
  averageScore: number
  highest: {
    name: string
    slug: string
    score: number
  }
}

export async function getPublishedDaySummaries(): Promise<PublishedDaySummary[]> {
  const rows = await safeFetch<
    Array<{
      date: string
      dailyScore: number | null
      name: string
      slug: string
    }>
  >(
    `*[_type == "frontPageSnapshot" ${publishedFilter} && defined(dailyScore)] {
      date,
      dailyScore,
      "name": newspaper->name,
      "slug": coalesce(newspaper->slug.current, string::split(newspaper._ref, "newspaper-")[1])
    } | order(date desc)`,
  )

  const byDate = new Map<
    string,
    { scores: number[]; highest: { name: string; slug: string; score: number } }
  >()

  for (const row of rows) {
    if (!row.date || row.dailyScore == null || !row.slug) continue;

    const existing = byDate.get(row.date) ?? {
      scores: [],
      highest: { name: row.name, slug: row.slug, score: row.dailyScore },
    };

    existing.scores.push(row.dailyScore);

    if (row.dailyScore > existing.highest.score) {
      existing.highest = { name: row.name, slug: row.slug, score: row.dailyScore };
    }

    byDate.set(row.date, existing);
  }

  return [...byDate.entries()]
    .map(([date, entry]) => ({
      date,
      newspaperCount: entry.scores.length,
      averageScore: Math.round(
        entry.scores.reduce((sum, score) => sum + score, 0) / entry.scores.length,
      ),
      highest: entry.highest,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function getPublishedSnapshotPaths(): Promise<Array<{ date: string; slug: string }>> {
  return safeFetch(
    `*[_type == "frontPageSnapshot" ${publishedFilter} && defined(dailyScore)] {
      date,
      "slug": coalesce(newspaper->slug.current, string::split(newspaper._ref, "newspaper-")[1])
    } | order(date desc)`,
  )
}

export async function getDailyEditions(date: string): Promise<DailyEdition[]> {
  return safeFetch(
    `*[_type == "frontPageSnapshot" && date == $date ${publishedFilter}] {
      _id,
      date,
      dailyScore,
      newspaper->{_id, name, ${newspaperSlugField}, sortOrder},
      "drivingHeadline": drivingHeadline->{
        _id,
        text,
        "displayScore": *[_type == "headlineScore" && references(^._id)][0].displayScore
      }
    } | order(dailyScore desc)`,
    {date},
  )
}

export async function getDailyEditionsWithHeadlines(date: string): Promise<DailyEdition[]> {
  return safeFetch(
    `*[_type == "frontPageSnapshot" && date == $date ${publishedFilter}] {
      _id,
      date,
      dailyScore,
      newspaper->{_id, name, ${newspaperSlugField}, sortOrder},
      "drivingHeadline": drivingHeadline->{
        _id,
        text,
        "displayScore": *[_type == "headlineScore" && references(^._id)][0].displayScore
      },
      "headlines": *[_type == "headline" && references(^._id)] {
        _id,
        text,
        aboveFoldMobile,
        "displayScore": *[_type == "headlineScore" && references(^._id)][0].displayScore
      }
    } | order(dailyScore desc)`,
    {date},
  )
}

export async function getNewspaperBySlug(slug: string): Promise<Newspaper | null> {
  return safeFetchOne(
    `*[_type == "newspaper" && ${newspaperMatch}][0]{
      _id, name, ${newspaperSlugField}, sortOrder
    }`,
    {slug, newspaperId: `newspaper-${slug}`},
  )
}

export async function getIndexHistory(days = 30): Promise<
  Array<{
    date: string;
    dailyScore: number | null;
    slug: string;
    name: string;
  }>
> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceDate = since.toISOString().slice(0, 10);

  return safeFetch(
    `*[_type == "frontPageSnapshot" ${publishedFilter} && date >= $sinceDate && defined(dailyScore)] {
      date,
      dailyScore,
      "slug": coalesce(newspaper->slug.current, string::split(newspaper._ref, "newspaper-")[1]),
      "name": newspaper->name
    } | order(date asc)`,
    { sinceDate },
  );
}

export async function getNewspaperHistory(slug: string, limit = 30): Promise<DailyEdition[]> {
  return safeFetch(
    `*[_type == "frontPageSnapshot" ${publishedFilter} && (newspaper->slug.current == $slug || newspaper._ref == $newspaperId)]
      | order(date desc)[0...$limit]{
      _id,
      date,
      dailyScore,
      newspaper->{_id, name, ${newspaperSlugField}, sortOrder},
      "drivingHeadline": drivingHeadline->{text}
    }`,
    {slug, newspaperId: `newspaper-${slug}`, limit},
  )
}

export async function getSnapshotForDate(
  slug: string,
  date: string,
): Promise<SnapshotDetail | null> {
  return safeFetchOne(
    `*[_type == "frontPageSnapshot" && date == $date ${publishedFilter} && (newspaper->slug.current == $slug || newspaper._ref == $newspaperId)][0]{
      _id,
      date,
      dailyScore,
      newspaper->{_id, name, ${newspaperSlugField}, sortOrder},
      "drivingHeadline": drivingHeadline->{_id, text},
      screenshotAboveFold,
      screenshotDesktop,
      screenshotDesktopHeight,
      screenshotExtended,
      screenshotExtendedHeight,
      "headlines": *[_type == "headline" && references(^._id)] | order(aboveFoldMobile desc) {
        _id,
        text,
        subheading,
        aboveFoldMobile,
        "score": *[_type == "headlineScore" && references(^._id)][0]{
          displayScore,
          threatIntensity,
          personalFraming,
          decontextualization,
          formalIntensity,
          emotionPrimary,
          emotionIntensity,
          reasoning,
          promptVersion,
          modelVersion
        }
      }
    }`,
    {slug, date, newspaperId: `newspaper-${slug}`},
  )
}

export async function getDayOverview(date: string): Promise<
  Array<{
    newspaper: Newspaper
    dailyScore: number | null
    topHeadline?: HeadlineWithScore
  }>
> {
  return safeFetch(
    `*[_type == "frontPageSnapshot" && date == $date ${publishedFilter}]{
      dailyScore,
      newspaper->{_id, name, ${newspaperSlugField}, sortOrder},
      "topHeadline": drivingHeadline->{
        _id,
        text,
        aboveFoldMobile,
        "score": *[_type == "headlineScore" && references(^._id)][0]{
          displayScore, reasoning
        }
      }
    } | order(dailyScore desc)`,
    {date},
  )
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return safeFetchOne<SiteSettings>(
    `*[_type == "siteSettings" && _id == "siteSettings"][0]{
      siteName,
      defaultDescription,
      siteSlogan,
      homeTitle,
      homeDescription,
      metodikTitle,
      metodikDescription,
      dagTitle,
      dagDescription
    }`,
  )
}
