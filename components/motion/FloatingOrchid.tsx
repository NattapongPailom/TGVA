"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * The orchid pinned to the bottom-right of the screen, on every page.
 *
 * On the home page it waits until the hero has scrolled away: the hero card
 * already carries an orchid in its own top-right corner, and on a laptop
 * screen the two would meet in the same corner on first paint. Pages with no
 * hero show it straight away.
 *
 * It never moves once shown — the design system keeps motion mechanical, and
 * a drifting flower is the ambient float it rules out. Decorative only: hidden
 * from assistive tech and transparent to clicks.
 */
export function FloatingOrchid() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden className={`tgva-orchid-pin ${shown ? "is-shown" : ""}`}>
      <Image src="/images/flower/orchid.png" alt="" width={358} height={363} />
    </div>
  );
}
