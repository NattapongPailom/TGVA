import { PAGES, expect, scrollThrough, test, waitForLoader, watchForProblems } from "./helpers";

for (const path of PAGES) {
  test(`${path} loads with no errors, CSP violations or failed requests`, async ({ page }) => {
    const problems = await watchForProblems(page);

    await page.goto(path);
    await waitForLoader(page);
    await scrollThrough(page);
    await page.waitForLoadState("networkidle");

    expect(problems).toEqual([]);
  });
}

test("the loading screen clears and every image loads", async ({ page, request }) => {
  await page.goto("/");
  await waitForLoader(page);

  // The scroll lock the loader holds is released with it.
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");

  await scrollThrough(page);

  const images = await page.locator("img").evaluateAll((elements) =>
    (elements as HTMLImageElement[]).map((image) => ({
      src: image.currentSrc || image.src,
      // `complete` with no pixels is an image the browser gave up on.
      failed: image.complete && image.naturalWidth === 0,
    })),
  );
  expect(images.filter((image) => image.failed).map((image) => image.src)).toEqual([]);

  /* A lazy image the page has not brought on screen yet — the partner strip
     scrolls sideways, a breakpoint hides some — is never started, so each
     source is also fetched here rather than waited for. */
  const sources = [...new Set(images.map((image) => image.src).filter(Boolean))];
  expect(sources.length).toBeGreaterThan(0);
  for (const src of sources) {
    const response = await request.get(src);
    expect(response.ok(), src).toBe(true);
    expect(response.headers()["content-type"], src).toMatch(/^image\//);
  }
});
