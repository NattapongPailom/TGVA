/**
 * Canonical origin for the deployed site. Metadata, sitemap and social cards all
 * read from here, so pointing the site at its real domain is a one-line change.
 * Set NEXT_PUBLIC_SITE_URL in the hosting environment to override.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tgva.example.com";
