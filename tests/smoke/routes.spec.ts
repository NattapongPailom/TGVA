import { regions } from "../../content/regions";
import { expect, test, waitForLoader } from "./helpers";

const region = regions[0];
const city = region.destinations[0];

test("a route opens its detail dialog, and closing it returns focus to the city", async ({
  page,
}) => {
  await page.goto("/");
  await waitForLoader(page);
  await page.locator("#wherewefly").scrollIntoViewIfNeeded();

  /* The map pin on a wide screen, the row of region buttons on a phone: both
     carry the region's name, and whichever is showing is the one to use. */
  await page
    .getByRole("button", { name: region.title, exact: true })
    .filter({ visible: true })
    .first()
    .click();

  const row = page.getByRole("button", { name: `Route detail, Bangkok to ${city.city}` });
  await expect(row).toBeVisible();

  // From the keyboard, so every browser gives the row focus before it opens.
  await row.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: `Route detail, Bangkok to ${city.city}` });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await expect(dialog).toContainText(city.flightNumber);
  await expect(dialog).toContainText(city.flightTime);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(row).toBeFocused();
});
