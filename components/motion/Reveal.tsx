"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Stagger successive items in a group by passing an increasing index. */
  index?: number;
  className?: string;
};

/**
 * Fades and lifts its children into place the first time they scroll into view.
 *
 * The hidden state is applied by this effect, never by the server: markup that
 * ships at `opacity: 0` is markup nobody sees until the bundle lands, which on
 * a first cold visit is an empty page. Rendered plainly, the content is there
 * the moment the HTML is, and the animation is the enhancement it should be.
 *
 * Anything already on screen when this runs is left alone — hiding it now only
 * to bring it back would be a flash, and it has been read already.
 */
export function Reveal({ children, index = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const box = element.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

    element.classList.add("tgva-reveal");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add("is-in");
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ "--tgva-reveal-index": Math.min(index, 5) } as CSSProperties}
    >
      {children}
    </div>
  );
}
