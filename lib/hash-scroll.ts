import { landingInLift } from "@/components/motion/HeroLift";

/**
 * Same-page anchors, scrolled by hand.
 *
 * Next's `<Link>` does not reliably scroll to every in-page target. From the
 * same component, at the same scroll position, `/#vision` scrolls and `/#what`
 * does nothing — and the element is not at fault: `scrollIntoView()`,
 * `location.hash` and a plain `<a href="#what">` all reach it. Rather than
 * chase the router's internals, same-page links stop depending on it and do
 * the one thing the browser has always done.
 *
 * Returns true when it handled the link, so the caller can leave anything
 * genuinely off-page to the router.
 */
export function scrollToHash(href: string): boolean {
  if (typeof window === "undefined") return false;

  const at = href.indexOf("#");
  if (at < 0) return false;

  // Only same-page links: "/#what" and "#what", never "/events#x".
  const path = href.slice(0, at);
  if (path && path !== "/" && path !== window.location.pathname) return false;

  const id = href.slice(at + 1);
  const target = id && document.getElementById(id);
  if (!target) return false;

  /*
   * No `behavior` here on purpose. The stylesheet sets `scroll-behavior: smooth`
   * on `html` and switches it to `auto` inside its reduced-motion block, so
   * leaving it unset inherits the right answer — and naming it explicitly would
   * override that block and scroll smoothly at someone who asked for no motion.
   *
   * `scroll-margin-top: 7rem` on every [id] keeps the sticky bar off the landing.
   * A target inside the hero's climbing card moves while the page scrolls, so
   * the card works out its own landing and the margin is handed to it.
   */
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const landing = landingInLift(target, margin);
  if (landing === null) target.scrollIntoView({ block: "start" });
  else window.scrollTo({ top: landing });
  window.history.pushState(null, "", `#${id}`);
  return true;
}
