import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "TGVA — Thai Airways Virtual";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social preview card. Generated at build time so it always matches the brand
 * tokens rather than drifting out of date as a hand-exported image would.
 */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/images/logo-tgva.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(145deg, #0E0326 0%, #1E0640 45%, #360A6F 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 640,
            height: 640,
            borderRadius: 640,
            background: "radial-gradient(circle, rgba(216,166,87,0.22) 0%, rgba(216,166,87,0) 70%)",
          }}
        />

        {/* The wordmark is brand purple, so it needs a light plate to read on this ground. */}
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "20px 30px",
            borderRadius: 18,
            background: "#F7F3EE",
          }}
        >
          <img src={logoSrc} alt="" width={360} height={120} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", width: 96, height: 4, background: "#D8A657" }} />
          <div
            style={{
              display: "flex",
              fontSize: 62,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              lineHeight: 1.05,
            }}
          >
            Thai Airways Virtual
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(247,243,238,0.72)" }}>
            A virtual airline community built on realism and Thai hospitality
          </div>
        </div>
      </div>
    ),
    size,
  );
}
