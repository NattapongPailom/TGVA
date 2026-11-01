/**
 * Canonical origin for the deployed site. Metadata, sitemap and social cards all
 * read from here.
 *
 * In order of precedence:
 *  1. NEXT_PUBLIC_SITE_URL, set in the hosting environment once the site has a
 *     domain of its own. This is the one to set for launch.
 *  2. On Vercel, the deployment's own address, from the system variables Vercel
 *     provides at build time: the project's production domain for a production
 *     build, otherwise the branch or deployment URL — so a preview link shared
 *     for review unfurls with a card from that preview, not from production.
 *  3. Local development.
 *
 * It used to fall back to a placeholder domain, which shipped a sitemap and
 * social-card URLs pointing at tgva.example.com whenever (1) was not set.
 */
const vercelHost =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
    : (process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL);

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelHost ? `https://${vercelHost}` : "http://localhost:3000")
).replace(/\/$/, "");
