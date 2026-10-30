"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * The stylesheet's `prefers-reduced-motion` block cuts every CSS animation and
 * transition to 0.01ms, but it cannot reach SMIL: an `<animateMotion>` keeps
 * running at full speed with `repeatCount="indefinite"` whatever the media
 * query says. Anything driven by SMIL has to ask for itself, which is what this
 * is for.
 *
 * Starts false so the server and the first client paint agree; the effect
 * corrects it before anything is animated long enough to be noticed.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const sync = () => setReduced(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}
