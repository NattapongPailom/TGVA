import { PAGES, expect, scrollThrough, test, waitForLoader } from "./helpers";

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing loops and no video plays by itself", async ({ page }) => {
    await page.goto("/");
    await waitForLoader(page);
    await scrollThrough(page);

    const moving = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => {
          if (animation.playState !== "running") return false;
          const timing = animation.effect?.getComputedTiming();
          const duration = Number(timing?.duration ?? 0);
          return timing?.iterations === Infinity || duration > 1;
        })
        .map((animation) => {
          const target = (animation.effect as KeyframeEffect | null)?.target;
          const name = (animation as CSSAnimation).animationName ?? animation.constructor.name;
          return `${name} on ${target?.className || target?.tagName}`;
        }),
    );
    expect(moving).toEqual([]);

    const playing = await page
      .locator("video")
      .evaluateAll((videos) =>
        (videos as HTMLVideoElement[]).filter((video) => !video.paused).map((video) => video.src),
      );
    expect(playing).toEqual([]);
  });
});

test.describe("at 360px", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  for (const path of PAGES) {
    test(`${path} never scrolls sideways`, async ({ page }) => {
      await page.goto(path);
      await waitForLoader(page);
      await scrollThrough(page);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }
});
