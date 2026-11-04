"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The passes' grid, and the trigger for printing them. Like Reveal, the
 * hidden state is applied here and never by the server: a grid already on
 * screen, or a reader who asks for reduced motion, simply has its passes.
 */
export function StaffGrid({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const box = grid.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

    grid.classList.add("is-armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        grid.classList.add("is-in");
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="tgva-staff-grid">
      {children}
    </div>
  );
}
