"use client";

import { useEffect, useState } from "react";

/**
 * A band a third of the way down the viewport decides which chapter the reader
 * is in. While a gap between chapters passes through it nothing intersects,
 * which leaves the last answer standing — the behaviour we want, so there is
 * no need to handle it.
 */
const BAND = { rootMargin: "-32% 0px -63% 0px" };

export type Chapter = { id: string; label: string };

export function ChapterRail({ chapters }: { chapters: readonly Chapter[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = chapters.map(({ id }) => document.getElementById(id));

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = sections.indexOf(entry.target as HTMLElement);
        if (index !== -1) setActive(index);
      }
    }, BAND);

    for (const section of sections) if (section) observer.observe(section);
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav aria-label="Sections in this chapter" className="mt-12 flex flex-col gap-3.5 md:mt-0">
      {chapters.map((chapter, index) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          data-active={index === active}
          aria-current={index === active ? "true" : undefined}
          className="tgva-step font-display text-sm font-bold tracking-[0.08em]"
        >
          {chapter.label}
        </a>
      ))}
    </nav>
  );
}
