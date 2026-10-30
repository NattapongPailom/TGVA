"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export type Figure = {
  value: string;
  label: string;
  side: "l" | "r";
  low?: boolean;
};

/** Digits 0-9 three times over, so every column travels the same twelve cells. */
const STRIP = Array.from({ length: 30 }, (_, i) => i % 10);

/**
 * The aircraft, the horizon it stands on, and the figures that measure it.
 *
 * Client because three things here need the browser: the arrival fires when the
 * block comes into view, the figures roll like a departure board, and the two
 * layers drift against each other on scroll.
 *
 * It renders finished. Nothing is parked at `opacity: 0` in server markup — a
 * cold visit gets the whole composition the moment the HTML lands, and the
 * waiting state is applied from an effect afterwards, the same bargain
 * Reveal.tsx makes.
 *
 * Both state classes are set on the node rather than through React, and for the
 * same reason Reveal does it: React owning `className` here caused two separate
 * faults. Swapping `is-waiting` for `is-arriving` across a render meant a frame
 * where the element had neither and painted at rest, so the arrival played as a
 * flash and then a replay; and a re-render for any other reason could drop a
 * class React had never been told about. Here the swap is one synchronous step
 * and the cleanup always clears up after itself.
 */
export function ApproachStage({ figures }: { figures: Figure[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  /* ---- the arrival, once, when the block is reached ---- */
  useEffect(() => {
    const node = stage.current;
    if (!node) return;

    const clear = () => node.classList.remove("is-waiting", "is-arriving");

    // The preference can resolve true after the first commit, by which point
    // this effect may already have hidden everything. Clearing on the way in
    // as well as out is what stops the block being left invisible for good.
    if (reducedMotion) {
      clear();
      return;
    }

    // Already on screen at mount means it has been seen; animating it now would
    // be a flash, not an arrival.
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

    node.classList.add("is-waiting");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // One step, no render in between: the element is never left unclassed.
        node.classList.replace("is-waiting", "is-arriving");
        observer.disconnect();
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      node.classList.remove("is-waiting");
    };
  }, [reducedMotion]);

  /* ---- parallax ----
     The aircraft and the horizon move as one layer, because the wing line is
     locked to the horizon at a measured 43.3% and drifting them apart would
     break the one alignment this whole block is built on. Only the figures
     counter-drift, which is what reads as depth. */
  useEffect(() => {
    const node = stage.current;
    if (!node) return;

    if (reducedMotion) {
      node.style.removeProperty("--approach-shift");
      node.style.removeProperty("--approach-counter");
      return;
    }

    let frame = 0;
    const place = () => {
      frame = 0;
      const box = node.getBoundingClientRect();
      // -1 while the block is still below the fold, +1 once it has gone past.
      const travel = (window.innerHeight / 2 - (box.top + box.height / 2)) / window.innerHeight;
      const clamped = Math.max(-1, Math.min(1, travel));
      node.style.setProperty("--approach-shift", `${(clamped * 14).toFixed(2)}px`);
      node.style.setProperty("--approach-counter", `${(clamped * -10).toFixed(2)}px`);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(place);
    };

    place();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      node.style.removeProperty("--approach-shift");
      node.style.removeProperty("--approach-counter");
    };
  }, [reducedMotion]);

  return (
    <div ref={stage} className="tgva-approach-stage">
      <div className="tgva-approach-layer">
        <span className="tgva-approach-light" aria-hidden />

        <div className="tgva-approach-frame">
          <Image
            src="/images/approach-aircraft.png"
            alt="An airliner seen nose-on with its landing gear down, wings spanning the full width of the block."
            fill
            sizes="(max-width: 60rem) 92vw, 1120px"
            className="tgva-approach-plane"
          />
          {/* Three contact patches under the wheels and one diffuse pool under
              the belly, at the 92% where the gear actually meets the line. A
              single drop-shadow under the whole silhouette read as floating. */}
          <span className="tgva-approach-contact" aria-hidden />
        </div>

        {/* The ticks land on the wingtips exactly: at the wing line the span
            reaches both edges of the picture, and the layer is the picture. */}
        <span className="tgva-approach-horizon" aria-hidden />
      </div>

      {/* A real box, not `display: contents`, because the counter-drift has to
          live somewhere. It cannot live on the figures themselves: their
          arrival animates `translate` with a `both` fill, so the animation's
          final value would override the parallax from then on. */}
      <div className="tgva-approach-figures">
        {figures.map((figure, i) => (
          <p
            key={figure.label}
            className={`tgva-approach-stat is-${figure.side}${figure.low ? " is-low" : ""}`}
            style={{ "--i": i } as CSSProperties}
          >
            <Flap value={figure.value} />
            {figure.label}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * A split-flap counter. The timetable sets its figures in mono because that is
 * how a timetable sets them; this is the same idea given a mechanism.
 *
 * Every column travels exactly twelve cells whatever digit it lands on, so one
 * fixed `steps(12)` keeps each flip landing square on a digit. Varying the
 * distance instead of the step count is what avoids half-flipped glyphs.
 *
 * It rests on the answer. The roll's `backwards` fill shows a wrong digit for
 * the length of its delay, which is only safe because the figure holding it is
 * still at zero opacity until the same moment.
 */
function Flap({ value }: { value: string }) {
  return (
    <b className="tgva-flap">
      <span aria-hidden className="tgva-flap-reel">
        {value.split("").map((digit, column) => (
          <span
            key={column}
            className="tgva-flap-column"
            /* `--i` is inherited from the figure this sits in, so each reel
               starts rolling exactly as its own figure begins to appear rather
               than on a counter running across all four. */
            style={{ "--d": Number(digit), "--col": column } as CSSProperties}
          >
            {/* The column is the aperture — one cell tall, clipped. The strip
                inside it is what moves. Putting the travel on the column itself
                slides the aperture instead of the digits, which carries the
                whole thing out of the block. */}
            <span className="tgva-flap-strip">
              {STRIP.map((n, cell) => (
                <i key={cell}>{n}</i>
              ))}
            </span>
          </span>
        ))}
      </span>
      <span className="sr-only">{value}</span>
    </b>
  );
}
