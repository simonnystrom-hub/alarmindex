import {
  newspaperColor,
  newspaperColorSoft,
  newspaperShortLabel,
} from "@/lib/newspaper-colors";

type NewspaperSwatchProps = {
  slug: string;
  name?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
};

const dotSize = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
} as const;

export function NewspaperSwatch({
  slug,
  name,
  size = "md",
  showLabel = false,
  className = "",
}: NewspaperSwatchProps) {
  const label = name ?? newspaperShortLabel(slug);

  if (!showLabel) {
    return (
      <span
        className={`inline-block shrink-0 rounded-full ${dotSize[size]} ${className}`}
        style={{ backgroundColor: newspaperColor(slug) }}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium text-[var(--ink)] ${className}`}
      style={{ backgroundColor: newspaperColorSoft(slug) }}
    >
      <span
        className={`shrink-0 rounded-full ${dotSize[size]}`}
        style={{ backgroundColor: newspaperColor(slug) }}
        aria-hidden
      />
      {label}
    </span>
  );
}

type NewspaperLegendProps = {
  newspapers: Array<{ slug: string; name: string }>;
  highlightSlug?: string;
};

export function NewspaperLegend({ newspapers, highlightSlug }: NewspaperLegendProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {newspapers.map((paper) => {
        const active = !highlightSlug || highlightSlug === paper.slug;
        return (
          <li key={paper.slug}>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                active ? "opacity-100" : "opacity-40"
              } ${highlightSlug === paper.slug ? "border-[var(--ink-subtle)]" : "border-transparent"}`}
              style={{ backgroundColor: newspaperColorSoft(paper.slug) }}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: newspaperColor(paper.slug) }}
              />
              <span className="text-[var(--ink)]">{paper.name}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
