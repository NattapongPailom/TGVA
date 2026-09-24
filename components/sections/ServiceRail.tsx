"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useScrollLock } from "@/lib/use-scroll-lock";

export type Service = {
  title: string;
  /** The part of the title drawn in gold. Must be a substring of `title`. */
  emphasis?: string;
  blurb: string;
};

/**
 * What We Do, as a rail rather than a grid.
 *
 * Eight boxes side by side ask the reader to take in eight things at once; a
 * rail asks for one at a time and says how far along they are. The first card
 * is the photograph — the tail is the subject of the first service, so it
 * introduces that card rather than decorating the section — and the rest
 * alternate between an outlined card and a filled one, so two of the same
 * weight never sit next to each other.
 *
 * Position comes from the scroll container, never from React state: the rail is
 * a native scroll-snap surface, so a drag, a swipe, a trackpad and the arrow
 * keys all move it without anything here being told. The buttons only nudge it.
 */
export function ServiceRail({
  heading,
  lead,
  intro,
  items,
}: {
  heading: ReactNode;
  lead: string;
  intro: string;
  items: Service[];
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const [at, setAt] = useState(0);
  const [ends, setEnds] = useState({ start: true, end: false });
  const [sheetOpen, setSheetOpen] = useState(false);

  /* A native dialog does not reliably stop the page behind it from scrolling. */
  useScrollLock(sheetOpen);

  /** The distance from one card's left edge to the next, gap included. */
  const step = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return 0;
    const [first, second] = Array.from(rail.children) as HTMLElement[];
    if (!first) return 0;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  }, []);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const width = step();
    setAt(width ? Math.min(items.length - 1, Math.max(0, Math.round(rail.scrollLeft / width))) : 0);
    setEnds({
      start: rail.scrollLeft <= 2,
      end: rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2,
    });
  }, [items.length, step]);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const go = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: direction * step(), behavior: smooth ? "smooth" : "auto" });
  };

  const openSheet = () => {
    sheetRef.current?.showModal();
    setSheetOpen(true);
  };

  const closeSheet = () => {
    sheetRef.current?.close();
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const [first, ...rest] = items;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        {heading}
        <button type="button" className="tgva-showall" onClick={openSheet}>
          <GridIcon />
          SHOW ALL
        </button>
      </div>

      {/* One line, at the full measure. `text-balance` is what used to break it
          into three: balancing a single line has nothing to balance. */}
      <p className="mt-7 font-display text-[clamp(1.25rem,2.6vw,2rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-nowrap text-brand max-[46rem]:text-balance">
        {lead}
      </p>

      <p className="mt-4 text-[16px] leading-relaxed text-ink-soft text-pretty">{intro}</p>

      <div
        ref={railRef}
        onScroll={sync}
        tabIndex={0}
        aria-label="What we do"
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          go(event.key === "ArrowRight" ? 1 : -1);
        }}
        className="tgva-rail mt-9"
      >
        {first ? (
          <article className="tgva-slide is-photo">
            <Image
              src="/images/fleet-apron.jpg"
              alt="A Thai Airways Virtual aircraft tail carrying the orchid mark, against a clear sky."
              fill
              sizes="(max-width: 62rem) 86vw, 640px"
              className="tgva-slide-photo"
            />
            <div className="tgva-slide-copy">
              <h4>
                <ServiceTitle title={first.title} emphasis={first.emphasis} tone="text-gold" />
              </h4>
              <p>{first.blurb}</p>
            </div>
          </article>
        ) : null}

        {rest.map((service, i) => (
          <article
            key={service.title}
            className={`tgva-slide ${i % 2 === 0 ? "is-air" : "is-solid"}`}
          >
            <h4>
              <ServiceTitle
                title={service.title}
                emphasis={service.emphasis}
                tone="text-gold-deep"
              />
            </h4>
            <p>{service.blurb}</p>
          </article>
        ))}
      </div>

      <div className="tgva-transport">
        <button type="button" onClick={() => go(-1)} disabled={ends.start}>
          <Chevron direction="left" />
          PREV
        </button>
        <p aria-live="polite">
          {pad(at + 1)} / {pad(items.length)}
        </p>
        <button type="button" onClick={() => go(1)} disabled={ends.end}>
          NEXT
          <Chevron direction="right" />
        </button>
      </div>

      {/* A rail is good for browsing and bad for reading. This is the reading
          view: every service at once, at a size meant for it. */}
      <dialog
        ref={sheetRef}
        className="tgva-allsheet"
        aria-labelledby="tgva-allsheet-title"
        onClose={() => setSheetOpen(false)}
        onClick={(event) => {
          if (event.target === sheetRef.current) closeSheet();
        }}
      >
        <div className="tgva-allsheet-head">
          <h5 id="tgva-allsheet-title">Everything we do</h5>
          <button type="button" onClick={closeSheet} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="tgva-allsheet-body">
          {items.map((service) => (
            <article key={service.title}>
              <h6>
                <ServiceTitle
                  title={service.title}
                  emphasis={service.emphasis}
                  tone="text-gold-deep"
                />
              </h6>
              <p>{service.blurb}</p>
            </article>
          ))}
        </div>
      </dialog>
    </>
  );
}

/**
 * Draws the part of a service title it is actually about in gold, and the rest
 * plainly. `emphasis` is a substring of `title`, so the copy stays one string in
 * content/site.ts; a title that no longer contains its emphasis renders whole.
 */
export function ServiceTitle({
  title,
  emphasis,
  tone,
}: {
  title: string;
  emphasis?: string;
  tone: string;
}) {
  const at = emphasis ? title.indexOf(emphasis) : -1;
  if (at < 0 || !emphasis) return <>{title}</>;

  return (
    <>
      {title.slice(0, at)}
      <span className={tone}>{emphasis}</span>
      {title.slice(at + emphasis.length)}
    </>
  );
}

const Chevron = ({ direction }: { direction: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d={direction === "left" ? "M15 5 8 12l7 7" : "m9 5 7 7-7 7"} />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
