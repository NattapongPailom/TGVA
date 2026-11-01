"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { partners } from "@/content/partners";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const pad = (value: number) => String(value).padStart(2, "0");

const Arrow = ({ back = false }: { back?: boolean }) => (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d={back ? "M13.5 8h-11M7 3.5 2.5 8 7 12.5" : "M2.5 8h11M9 3.5 13.5 8 9 12.5"} />
  </svg>
);

/**
 * The airlines TGVA flies alongside, as a strip under the route map.
 *
 * It belongs to the map rather than standing as a section of its own: the map
 * says where TGVA goes, this says who it goes there with. So it carries a
 * label, not a heading of its own weight.
 *
 * On a wide screen it is a rail: scrolled, swiped, dragged with a mouse or
 * stepped a screenful at a time with the arrows. On a phone two airlines share
 * the view, and "View all" lays the whole list out as a grid in place.
 */
export function PartnerFleet() {
  const railRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const reduced = usePrefersReducedMotion();

  const [view, setView] = useState({ from: 1, to: 5, fill: 0.3, atStart: true, atEnd: false });
  const [dragging, setDragging] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const measure = useCallback(() => {
    const rail = railRef.current;
    const cell = rail?.firstElementChild?.getBoundingClientRect().width;
    if (!rail || !cell) return;
    const left = rail.scrollLeft;
    const max = rail.scrollWidth - rail.clientWidth;
    const from = Math.min(partners.length, Math.round(left / cell) + 1);
    const to = Math.min(partners.length, Math.floor((left + rail.clientWidth) / cell + 0.02));
    setView({
      from,
      to: Math.max(from, to),
      fill: max > 0 ? (left + rail.clientWidth) / rail.scrollWidth : 1,
      atStart: left <= 2,
      atEnd: left >= max - 2,
    });
  }, []);

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(measure);
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [measure]);

  /** A step is the whole cells in view, so the next set lands flush. */
  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    const cell = rail?.firstElementChild?.getBoundingClientRect().width;
    if (!rail || !cell) return;
    const whole = Math.max(1, Math.floor(rail.clientWidth / cell));
    rail.scrollBy({ left: direction * whole * cell, behavior: reduced ? "auto" : "smooth" });
  };

  /* Mouse only: touch and trackpads already scroll the rail natively, and
     taking over their pointer would fight the page's own vertical scroll. */
  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !railRef.current) return;
    drag.current = { x: event.clientX, left: railRef.current.scrollLeft, moved: false };
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    const state = drag.current;
    const rail = railRef.current;
    if (!state || !rail) return;
    const dx = event.clientX - state.x;
    if (!state.moved && Math.abs(dx) > 4) {
      state.moved = true;
      setDragging(true);
    }
    if (state.moved) rail.scrollLeft = state.left - dx;
  };

  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
  };

  const toggleAll = () => {
    const next = !showAll;
    setShowAll(next);
    /* Folding a long grid back up would leave the reader far below the strip,
       looking at whatever comes after it. */
    if (!next) {
      rootRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
  };

  return (
    <div
      ref={rootRef}
      role="region"
      aria-labelledby="partner-fleet-title"
      className={`tgva-partners${showAll ? " is-all" : ""}`}
    >
      <div className="tgva-partners-bar">
        <h3 id="partner-fleet-title" className="tgva-partners-title">
          Partner Fleet
          <span>{partners.length} airlines</span>
        </h3>

        <div className="tgva-partners-track" aria-hidden>
          <i style={{ width: `${(view.fill * 100).toFixed(2)}%` }} />
        </div>

        <p className="tgva-partners-count" aria-hidden>
          <b>
            {pad(view.from)}–{pad(view.to)}
          </b>{" "}
          / {pad(partners.length)}
        </p>

        <div className="tgva-partners-arrows">
          <button
            type="button"
            aria-label="Scroll partners back"
            onClick={() => step(-1)}
            disabled={view.atStart}
            className="tgva-partners-arrow"
          >
            <Arrow back />
          </button>
          <button
            type="button"
            aria-label="Scroll partners forward"
            onClick={() => step(1)}
            disabled={view.atEnd}
            className="tgva-partners-arrow"
          >
            <Arrow />
          </button>
        </div>
      </div>

      <ul
        ref={railRef}
        id="partner-fleet-list"
        /* A scrolling region a keyboard cannot reach is one it cannot scroll. */
        tabIndex={0}
        aria-label="Partner airlines, scroll sideways for more"
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className={`tgva-partners-rail${dragging ? " is-drag" : ""}`}
      >
        {partners.map((partner) => (
          <li key={partner.name} className="tgva-partner">
            <span className="tgva-partner-logo">
              {/* Sized by area, not height: a square mark and a long wordmark
                  then carry the same weight. The stylesheet multiplies its
                  per-breakpoint scale by this factor. */}
              <Image
                src={partner.logo.src}
                alt=""
                width={partner.logo.width}
                height={partner.logo.height}
                sizes="(max-width: 859px) 45vw, 260px"
                draggable={false}
                style={
                  {
                    "--pf-f": (1 / Math.sqrt(partner.logo.width / partner.logo.height)).toFixed(4),
                  } as CSSProperties
                }
              />
            </span>
            <span className="tgva-partner-name">{partner.name}</span>
            {partner.alliance === "Star Alliance" ? (
              <span className="tgva-partner-badge is-star">
                <Image src="/images/partners/star-alliance-mark.png" alt="" width={297} height={283} />
                Star Alliance
              </span>
            ) : (
              <span className="tgva-partner-badge">{partner.alliance ?? "Partner"}</span>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-expanded={showAll}
        aria-controls="partner-fleet-list"
        onClick={toggleAll}
        className="tgva-partners-all"
      >
        {showAll ? "Show less" : `View all ${partners.length} partners`}
        <Arrow />
      </button>
    </div>
  );
}
