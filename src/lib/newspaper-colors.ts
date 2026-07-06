/** Konsekvent palett per tidning — grafer, tabeller och accenter. */
export const NEWSPAPER_COLORS: Record<string, string> = {
  aftonbladet: "#be123c",
  expressen: "#7c3aed",
  gp: "#047857",
  dn: "#1d4ed8",
  svd: "#b45309",
  sydsvenskan: "#0f766e",
};

/** Ljusa bakgrunder som matchar huvudfärgen. */
export const NEWSPAPER_COLOR_SOFT: Record<string, string> = {
  aftonbladet: "#fff1f2",
  expressen: "#f5f3ff",
  gp: "#ecfdf5",
  dn: "#eff6ff",
  svd: "#fffbeb",
  sydsvenskan: "#f0fdfa",
};

export function newspaperColor(slug: string): string {
  return NEWSPAPER_COLORS[slug] ?? "#64748b";
}

export function newspaperColorSoft(slug: string): string {
  return NEWSPAPER_COLOR_SOFT[slug] ?? "#f1f5f9";
}

/** Kort etikett i grafer och kompakta listor. */
export const NEWSPAPER_SHORT: Record<string, string> = {
  aftonbladet: "AB",
  expressen: "Exp",
  gp: "GP",
  dn: "DN",
  svd: "SvD",
  sydsvenskan: "SyS",
};

export function newspaperShortLabel(slug: string, fallback?: string): string {
  return NEWSPAPER_SHORT[slug] ?? fallback ?? slug;
}
