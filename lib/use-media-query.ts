"use client";

import { useEffect, useState } from "react";

/**
 * Whether a media query matches, for layout that has to change in markup
 * rather than in the stylesheet — an SVG viewBox cannot be set from CSS.
 *
 * Starts false so the server and the first client paint agree; the effect
 * corrects it on mount.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
