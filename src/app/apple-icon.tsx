import { ImageResponse } from "next/og";
import { NEWSPAPER_COLORS } from "@/lib/newspaper-colors";

export const size = { width: 180, height: 180 };
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

export default function AppleIcon() {
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
          borderRadius: 36,
          padding: "28px 24px 24px",
          border: "3px solid #e4ddd2",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1,
              color: "#c2410c",
              fontFamily: "Georgia, serif",
            }}
          >
            A
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#5c574f",
            }}
          >
            Alarmindex
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
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
                  height: 8,
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
        </div>
      </div>
    ),
    { ...size },
  );
}
