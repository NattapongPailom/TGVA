"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { longest, makers, tallest, makerSummary, retired, typeByCode, typesBy, type Maker } from "@/content/fleet";
import { AircraftSilhouette } from "@/components/sections/AircraftSilhouette";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * A board is a maker's list or the history. History behaves exactly like a
 * maker once it is open — the same slide, the same grip, the same panel — it
 * just draws from the retired types instead.
 */
type Board = Maker | "History";

/**
 * Every board arrives from the left and is dragged back to the left, so the
 * handle sits on the right edge on all of them.
 *
 * Boeing and History used to come in from the right, which put their handle on
 * the left — directly over the type list, a 40px-wide gold bar touching the
 * rows it is easiest to misreach for. The handle has to sit opposite the way
 * the board travels, or there is no screen left to pull it through; so making
 * the handle's side uniform means making the travel uniform too. What that
 * costs is the old mapping of board-to-panel — press the right panel and the
 * board no longer flies in from the right — and that cue was never available to
 * History, which has no panel, or to anything opened from the dropdown.
 */
const SLIDE_HOME = "-100%";

/** Metres. The A330-300's length — the smallest any image on a board is drawn. */
const SMALLEST_DRAWN = typeByCode("A333")?.length ?? 0;

const boardTypes = (board: Board) => (board === "History" ? retired : typesBy(board));

/** The longest retired airframe, for the tab's glyph — the same rule makerSummary uses. */
const retiredFlagship = retired.reduce((a, b) => (b.length > a.length ? b : a));

/**
 * What the dropdown offers: the fleet we fly. History is deliberately NOT in
 * here — a reader who never opens the menu would never learn the retired types
 * exist, so it gets a control of its own next to the pill.
 */
const MENU_BOARDS = ["", ...makers] as const;

const labelFor = (board: Board | "") => (board === "" ? "ALL" : board.toUpperCase());

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

/** The mark on a switcher entry: three dots for ALL, a silhouette otherwise. */
function BoardGlyph({ board }: { board: Board | "" }) {
  if (board === "") {
    return (
      <span className="tgva-fleet-glyph tgva-fleet-pair" aria-hidden>
        <i />
        <i />
        <i />
      </span>
    );
  }
  const spec = board === "History" ? retiredFlagship : makerSummary(board).flagship;
  return (
    <span className="tgva-fleet-glyph" aria-hidden>
      <AircraftSilhouette length={spec.length} height={spec.height} label="" fit />
    </span>
  );
}

