"use client";

import { useEffect } from "react";

/**
 * Freezes page scrolling while `active` is true.
 *
 * Locks are reference-counted because more than one component can hold one at
 * the same time — the loading screen and a dialog, for instance. Without the
 * count, whichever unmounts first would restore scrolling for both, or restore
 * the *locked* value and leave the page stuck.
 *
 * The lock goes on the document element, never on `body`. Hiding the body's
 * overflow makes the body itself a scroll container, and the sticky header then
 * has nothing to stick to — it drops back to the top of the document, which is
 * why opening the mobile menu mid-page used to jump the bar out of view.
 * Clipping the document element stops the scroll and leaves the body's layout,
 * its scroll offset and every sticky element exactly where they were.
 */
let lockCount = 0;
let restoreValue = "";

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;

    if (lockCount === 0) {
      restoreValue = root.style.overflow;
      root.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) root.style.overflow = restoreValue;
    };
  }, [active]);
}
