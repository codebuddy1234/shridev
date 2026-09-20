import { ImageResponse } from "next/og";
import { siteConfig } from "@/content/site";

/**
 * Default social sharing image.
 *
 * Generated at request time rather than shipped as a raster file, so the brand
 * colours and wording stay in sync with the design tokens. Pages that have
 * their own image (a project cover, an article cover) override this.
 */

export const alt = `${siteConfig.name} — ${siteConfig.descriptor}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#070A12",
          padding: "72px",
          position: "relative",
        }}
      >
        {/* Brand light, mirroring the hero treatment. */}
        <div
          style={{
            position: "absolute",
            top: -220,
            left: 180,
            width: 900,
            height: 640,
            background:
              "radial-gradient(circle at 50% 50%, rgba(109,93,251,0.42), rgba(7,10,18,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            right: -60,
            width: 720,
            height: 620,
            background:
              "radial-gradient(circle at 50% 50%, rgba(34,211,197,0.24), rgba(7,10,18,0) 70%)",
            display: "flex",
          }}
        />

        {/* Logo lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
            <rect
              x="1"
              y="1"
              width="30"
              height="30"
              rx="9"
              stroke="#8472fc"
              strokeWidth="1.6"
              opacity="0.6"
            />
            <path
              d="M10.5 11.5 15 16l-4.5 4.5"
              stroke="#8472fc"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M17 20.5h5" stroke="#22d3c5" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", fontSize: 40, letterSpacing: "-0.03em" }}>
            <span style={{ color: "#F8FAFC", fontWeight: 700 }}>{siteConfig.logo.strong}</span>
            <span style={{ color: "#A7B0C0", fontWeight: 400 }}>{siteConfig.logo.light}</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 68,
              lineHeight: 1.06,
              letterSpacing: "-0.035em",
              color: "#F8FAFC",
              fontWeight: 600,
            }}
          >
            <span>Build digital products.</span>
            <span style={{ color: "#6CE9DE" }}>Ship with confidence.</span>
          </div>

          <div style={{ fontSize: 27, color: "#A7B0C0", display: "flex" }}>
            {siteConfig.descriptor}
          </div>
        </div>

        {/* Capability strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {["Web", "Full-Stack", "AI & ML", "Data", "Mobile", "Cloud"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#A7B0C0",
                fontSize: 21,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
