export type Newspaper = {
  _id: string
  name: string
  slug: string
  sortOrder: number
}

export type DailyEdition = {
  _id: string
  date: string
  dailyScore: number | null
  newspaper: Newspaper
  drivingHeadline?: {
    text: string
    displayScore?: number
  } | null
}

export type HeadlineWithScore = {
  _id: string
  text: string
  subheading?: string
  aboveFoldMobile: boolean
  score?: {
    displayScore: number
    threatIntensity: number
    personalFraming: number
    decontextualization: number
    formalIntensity: number
    emotionPrimary: string
    emotionIntensity: number
    reasoning?: string
    promptVersion?: string
    modelVersion?: string
  } | null
}

export type SanityImage = {
  asset?: {_ref?: string}
  alt?: string
}

export type SnapshotDetail = {
  _id: string
  date: string
  dailyScore: number | null
  newspaper: Newspaper
  drivingHeadline?: {_id: string; text: string} | null
  screenshotAboveFold?: SanityImage | null
  screenshotDesktop?: SanityImage | null
  screenshotDesktopHeight?: number | null
  screenshotExtended?: SanityImage | null
  screenshotExtendedHeight?: number | null
  headlines: HeadlineWithScore[]
}
