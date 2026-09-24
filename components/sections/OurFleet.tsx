"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { arrivesFrom, makers, makerSummary, typesBy, type Maker } from "@/content/fleet";
import { AircraftSilhouette } from "@/components/sections/AircraftSilhouette";

/** Matches the slide duration in globals.css. */
const SLIDE_MS = 620;
/** How far the board must be dragged before letting go sends it home. */
const DISMISS_AT = 0.32;
/** Below this a drag is a tap, and a tap on the handle also means "go back". */
const TAP_AT = 0.004;

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
  </svg>
);

/**
 * Boeing's mark: an aircraft rotating off the strip it is still standing on.
 * The tabs already give Boeing the rotation and Airbus the taxi, so the two
 * halves are told apart by how they move before either is read.
 */
const Takeoff = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path
      className="tgva-takeoff-plane"
      d="M3.4 12.6 5.7 11.8l2.6 1.5 3.7-1.3-4.3-4 1.8-.6 5.6 2.7 3.2-1.1a1.45 1.45 0 0 1 .95 2.74l-9.7 3.5a1.7 1.7 0 0 1-1.35-.1l-4.75-2.34Z"
    />
    <path className="tgva-takeoff-strip" d="M3.6 19.1h16.8" />
  </svg>
);

export function OurFleet() {
  /** What the tabs say. */
  const [selected, setSelected] = useState<Maker | "">("");
  /** What the board is rendering — kept through the closing slide. */
  const [board, setBoard] = useState<Maker | null>(null);
  const [typeIndex, setTypeIndex] = useState(0);

  const layerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  /** Where the next board should start from, read once it has rendered. */
  const entryFrom = useRef<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /** Softens the frame for exactly as long as the board is in motion. */
  const soften = useCallback((ms: number) => {
    sectionRef.current?.classList.add("is-sliding");
    clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(
      () => sectionRef.current?.classList.remove("is-sliding"),
      ms,
    );
  }, []);

  const slideTo = (value: string) =>
    layerRef.current?.style.setProperty("--tgva-slide", value);

  /** Parks the marker over the selected tab, whatever width it happens to be. */
  const moveThumb = useCallback(() => {
    const active = tabsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!active || !thumbRef.current) return;
    thumbRef.current.style.setProperty("--tgva-thumb-x", `${active.offsetLeft}px`);
    thumbRef.current.style.setProperty("--tgva-thumb-w", `${active.offsetWidth}px`);
  }, []);

  useEffect(() => {
    moveThumb();
    window.addEventListener("resize", moveThumb);
    return () => window.removeEventListener("resize", moveThumb);
  }, [moveThumb, selected]);

  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    clearTimeout(blurTimer.current);
  }, []);

  /**
   * Park a freshly rendered board off-screen with its transition suppressed,
   * let that paint, then ask for the slide. Set in one go the browser
   * coalesces both into no movement at all.
   */
  useLayoutEffect(() => {
    const layer = layerRef.current;
    const from = entryFrom.current;
    if (!layer || from === null) return;
    entryFrom.current = null;

    layer.classList.add("is-dragging");
    slideTo(from);
    const frame = requestAnimationFrame(() => {
      layer.classList.remove("is-dragging");
      requestAnimationFrame(() => {
        soften(SLIDE_MS);
        slideTo("0%");
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [board, soften]);

  const closeBoard = useCallback(() => {
    if (!board) return;
    setSelected("");
    soften(SLIDE_MS);
    slideTo(arrivesFrom[board] === "left" ? "-100%" : "100%");
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setBoard(null), SLIDE_MS);
  }, [board, soften]);

  const openBoard = (maker: Maker) => {
    // Crossing straight over from the other maker's board reads better than
    // retreating to the split and coming back out.
    entryFrom.current = board
      ? arrivesFrom[board] === "left"
        ? "100%"
        : "-100%"
      : arrivesFrom[maker] === "left"
        ? "-100%"
        : "100%";
    clearTimeout(closeTimer.current);
    setSelected(maker);
    setBoard(maker);
    setTypeIndex(0);
  };

  /* ---------------- drag the board back ---------------- */
  const drag = useRef<{ x0: number; dx: number; width: number; dir: number } | null>(null);

  const onGripDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const layer = layerRef.current;
    if (!board || !layer) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    layer.classList.add("is-dragging");
    drag.current = {
      x0: event.clientX,
      dx: 0,
      width: layer.offsetWidth,
      dir: arrivesFrom[board] === "left" ? -1 : 1,
    };
  };

  const onGripMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = drag.current;
    if (!state) return;
    // Only the homeward direction does anything: `dir` makes that direction
    // positive, so clamping to [0, width] blocks pulling the board off its own
    // edge and stops it once it is fully clear.
    const travel = Math.max(
      0,
      Math.min(state.width, (event.clientX - state.x0) * state.dir),
    );
    state.dx = travel * state.dir;
    slideTo(`${state.dx}px`);
  };

  const onGripUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = drag.current;
    const layer = layerRef.current;
    if (!state || !layer) return;
    drag.current = null;
    layer.classList.remove("is-dragging");
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const travelled = Math.abs(state.dx) / state.width;
    if (travelled > DISMISS_AT || travelled < TAP_AT) closeBoard();
    else {
      soften(400);
      slideTo("0%");
    }
  };

  const types = board ? typesBy(board) : [];
  const aircraft = types[typeIndex] ?? types[0];

  return (
    <section
      ref={sectionRef}
      id="fleet"
      className={`tgva-fleet relative overflow-hidden bg-brand-deep bg-[radial-gradient(120%_90%_at_76%_6%,rgba(216,166,87,0.13)_0%,rgba(216,166,87,0)_58%)] px-12 py-24 text-cream ${
        board ? "has-board" : ""
      }`}
    >
      <div className="relative mx-auto max-w-[1240px]">
        <div>
          <p className="font-display text-[13px] font-bold tracking-[0.26em] text-gold">OUR FLEET</p>
          <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(2.375rem,4.6vw,3.875rem)] font-extrabold leading-[0.96] tracking-[-0.035em] text-white">
            {board ? `The ${board}` : "Every type"}
            <br />
            {board ? "fleet" : "we fly"}
          </h2>
        </div>

        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Manufacturer"
          className="tgva-fleet-tabs"
        >
          <span ref={thumbRef} className="tgva-fleet-thumb" aria-hidden />
          {(["", ...makers] as const).map((maker) => (
            <button
              key={maker || "both"}
              type="button"
              role="tab"
              aria-selected={selected === maker}
              data-maker={maker}
              onClick={() => (maker === "" ? closeBoard() : openBoard(maker))}
              className="tgva-fleet-tab"
            >
              {maker === "" ? (
                <span className="tgva-fleet-glyph tgva-fleet-pair" aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <span className="tgva-fleet-glyph" aria-hidden>
                  <AircraftSilhouette
                    length={makerSummary(maker).flagship.length}
                    height={makerSummary(maker).flagship.height}
                    label=""
                    fit
                  />
                </span>
              )}
              {maker === "" ? "ALL" : maker.toUpperCase()}
              <span className="tgva-fleet-live" aria-hidden />
            </button>
          ))}
        </div>

        <div className="tgva-fleet-stage relative mt-12">
          <div className="tgva-fleet-split">
            {makers.map((maker) => {
              const s = makerSummary(maker);
              return (
                <button
                  key={maker}
                  type="button"
                  data-maker={maker}
                  onClick={() => openBoard(maker)}
                  className="tgva-fleet-half"
                >
                  <span className="tgva-fleet-ghost" aria-hidden>
                    <AircraftSilhouette
                      length={s.flagship.length}
                      height={s.flagship.height}
                      label=""
                    />
                  </span>

                  <span className="relative block">
                    <span className="block font-display text-[clamp(1.9rem,3.4vw,3.25rem)] font-extrabold leading-[0.9] tracking-[-0.035em] text-white text-balance">
                      {maker.toUpperCase()}
                    </span>
                    <span className="mt-4.5 block font-mono text-[13px] leading-relaxed tracking-[0.04em] text-cream/50">
                      {s.names}
                    </span>
                  </span>

                  <span className="relative flex flex-wrap items-end justify-end gap-6">
                    <span className="tgva-fleet-go">
                      <span className="tgva-fleet-go-label">VIEW FLEET</span>
                      {maker === "Boeing" ? (
                        <span className="tgva-fleet-takeoff" aria-hidden>
                          <Takeoff />
                        </span>
                      ) : (
                        <span className="tgva-fleet-go-circle" aria-hidden>
                          <Arrow />
                          <Arrow />
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {board && aircraft ? (
            <div ref={layerRef} data-from={arrivesFrom[board]} className="tgva-fleet-layer">
              <button
                type="button"
                aria-label="Drag back to both manufacturers"
                onPointerDown={onGripDown}
                onPointerMove={onGripMove}
                onPointerUp={onGripUp}
                onPointerCancel={onGripUp}
                className="tgva-fleet-grip"
              >
                <svg viewBox="0 0 16 16" aria-hidden>
                  <path d="M10 3 5 8l5 5" />
                </svg>
                <span className="tgva-fleet-dots" aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
              </button>

              <div className="tgva-fleet-board">
                <div className="tgva-fleet-list">
                  {types.map((type, index) => (
                    <button
                      key={type.code}
                      type="button"
                      aria-pressed={index === typeIndex}
                      onClick={() => setTypeIndex(index)}
                      className="tgva-fleet-row"
                    >
                      <span className="font-mono text-[12px] font-semibold">{type.code}</span>
                      <span className="font-display text-[16px] font-bold">{type.name}</span>
                    </button>
                  ))}

                </div>

                <div className="tgva-fleet-panel">
                  <p className="font-display text-[11px] font-bold tracking-[0.24em] text-gold">
                    {board.toUpperCase()}
                  </p>
                  <h3 className="mt-3 font-display text-[clamp(2.3rem,5.2vw,3.9rem)] font-extrabold leading-[0.96] tracking-[-0.04em] text-white">
                    {aircraft.name}
                  </h3>
                  {/* Only worth printing where the timetable's code and the
                      type's name are not the same word. */}
                  {aircraft.code === aircraft.name ? null : (
                    <p className="mt-2.5 font-mono text-[13px] tracking-[0.14em] text-gold-deep">
                      {aircraft.code}
                    </p>
                  )}

                  <AircraftSilhouette
                    key={aircraft.code}
                    length={aircraft.length}
                    height={aircraft.height}
                    label={aircraft.name}
                    className="tgva-fleet-silo"
                  />

                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
