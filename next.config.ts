import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

/**
 * Vercel preview deployments carry the Vercel toolbar, which is how reviewers
 * leave comments on a preview. It loads from these origins; a production build
 * does not need them, so they are allowed on previews only.
 */
const toolbar = process.env.VERCEL_ENV === "preview";

/**
 * The site loads nothing from anywhere else — fonts are self-hosted by
 * next/font, every image and video is in /public, and Discord, Instagram and
 * the membership form are only ever links — so everything is pinned to 'self'.
 *
 * Scripts and styles still need 'unsafe-inline': the pages are static, and a
 * static page cannot carry the per-request nonce that would replace it. What
 * the policy still guarantees is that no script or style can load from another
 * origin, nothing can frame the site, and no plugin or base-URL trick applies.
 */
const csp = [
  ["default-src", "'self'"],
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    ...(dev ? ["'unsafe-eval'"] : []),
    ...(toolbar ? ["https://vercel.live"] : []),
  ],
  ["style-src", "'self'", "'unsafe-inline'", ...(toolbar ? ["https://vercel.live"] : [])],
  [
    "img-src",
    "'self'",
    "data:",
    "blob:",
    ...(toolbar ? ["https://vercel.live", "https://vercel.com"] : []),
  ],
  ["font-src", "'self'", "data:", ...(toolbar ? ["https://vercel.live", "https://assets.vercel.com"] : [])],
  ["media-src", "'self'"],
  [
    "connect-src",
    "'self'",
    ...(dev ? ["ws:"] : []),
    ...(toolbar ? ["https://vercel.live", "wss://ws-us3.pusher.com"] : []),
  ],
  ["frame-src", ...(toolbar ? ["https://vercel.live"] : ["'none'"])],
  ["object-src", "'none'"],
  ["base-uri", "'self'"],
  ["form-action", "'self'"],
  ["frame-ancestors", "'none'"],
  ...(dev ? [] : [["upgrade-insecure-requests"]]),
]
  .map((directive) => directive.join(" "))
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Two years. No `preload`: that is a commitment for the final domain, to
  // make once it is chosen.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Older browsers that do not read frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/**
 * Files in /public are served with `max-age=0` by default, so a returning
 * visitor re-checks every image and the hero videos on every visit. They are
 * not fingerprinted — an image is replaced under its own name — so they are
 * cached for a day and refreshed in the background for a week after that,
 * rather than marked immutable.
 */
const publicAssetCache = {
  key: "Cache-Control",
  value: "public, max-age=86400, stale-while-revalidate=604800",
};

const nextConfig: NextConfig = {
  // Hide the on-screen dev tools badge. Compile and runtime errors still surface.
  devIndicators: false,
  // No reason to tell every response's reader which framework built it.
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/images/:path*", headers: [publicAssetCache] },
      { source: "/video/:path*", headers: [publicAssetCache] },
    ];
  },
};

export default nextConfig;
