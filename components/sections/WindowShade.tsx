"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * The cabin window, with a shade that lifts once when the window comes into
 * view — equipment moving, the way the rest of the site moves.
 *
 * The shade is closed by this effect, never by the server, on the same terms
 * as Reveal: markup that ships with the view covered is a view nobody sees
 * until the bundle lands. A window already on screen when this runs, or a
 * reader who asks for reduced motion, gets the view with the shade up.
 *
 * The shade is clipped to the window's opening, measured off the artwork:
 * public/images/window-seat.jpg is 890×1055, and the opening sits at 170–718
 * across and 146–1016 down, a rounded oblong of 50% / 36% radii. A new
 * picture means re-measuring those four numbers in globals.css.
 */
export function WindowShade() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const box = element.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

    element.classList.add("is-closed");
    // Commit the closed state before transitions are switched on, so the
    // shade starts down rather than animating down.
    void element.offsetHeight;
    element.classList.add("is-armed");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.remove("is-closed");
        observer.disconnect();
      },
      { threshold: 0.55 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="tgva-window">
      <Image
        src="/images/window-seat.jpg"
        alt="The view from a cabin window: a TGVA winglet against a sunrise sky above the clouds."
        width={890}
        height={1055}
        sizes="(min-width: 48rem) 26rem, 72vw"
      />
      <div aria-hidden className="tgva-window-opening">
        <span className="tgva-window-shade" />
      </div>
    </div>
  );
}
