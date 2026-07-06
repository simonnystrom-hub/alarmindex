"use client";

import { useEffect, useState } from "react";

export function useChartAxis() {
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return {
    compact,
    minTickGap: compact ? 48 : 28,
    tickFontSize: compact ? 10 : 12,
  };
}
