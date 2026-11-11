import { events } from "../../content/events";
import { footerNote, membershipFormUrl } from "../../content/site";
import { PAGES, expect, test, waitForLoader } from "./helpers";

for (const path of PAGES) {
  test(`${path}: every join link goes to the membership form`, async ({ page }) => {
    await page.goto(path);

    /* Every link that asks the reader to join, and every link to a Google
       form, hidden ones included (the menu sheet, a closed dropdown). */
    const links = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors.map((anchor) => ({
        text: (anchor.textContent ?? "").replace(/\s+/g, " ").trim(),
        href: anchor.getAttribute("href") ?? "",
      })),
    );
    const join = links.filter(
      ({ text, href }) =>
        /join us|become a member/i.test(text) || /docs\.google\.com\/forms|forms\.gle/.test(href),
    );

    expect(join.length).toBeGreaterThan(0);
    for (const link of join) expect(link, link.text).toHaveProperty("href", membershipFormUrl);
  });

  test(`${path}: states that TGVA is not affiliated with Thai Airways`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText(footerNote)).toBeVisible();
  });
}

test("the events state matches content/events.ts", async ({ page }) => {
  await page.goto("/");
  await waitForLoader(page);

  const announcement = page.getByRole("dialog").filter({ hasText: /event/i });
  const count = page.locator(".tgva-nav-count");

  if (events.length === 0) {
    // Nothing announced: no popup, no count, and /events says so plainly.
    await page.waitForTimeout(1500);
    await expect(announcement).toHaveCount(0);
    await expect(count).toHaveCount(0);

    await page.goto("/events");
    await expect(page.getByRole("heading", { level: 1, name: "Coming soon" })).toBeVisible();
    return;
  }

  await expect(count.filter({ visible: true }).first()).toHaveText(String(events.length));

  await page.goto("/events");
  await expect(page.getByRole("heading", { level: 1, name: "Events" })).toBeVisible();
  for (const event of events) {
    await expect(page.getByRole("heading", { level: 2, name: event.title })).toBeVisible();
  }
});
