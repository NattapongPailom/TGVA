"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const TICK_MS = 70;

/**
 * A word set as departure-board flaps. The first time it scrolls into view
 * each flap runs through letters and lands, left to right — the same board
 * the closing block's figures are printed on.
 *
 * Rendered settled, so the word is there before the script is, and a reader
 * who asks for reduced motion only ever sees it settled. The heading's
 * accessible name is the word itself; the flaps are hidden from assistive
 * tech so a screen reader never spells out the shuffle.
 */
export function StaffFlapWord({ word, label }: { word: string; label: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [tick, setTick] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let t = 0;
        setTick(0);
        timer = window.setInterval(() => {
          t += 1;
          setTick(t);
          if (t > 8 + word.length * 3) window.clearInterval(timer);
        }, TICK_MS);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [word]);

  return (
    <h3 ref={ref} id="staff-heading" aria-label={label} className="tgva-flaps">
      {word.split("").map((character, i) => {
        const settled = tick === null || tick >= 8 + i * 3;
        const shown = settled ? character : GLYPHS[(tick * 7 + i * 11) % GLYPHS.length];
        return (
          <span
            key={i}
            aria-hidden
            className={`tgva-flap-tile${settled ? "" : " is-turning"}${settled && i === 0 ? " is-gold" : ""}`}
          >
            <span key={shown}>{shown}</span>
          </span>
        );
      })}
    </h3>
  );
}
