import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 4,
          backgroundColor: "#f4f1ea",
          borderRadius: 7,
          padding: "7px 8px",
          border: "2px solid #e4ddd2",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 6,
            height: 9,
            borderRadius: 2,
            backgroundColor: "#c2410c",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 6,
            height: 14,
            borderRadius: 2,
            backgroundColor: "#c2410c",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 6,
            height: 19,
            borderRadius: 2,
            backgroundColor: "#c2410c",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
