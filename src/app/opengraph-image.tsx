import { ImageResponse } from "next/og";
import { NEWSPAPER_COLORS } from "@/lib/newspaper-colors";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/site-meta";

export const alt = `${SITE_NAME} — ${SITE_SLOGAN}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const newspaperSlugs = ["expressen", "aftonbladet", "gp", "dn", "svd", "sydsvenskan"] as const;
const barWidths: Record<(typeof newspaperSlugs)[number], string> = {
  expressen: "72%",
  aftonbladet: "58%",
  gp: "42%",
  dn: "38%",
  svd: "35%",
  sydsvenskan: "40%",
};

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#f4f1ea",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#c2410c",
            }}
          >
            {SITE_NAME}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.05,
              color: "#1a1814",
              fontFamily: "Georgia, serif",
              maxWidth: 900,
            }}
          >
            {SITE_SLOGAN}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              width: "100%",
            }}
          >
            {newspaperSlugs.map((slug) => (
              <div
                key={slug}
                style={{
                  display: "flex",
                  flex: 1,
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: "#ebe4d9",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: barWidths[slug],
                    height: "100%",
                    backgroundColor: NEWSPAPER_COLORS[slug],
                    borderRadius: 999,
                  }}
                />
              </div>
            ))}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 24,
              color: "#5c574f",
            }}
          >
            alarmindex.com
          </p>
        </div>
      </div>
    ),
    { ...size },
  );
}
