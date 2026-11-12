import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-config";

/* Everything is open to crawlers. The sitemap address follows siteUrl, so it
   moves to the site's own domain once NEXT_PUBLIC_SITE_URL is set. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
