import { ImageResponse } from "next/og";

// Values mirror the dark-zone tokens in docs/design-tokens.md.
// ImageResponse renders outside the DOM, so CSS custom properties are not available.
const DARK_BG = "#1B1815";
const DARK_INK = "#EEEAE3";
const DARK_MUTED = "#A79F94";
const DARK_LINE = "rgba(238, 234, 227, 0.14)";
const ACCENT = "#E0803C";
const ACCENT_ON_DARK = "#F0A56B";

export const alt =
  "ELITE personal training: Strength, confidence, and results that last. Concept demo.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const OpengraphImage = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: DARK_BG,
          color: DARK_INK,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            ELITE
            <span style={{ color: ACCENT }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              border: `1px solid ${DARK_LINE}`,
              borderRadius: 999,
              fontSize: 22,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: DARK_MUTED,
            }}
          >
            Concept demo
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: ACCENT_ON_DARK,
              marginBottom: 28,
            }}
          >
            Elite personal training
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 80,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              maxWidth: 900,
            }}
          >
            Strength, confidence, and results that last.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 120,
            height: 8,
            backgroundColor: ACCENT,
          }}
        />
      </div>
    ),
    size,
  );

export default OpengraphImage;
