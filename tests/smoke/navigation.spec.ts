import { expect, isPhone, nextStop, test, waitForLoader } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await waitForLoader(page);
});

test("the skip link is the first stop and moves focus to the page", async ({
  page,
  browserName,
}) => {
  await page.keyboard.press(nextStop(browserName));
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("desktop nav: the Inside TGVA menu opens and its links lead to their sections", async ({
  page,
}, testInfo) => {
  test.skip(isPhone(testInfo), "The desktop nav is replaced by the menu sheet on a phone.");

  const nav = page.getByRole("navigation", { name: "Main" });
  const inside = nav.getByRole("button", { name: "Inside TGVA" });
  await expect(inside).toHaveAttribute("aria-expanded", "false");

  await inside.focus();
  await page.keyboard.press("Enter");
  await expect(inside).toHaveAttribute("aria-expanded", "true");

  const staff = nav.getByRole("link", { name: /^Staff/ });
  await expect(staff).toBeVisible();
  await staff.click();
  await expect(page.locator("#staff")).toBeInViewport();

  await nav.getByRole("link", { name: "Our Fleet" }).click();
  await expect(page.locator("#fleet")).toBeInViewport();
});

test("mobile sheet: opens, traps focus, and Escape closes it back to the button", async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(!isPhone(testInfo), "The menu sheet only exists below the desktop breakpoint.");

  const open = page.getByRole("button", { name: "Open menu" });
  await open.click();

  const close = page.getByRole("button", { name: "Close menu" });
  await expect(close).toHaveAttribute("aria-expanded", "true");
  const sheet = page.getByRole("navigation", { name: "Menu" });
  await expect(sheet.getByRole("link", { name: "Where We Fly" })).toBeVisible();

  // Twenty presses is more than every stop in the bar and the sheet together.
  const header = page.locator("header");
  for (let press = 0; press < 20; press++) {
    await page.keyboard.press(nextStop(browserName));
    expect(await header.evaluate((root) => root.contains(document.activeElement))).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(open).toHaveAttribute("aria-expanded", "false");
  await expect(open).toBeFocused();
  await expect(sheet.getByRole("link", { name: "Where We Fly" })).toBeHidden();
});
