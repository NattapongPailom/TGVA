"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * A decorative clip that plays itself. It is `aria-hidden` and carries no
 * audio, so there is nothing to caption and nothing to announce — but it is
 * still moving content that runs longer than five seconds with no control to
 * stop it, which a reader who asked for reduced motion did not agree to.
 *
 * Under that preference the clip holds on its poster frame instead. The poster
 * is the same image, so the composition is unchanged; only the motion goes.
 */
export function AmbientVideo({
  src,
  poster,
  className = "",
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (reducedMotion) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    // Autoplay can be refused (a data saver, a battery mode). The poster stays
    // up if it is, which is the same picture — so there is nothing to recover.
    void video.play().catch(() => {});
  }, [reducedMotion]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay={!reducedMotion}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      className={className}
    />
  );
}
