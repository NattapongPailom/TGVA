import { test as base, expect, type Page, type TestInfo } from "@playwright/test";

/** The two pages the site has. */
export const PAGES = ["/", "/events"] as const;

/**
 * The production CSP carries `upgrade-insecure-requests`. Chromium leaves
 * localhost alone; WebKit upgrades it too, so against the local `next start`
 * every script and stylesheet went to https://localhost and failed. Locally,
 * and in WebKit only, that one directive is taken out of the response. The rest
 * of the policy still applies, and the live check runs it in full over HTTPS.
 */
export const test = base.extend<{ localPlainHttp: void }>({
  localPlainHttp: [
    async ({ page, browserName, baseURL }, use) => {
      if (browserName === "webkit" && baseURL?.startsWith("http://localhost")) {
        await page.route("**/*", async (route) => {
          if (route.request().resourceType() !== "document") return route.fallback();
          const response = await route.fetch();
          const headers = { ...response.headers() };
          headers["content-security-policy"] = (headers["content-security-policy"] ?? "")
            .replace(/;?\s*upgrade-insecure-requests/, "");
          await route.fulfill({ response, headers });
        });
      }
      await use();
    },
    { auto: true },
  ],
});

export { expect };

/**
 * Starts listening for everything that would mean a visitor saw a broken page:
 * console errors, uncaught exceptions, Content Security Policy violations,
 * requests that failed and responses that came back as errors. Call it before
 * the first `goto`; read the returned list at the end.
 */
export async function watchForProblems(page: Page) {
  const problems: string[] = [];

  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(`CSP violation: ${event.violatedDirective} blocked ${event.blockedURI}`);
    });
  });

  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`exception: ${error.message}`));
  page.on("requestfailed", (request) => {
    const reason = request.failure()?.errorText ?? "";
    /* A browser abandons a video's range request as soon as it has the bytes it
       wants, and a navigation away cancels whatever was still loading. Neither
       is a fault. */
    if (/abort|cancel/i.test(reason)) return;
    problems.push(`request failed: ${request.url()} (${reason})`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
  });

  return problems;
}

/**
 * Waits for the loading screen to leave. It is decoration with no role or text,
 * so it is found by its class; the page itself is what the tests read.
 */
export async function waitForLoader(page: Page) {
  await expect(page.locator(".tgva-loader")).toHaveCount(0, { timeout: 10_000 });
}

/**
 * Scrolls to the foot of the page a screen at a time, so every lazy image and
 * every scroll-triggered section has been reached, then back to the top.
 */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}

export const isPhone = (testInfo: TestInfo) => testInfo.project.name.startsWith("phone");

/**
 * The key that moves focus to the next stop, links included. WebKit on a Mac
 * follows Safari's default, where Tab skips links and Option+Tab reaches them.
 * Option+Tab is a Mac convention, so everywhere else (CI's Linux) it is Tab.
 */
export const nextStop = (browserName: string) =>
  browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
