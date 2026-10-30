"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * How much of the clip the card ends up covering, as a share of its height —
 * enough to bring the card's top edge across the middle of the aircraft.
 */
const COVER = 0.48;
/** The card's share of that climb. The footage sinking makes up the rest. */
const CARD_SHARE = 0.42;
/** How much scroll the whole move takes, again as a share of the clip. */
const DISTANCE = 0.6;

/** The card's lift, in whole pixels, for a clip this tall at this scroll. */
function liftAt(clipHeight: number, scrollY: number) {
  const climb = clipHeight * COVER * Math.min(1, scrollY / (clipHeight * DISTANCE));
  // Whole pixels: a fractional offset on a composited layer softens the type
  // sitting on it.
  return Math.round(climb * CARD_SHARE);
}

/**
 * Where to scroll so `target`, inside the lifting card, lands `margin` below
 * the top of the viewport — or null when it is not in the card or the card is
 * not moving.
 *
 * The browser's own anchor scroll aims at where the target is when the scroll
 * starts, but the card keeps climbing as the page travels, so it overshot by
 * the whole lift: About Us landed 55px above the viewport instead of under the
 * bar. This aims at where the target will be once the scroll has ended.
 */
export function landingInLift(target: HTMLElement, margin: number): number | null {
  const stage = target.closest<HTMLElement>("[data-hero-lift]");
  const clip = stage?.querySelector<HTMLElement>("[data-hero-clip]");
  if (!stage || !clip) return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  const height = clip.offsetHeight;
  const now = parseFloat(stage.style.getPropertyValue("--tgva-hero-lift")) || 0;
  // The scroll that would land it with no lift at all.
  const rest = target.getBoundingClientRect().top + window.scrollY + now - margin;

  // Past the end of the climb the lift is constant; before it, the lift grows
  // in step with the scroll, so the landing is the one point on that line
  // where scroll and lift together make up the rest.
  const full = height * DISTANCE;
  const top = liftAt(height, full);
  const y = rest - top >= full ? rest - top : rest / (1 + top / full);
  return Math.max(0, Math.round(y));
}

/**
 * The hero's climb, driven by the page's own scroll.
 *
 * Scrolling down draws the card up over the clip while the footage itself
 * sinks, and the two together bring the card's top edge to the middle of the
 * aircraft. Scrolling back up unwinds both in step — there is no timer here and
 * no end state, only the scroll position.
 *
 * Both halves move on `translate` alone: the layout never changes, so nothing
 * below the hero shifts as they move. Splitting the climb between the card and
 * the footage is what keeps it that way — the card alone would have to travel
 * far enough to leave a bare strip of the wrapper under it.
 *
 * Without JavaScript, or with reduced motion asked for, the hero simply rests
 * as it is composed: a complete page, just without the parallax.
 */
export function HeroLift({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    const clip = stage?.querySelector<HTMLElement>("[data-hero-clip]");
    if (!stage || !clip) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const height = clip.offsetHeight;
      const climb = height * COVER * Math.min(1, window.scrollY / (height * DISTANCE));
      stage.style.setProperty("--tgva-hero-lift", `${liftAt(height, window.scrollY)}px`);
      stage.style.setProperty("--tgva-hero-pan", `${Math.round(climb * (1 - CARD_SHARE))}px`);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className} data-hero-lift>
      {children}
    </div>
  );
}
