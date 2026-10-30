"use client";

import { useEffect, useState } from "react";
import { LOADER_ICONS, LoaderDefs } from "@/components/motion/LoaderIcons";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useIntro } from "@/lib/intro";

/** One flip plus its rest. Must match the duration of `tgva-loader-flip`. */
const CYCLE_MS = 1400;
/** Long enough that a fast connection doesn't flash the overlay and vanish. */
const MIN_VISIBLE_MS = 300;
/**
 * Never trap the visitor if an asset stalls.
 *
 * This is deliberately tied to the scrim's JavaScript-free expiry in
 * globals.css — `tgva-loader-expire`, which starts at 4s. The two used to be
 * set independently, at 4s and 8s, and the gap between them was real: from 4.4s
 * the scrim was invisible while `gone` was still false, so the page looked
 * ready and `useScrollLock` was still holding it. Firing here at 4s makes the
 * JavaScript path finish first and leaves the CSS as the genuine no-JS
 * fallback. Move one and move the other.
 */
const TIMEOUT_MS = 4000;
/** Matches the fade-out duration in the class list below. */
const FADE_MS = 250;

/** Every icon gets one flip before handing over to the next. */
const ICON_CYCLE_MS = CYCLE_MS * LOADER_ICONS.length;

/**
 * Sits over the page until it has finished loading. How long that takes is the
 * visitor's connection, not a script: a fast one sees a single flip of the
 * orchid, a slow one sees the icons hand over one by one. Nothing here waits on
 * purpose beyond MIN_VISIBLE_MS.
 */
export function LoadingScreen() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const { claim, finish: released } = useIntro();

  useEffect(() => {
    // Said on mount, before the provider's own effect runs, so the page knows
    // something is covering it rather than resolving as if nothing were.
    claim();

    const startedAt = Date.now();
    const timers: ReturnType<typeof setTimeout>[] = [];

    const finish = () => {
      setLeaving(true);
      // Unmount on a timer rather than on transitionend: that event never fires
      // if the tab is backgrounded or motion is reduced, which would leave the
      // overlay covering the page forever.
      timers.push(
        setTimeout(() => {
          setGone(true);
          // Only now is the page actually uncovered: the scrim is unmounted and
          // the scroll lock released in the same commit.
          released();
        }, FADE_MS + 80),
      );
    };

    const settle = () =>
      timers.push(setTimeout(finish, Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt))));

    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle, { once: true });

    const failsafe = setTimeout(finish, TIMEOUT_MS);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(failsafe);
      window.removeEventListener("load", settle);
    };
  }, [claim, released]);

  useScrollLock(!gone);

  if (gone) return null;

  return (
    <div
      aria-hidden
      /* pointer-events-none throughout: the scrim is there to be looked at, and
         scrolling is what useScrollLock holds. Should the bundle never arrive,
         nothing here can block the page — and tgva-loader retires the scrim on
         a CSS timer, which is the one failsafe that does not need JavaScript. */
      className={`tgva-loader pointer-events-none fixed inset-0 z-100 grid place-items-center bg-[rgba(9,4,18,0.32)] transition-opacity duration-250 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ perspective: "700px" }}
    >
      <LoaderDefs />

      <div className="relative size-24 animate-[tgva-loader-flip_1400ms_linear_infinite] drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)]">
        {LOADER_ICONS.map(({ id, Icon }, i) => (
          <Icon
            key={id}
            className="absolute inset-0 size-full animate-[tgva-loader-icon-cycle_5600ms_linear_infinite]"
            /* Rewind each icon by its position so they take the stage in order;
               the modulo keeps the first icon's delay at zero rather than a
               whole cycle, which some browsers round differently. */
            style={{
              animationDelay: `-${
                (((LOADER_ICONS.length - i) % LOADER_ICONS.length) * ICON_CYCLE_MS) /
                LOADER_ICONS.length
              }ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
