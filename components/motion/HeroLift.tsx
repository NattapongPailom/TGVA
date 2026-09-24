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
      // Whole pixels: a fractional offset on a composited layer softens the
      // type sitting on it.
      stage.style.setProperty("--tgva-hero-lift", `${Math.round(climb * CARD_SHARE)}px`);
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
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
