import { expect, test } from "./helpers";

/* What a crawler or a share card reads is the same in every browser, so these
   run once. */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Browser-independent; runs on desktop only.");
});

test("security headers are sent", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const headers = response.headers();

  const csp = headers["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("robots.txt allows crawling and names the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toMatch(/^Allow: \/$/m);
  expect(body).toMatch(/^Sitemap: https?:\/\/\S+\/sitemap\.xml$/m);
});

test("sitemap.xml lists both pages", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  /* Only the paths are compared: the origin is siteUrl, which differs between
     a local build, a preview and production. */
  const locs = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, loc]) => new URL(loc).pathname,
  );
  expect(locs.sort()).toEqual(["/", "/events"]);
});

test("the Open Graph image is declared and served", async ({ page, request }) => {
  await page.goto("/");
  const image = page.locator('meta[property="og:image"]').first();
  const content = await image.getAttribute("content");
  expect(content).toBeTruthy();

  /* The tag's origin is the site's canonical one (see lib/site-config.ts),
     which a local build does not serve from, so the path is fetched here. */
  const { pathname, search } = new URL(content!);
  const response = await request.get(pathname + search);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toBe("image/png");

  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
});
