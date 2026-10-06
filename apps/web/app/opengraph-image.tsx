import { ImageResponse } from "next/og";

export const alt =
  "getissues.tech AI agents find the right GitHub issues for you.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#fafafa",
        backgroundImage:
          "radial-gradient(circle at 85% 10%, rgba(16,185,129,0.20) 0%, rgba(250,250,250,0) 45%), radial-gradient(circle at 5% 95%, rgba(99,102,241,0.14) 0%, rgba(250,250,250,0) 45%)",
        color: "#09090b",
        fontFamily: "sans-serif",
      }}
    >
      {/* Top: logo + wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "#16A34A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          getissues.tech
        </div>
      </div>

      {/* Middle: headline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          <span>Find GitHub issues</span>
          <span style={{ color: "#16A34A" }}>made for you.</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#52525b",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          AI agents find the right GitHub issues for you based on your skills and interests.
        </div>
      </div>

      {/* Bottom: pills */}
      <div style={{ display: "flex", gap: 16 }}>
        {["Personalized matches", "Open source", "AI-powered discovery"].map((label) => (
          <div
            key={label}
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              border: "1.5px solid #e4e4e7",
              background: "#ffffff",
              fontSize: 24,
              color: "#3f3f46",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