export function OurFleet() {
  /** What the tabs say. */
  const [selected, setSelected] = useState<Board | "">("");
  /** What the board is rendering — kept through the closing slide. */
  const [board, setBoard] = useState<Board | null>(null);
  const [typeIndex, setTypeIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const layerRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const historyRef = useRef<HTMLButtonElement>(null);
  const gripRef = useRef<HTMLButtonElement>(null);
  /** Where focus lands once a closing board has gone, if it was inside it. */
  const refocus = useRef<HTMLElement | null>(null);
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
    slideTo(SLIDE_HOME);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      // The grip and the rows unmount with the board, and focus inside them
      // would fall to <body>. It goes to the control that brings this board
      // back: the History toggle, or the maker's half card. That card is not
      // displayed while a board is up on a phone, so it is focused only once
      // the board has actually gone — see the effect below.
      if (layerRef.current?.contains(document.activeElement)) {
        refocus.current =
          board === "History"
            ? historyRef.current
            : (sectionRef.current?.querySelector<HTMLElement>(
                `.tgva-fleet-half[data-maker="${board}"]`,
              ) ?? null);
      }
      setBoard(null);
    }, SLIDE_MS);
  }, [board, soften]);

  useEffect(() => {
    if (board) {
      // The reverse on a phone: the split stops being displayed under a board,
      // so the half card that opened it can no longer hold focus. The grip is
      // the board's first control and its way back.
      const held = document.activeElement;
      if (held?.closest(".tgva-fleet-split") && !held.getClientRects().length) {
        gripRef.current?.focus({ preventScroll: true });
      }
      return;
    }
    refocus.current?.focus({ preventScroll: true });
    refocus.current = null;
  }, [board]);

  /**
   * Escape closes the board, the way it closes the ticket and the nav sheet.
   * Without it the board was the one opened surface on the page that a keyboard
   * could enter and not leave.
   */
  useEffect(() => {
    if (!board) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBoard();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [board, closeBoard]);

  /** A picker left open behind a click elsewhere is a picker nobody closed. */
  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (event: PointerEvent) => {
      if (!switchRef.current?.contains(event.target as Node)) setPickerOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // The menu unmounts, so focus on one of its items goes back to the pill.
      if (switchRef.current?.contains(document.activeElement)) pillRef.current?.focus();
      setPickerOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  const openBoard = (maker: Board) => {
    // One entrance, whether this replaces the split or another board: the old
    // board is never on screen at the same time, so there is nothing to cross
    // past.
    entryFrom.current = SLIDE_HOME;
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
      // Home is leftward, so a leftward pull is the positive direction.
      dir: -1,
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

  /* History is not one of the dropdown's own boards, so while it is open the
     pill has nothing of its own selected and says so by going quiet. */
  const pillBoard: Maker | "" = selected === "History" ? "" : selected;

  const types = board ? boardTypes(board) : [];
  const aircraft = types[typeIndex] ?? types[0];

  return (
    <section
      ref={sectionRef}
      id="fleet"
      className={`tgva-fleet relative overflow-hidden bg-brand-deep bg-[radial-gradient(120%_90%_at_76%_6%,rgba(216,166,87,0.13)_0%,rgba(216,166,87,0)_58%)] tgva-gutter py-24 text-cream ${
        board ? "has-board" : ""
      }`}
    >
      <div className="relative mx-auto max-w-[1240px]">
        {/* The hard `<br/>` this replaced forced a break mid-phrase at a size
            that clamps from 38px to 62px, so on a phone the second line held one
            word. `text-balance` on a 16ch measure breaks where the line wants to. */}
        <SectionHeading
          layout="stack"
          tone="cream"
          eyebrow="Our fleet"
          title={
            <span className="block max-w-[16ch]">
              {board === "History"
                ? "The fleet we retired"
                : board
                  ? `The ${board} fleet`
                  : "Every type we fly"}
            </span>
          }
        />

        {/* Two controls, not four tabs and not one menu.
            The dropdown names which of the active boards you are on. History
            stands outside it, because a retired fleet nobody knows about is a
            section that does not exist: hidden behind a closed menu it needed a
            click to be discovered, and it carries its own count so the reader
            knows there are four of them before pressing anything. */}
        <div ref={switchRef} className="tgva-fleet-switch">
          <div className="tgva-fleet-switch-group">
            <button
              ref={pillRef}
              type="button"
              aria-expanded={pickerOpen}
              aria-haspopup="true"
              aria-label={`Fleet view: ${labelFor(pillBoard)}`}
              data-maker={pillBoard}
              onClick={() => setPickerOpen((open) => !open)}
              className={`tgva-fleet-switch-pill ${board === "History" ? "is-muted" : ""}`}
            >
              <BoardGlyph board={pillBoard} />
              {labelFor(pillBoard)}
              <span className="tgva-fleet-live" aria-hidden />
              <svg className="tgva-fleet-switch-caret" viewBox="0 0 24 24" aria-hidden>
                <path d="m6 9.5 6 6 6-6" />
              </svg>
            </button>

            {pickerOpen ? (
              <div className="tgva-fleet-switch-menu" role="menu">
                {MENU_BOARDS.map((option) => (
                  <button
                    key={option || "all"}
                    type="button"
                    role="menuitem"
                    data-maker={option}
                    aria-current={pillBoard === option ? "true" : undefined}
                    onClick={() => {
                      // The item is about to unmount with the menu; the pill
                      // that opened it is where the reader goes on from.
                      pillRef.current?.focus();
                      setPickerOpen(false);
                      if (option === "") closeBoard();
                      else openBoard(option);
                    }}
                    className={`tgva-fleet-switch-item ${pillBoard === option ? "is-active" : ""}`}
                  >
                    <BoardGlyph board={option} />
                    {labelFor(option)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* A toggle, not a third menu entry: pressing it opens the retired
              board and pressing it again returns to the split it came from. */}
          <button
            ref={historyRef}
            type="button"
            aria-pressed={board === "History"}
            /* Said in words, because the count on its own runs into the label:
               "HISTORY 4" tells a screen reader nothing about what four is. */
            aria-label={`Fleet history — ${retired.length} retired types`}
            onClick={() => {
              setPickerOpen(false);
              if (board === "History") closeBoard();
              else openBoard("History");
            }}
            className="tgva-fleet-history"
          >
            <BoardGlyph board="History" />
            HISTORY
            <span className="tgva-fleet-history-count" aria-hidden>
              {retired.length}
            </span>
            <span className="tgva-fleet-live" aria-hidden />
          </button>
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
                  {/* The card wears its flagship — the type its silhouette
                      used to draw — so the image matches the panel's name. */}
                  {s.flagship.image ? (
                    <span className="tgva-fleet-ghost is-photo" aria-hidden>
                      <Image
                        src={s.flagship.image.src}
                        alt=""
                        width={s.flagship.image.width}
                        height={s.flagship.image.height}
                        sizes="(max-width: 859px) 100vw, 50vw"
                      />
                    </span>
                  ) : (
                    <span className="tgva-fleet-ghost" aria-hidden>
                      <AircraftSilhouette
                        length={s.flagship.length}
                        height={s.flagship.height}
                        label=""
                      />
                    </span>
                  )}

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
                      {/* The same control on both cards. They used to differ —
                          Airbus a mirrored arrow before the label, Boeing a
                          take-off glyph after it — which read as two different
                          buttons rather than one pattern. */}
                      <span className="tgva-fleet-go-circle" aria-hidden>
                        <Arrow />
                        <Arrow />
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {board && aircraft ? (
            <div ref={layerRef} className="tgva-fleet-layer">
              <button
                ref={gripRef}
                type="button"
                aria-label="Back to both manufacturers"
                onPointerDown={onGripDown}
                onPointerMove={onGripMove}
                onPointerUp={onGripUp}
                onPointerCancel={onGripUp}
                /* The pointer closes this by tapping or dragging it, both of
                   which resolve in onGripUp. A keyboard reaches neither, so the
                   board had no exit at all without this. */
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  closeBoard();
                }}
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
                      <span className="font-display text-[17px] font-bold">{type.name}</span>
                    </button>
                  ))}

                </div>

                <div className="tgva-fleet-panel">
                  <p className="font-display text-[11px] font-bold tracking-[0.24em] text-gold">
                    {board.toUpperCase()}
                  </p>
                  <h3 className="mt-3 font-display text-[clamp(2.375rem,5.2vw,3.875rem)] font-extrabold leading-[0.96] tracking-[-0.04em] text-white">
                    {aircraft.name}
                  </h3>
                  {/* Only worth printing where the timetable's code and the
                      type's name are not the same word. */}
                  {aircraft.code === aircraft.name ? null : (
                    <p className="mt-2.5 font-mono text-[13px] tracking-[0.14em] text-gold-deep">
                      {aircraft.code}
                    </p>
                  )}

                  {/* The frame is the silhouettes' own box — as wide as the
                      longest type and as tall as the tallest — so the board
                      keeps one height from type to type. Inside it the image
                      is sized by the type's length and lined up at the nose,
                      but never drawn smaller than the A330-300: to scale, the
                      A320 and A321 came out too small to read. */}
                  {aircraft.image ? (
                    <span
                      className="tgva-fleet-silo tgva-fleet-frame"
                      style={{ aspectRatio: `${longest * 1.03} / ${tallest}` }}
                    >
                      <Image
                        key={aircraft.code}
                        src={aircraft.image.src}
                        alt={aircraft.name}
                        width={aircraft.image.width}
                        height={aircraft.image.height}
                        sizes="(max-width: 859px) 100vw, 60vw"
                        style={{ "--tgva-scale": Math.max(aircraft.length, SMALLEST_DRAWN) / longest } as CSSProperties}
                      />
                    </span>
                  ) : (
                    <AircraftSilhouette
                      key={aircraft.code}
                      length={aircraft.length}
                      height={aircraft.height}
                      label={aircraft.name}
                      className="tgva-fleet-silo"
                    />
                  )}

                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
