"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MAP_VIEWBOX, landDots, project, greatCirclePath, PLANE_GLYPH } from "@/lib/world-map";
import {
  regions,
  regionsById,
  hub,
  countriesOf,
  type Destination,
  type Region,
  type RegionId,
} from "@/content/regions";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { RouteDetailDialog } from "@/components/sections/RouteDetailDialog";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { CloseMark } from "@/components/ui/CloseMark";

/** However many spokes a region has, the whole fan finishes drawing in this long. */
const FAN_DRAW_MS = 700;

/**
 * Drawn rather than set as ⌕, which is missing from enough fonts to render as a
 * box. The dismiss mark beside it is shared — see components/ui/CloseMark.
 */
function SearchMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 14"
      className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-mute"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
    >
      <circle cx="6" cy="6" r="4" />
      <path d="m9.2 9.2 3 3" />
    </svg>
  );
}

type View = { x: number; y: number; width: number; height: number };

const WORLD_VIEW: View = { x: 0, y: 0, ...MAP_VIEWBOX };

/**
 * The phone's frame: the network only, from the Atlantic to the Coral Sea and
 * 68°N to 48°S. Every destination falls inside it with room for the labels, and
 * dropping the empty Americas and Pacific roughly doubles the scale — on a 412px
 * screen the whole world was 171px tall and DOMESTIC and ASIA sat 15px apart.
 */
const NETWORK_VIEW: View = (() => {
  const [x0, y0] = project(-25, 68);
  const [x1, y1] = project(162, -48);
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
})();

/**
 * How long the pointer has to rest on another pin before the open card swaps
 * to it. Long enough that crossing a pin on the way to the card is ignored,
 * short enough that pointing at one on purpose still feels immediate.
 */
const HOVER_INTENT_MS = 180;

/** Same breakpoint the stylesheet drops the card into flow at. */
const PHONE = "(max-width: 46rem)";

/** Marker position as a percentage of the map box, so cards scale with it. */
function percentOf(lon: number, lat: number, view: View = WORLD_VIEW) {
  const [x, y] = project(lon, lat);
  return {
    left: ((x - view.x) / view.width) * 100,
    top: ((y - view.y) / view.height) * 100,
  };
}

export function WhereWeFly() {
  const [activeId, setActiveId] = useState<RegionId | null>(null);
  const [focusedCode, setFocusedCode] = useState<string | null>(null);
  const [openRoute, setOpenRoute] = useState<Destination | null>(null);
  /** True while the open card owes its focus back to the pin that opened it. */
  const [handOff, setHandOff] = useState(false);
  /** Once a region has been opened the reader has found the map works. */
  const [explored, setExplored] = useState(false);
  const planeMotion = useRef<SVGAnimateMotionElement>(null);
  const pinRefs = useRef<Partial<Record<RegionId, HTMLButtonElement | null>>>({});
  /** The pin or chip a keyboard opened the card from, owed focus when it closes. */
  const returnTo = useRef<HTMLElement | null>(null);
  const hoverTimer = useRef(0);
  const reducedMotion = usePrefersReducedMotion();
  const phone = useMediaQuery(PHONE);
  const view = phone ? NETWORK_VIEW : WORLD_VIEW;

  const active = activeId ? regionsById[activeId] : null;

  /**
   * A focused city belongs to the card it was hovered in. Moving the pointer
   * straight from one region's card to another region's pin leaves the old code
   * in state, and reading it raw would mute every spoke of the new fan (nothing
   * matches) and bind the plane to a track that no longer exists. Deriving it
   * against the active region makes that state unrepresentable.
   */
  const focused = active?.destinations.some((d) => d.code === focusedCode) ? focusedCode : null;

  /** Trunk arcs are cheap to keep around; a region's fan is only drawn on demand. */
  const trunks = useMemo(
    () =>
      regions
        .filter((region) => region.id !== "1")
        .map((region) => ({ id: region.id, d: greatCirclePath(hub, region.pin) })),
    [],
  );

  const spokes = useMemo(
    () =>
      (active?.destinations ?? []).map((city) => ({
        city,
        d: greatCirclePath(hub, city),
        point: project(city.lon, city.lat),
      })),
    [active],
  );

  const flyingCode = focused ?? active?.destinations[0].code;

  // SMIL only picks up a new path when the animation is restarted.
  useEffect(() => {
    if (flyingCode) planeMotion.current?.beginElement();
  }, [flyingCode]);

  /**
   * Opening used to happen on `focus`, which made the map a trap: the card
   * renders after the `<svg>`, so tabbing towards it passed through every
   * remaining pin and each one swapped the card out. Only the last region was
   * ever reachable. Focus now does nothing but draw the ring; the pointer opens
   * on hover and the keyboard opens on Enter, and a keyboard open sends focus
   * into the card so the destinations are the next thing reached.
   */
  const open = useCallback((id: RegionId, opener: HTMLElement | null) => {
    window.clearTimeout(hoverTimer.current);
    returnTo.current = opener;
    setActiveId(id);
    setHandOff(opener !== null);
    setExplored(true);
  }, []);

  const close = useCallback(() => {
    window.clearTimeout(hoverTimer.current);
    // Give focus back to the control the card was opened from, not to the top
    // of the page. A card the mouse opened has no opener, but if the keyboard
    // has since gone into it, focus would still fall to <body> as it unmounts —
    // so it goes to the region's own pin instead.
    const inCard = document.activeElement?.closest(".tgva-region-card");
    const target = returnTo.current ?? (inCard && activeId ? pinRefs.current[activeId] : null);
    target?.focus({ preventScroll: true });
    returnTo.current = null;
    setActiveId(null);
    setFocusedCode(null);
    setHandOff(false);
  }, [activeId]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const hubPoint = project(hub.lon, hub.lat);

  return (
    <section id="wherewefly" lang="en" className="tgva-gutter bg-white pt-20 pb-32 md:pb-44">
      <div className="mx-auto max-w-[1240px]">
        <SectionHeading title="Where We Fly" />

        {/* Nothing on a dot map says "press me", so it is said once, in words.
            It steps back after the first region is opened — invisible rather
            than removed, so the map does not jump up under the reader's thumb. */}
        <p
          aria-hidden={explored}
          className={`tgva-map-hint mt-8 transition-opacity duration-500 ${explored ? "opacity-0" : "opacity-100"}`}
        >
          <span className="tgva-map-hint-dot" aria-hidden />
          <span className="tgva-map-hint-touch">Tap a region to see its routes</span>
          <span className="tgva-map-hint-mouse">Hover or select a region to see its routes</span>
        </p>

        <Reveal className="mt-4">
          {/* Leaving the map with the mouse closes the card — but not when
              what the pointer "left" for is the ticket, which covers the map
              the moment a city is chosen. The card is where the reader goes
              back to for the next city, so it has to outlive the ticket.
              Touch is excluded too: a tap ends in `pointerleave` (and a burst
              of emulated mouse events) wherever it lands, which closed the
              card on every tap outside it, the ticket's own X included.

              Escape closes the card from anywhere in here, a pin included —
              the card has its own handler for focus inside it. */}
          <div
            className="relative"
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse" && !openRoute) close();
            }}
            onKeyDown={(event) => {
              if (event.key !== "Escape" || !activeId) return;
              event.stopPropagation();
              close();
            }}
          >
            {/* The plot is its own box. The pin layer is `inset: 0` of it, so
                when the card drops into flow below on a phone it cannot stretch
                the layer and carry every pin off its coordinates. */}
            <div className="tgva-map-plot">
            <svg
              viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
              /* Cropped, the drawing runs past its box on every side and has to
                 be clipped; whole, nothing reaches the edge. */
              className={`block h-auto w-full ${phone ? "overflow-hidden" : "overflow-visible"}`}
              role="img"
              aria-label="World map of the regions TGVA serves"
            >
              {/* graticule */}
              <g className={`transition-opacity duration-500 ${activeId ? "opacity-40" : "opacity-100"}`}>
                {[60, 40, 20, 0, -20, -40].map((lat) => {
                  const [, y] = project(0, lat);
                  return (
                    <g key={lat}>
                      <line
                        x1={0}
                        y1={y}
                        x2={MAP_VIEWBOX.width}
                        y2={y}
                        className={lat === 0 ? "stroke-gold/50" : "stroke-brand/12"}
                        strokeDasharray={lat === 0 ? "6 6" : undefined}
                      />
                      <text x={8} y={y - 5} className="tgva-map-grid-label fill-brand/65 font-display text-[11px] font-bold tracking-[0.1em]">
                        {lat === 0 ? "EQUATOR" : `${Math.abs(lat)}°${lat > 0 ? "N" : "S"}`}
                      </text>
                    </g>
                  );
                })}
                {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => {
                  const [x] = project(lon, 0);
                  return <line key={lon} x1={x} y1={0} x2={x} y2={MAP_VIEWBOX.height} className="stroke-brand/12" />;
                })}
              </g>

              {/* land */}
              <g
                className={`fill-brand/26 transition-all duration-500 ${
                  activeId ? "opacity-45 blur-[1.2px]" : "opacity-100"
                }`}
              >
                {landDots.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={3} />
                ))}
              </g>

              {/* trunk routes */}
              {trunks.map((trunk) => (
                <path
                  key={trunk.id}
                  d={trunk.d}
                  fill="none"
                  strokeLinecap="round"
                  className={`stroke-brand-light transition-all duration-400 ${
                    activeId ? "opacity-10" : "stroke-[1.4] opacity-30"
                  }`}
                />
              ))}

              {/* the active region's real tracks */}
              {active && (
                <g>
                  {spokes.map(({ city, d, point }, i) => {
                    const isFocus = city.code === focused;
                    const muted = focused !== null && !isFocus;
                    return (
                      <g key={city.code}>
                        <path
                          id={`spoke-${city.code}`}
                          d={d}
                          fill="none"
                          strokeLinecap="round"
                          className={`stroke-brand-light transition-opacity duration-300 ${
                            isFocus ? "stroke-[2.6] opacity-100" : muted ? "opacity-12" : "stroke-[1.3] opacity-45"
                          }`}
                          style={{
                            animation: `tgva-spoke-draw .85s cubic-bezier(.3,.8,.2,1) ${
                              (i / spokes.length) * FAN_DRAW_MS
                            }ms backwards`,
                          }}
                        />
                        <circle
                          cx={point[0]}
                          cy={point[1]}
                          r={isFocus ? 5 : 3.4}
                          className={`fill-brand transition-all duration-300 ${
                            isFocus ? "opacity-100" : muted ? "opacity-20" : "opacity-80"
                          }`}
                        />
                        {isFocus && (
                          <text
                            x={point[0] + 7}
                            y={point[1] - 6}
                            className="tgva-map-city-code fill-brand font-display text-[11px] font-bold tracking-[0.1em]"
                          >
                            {city.code}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* one plane serves the whole fan */}
                  <g className="fill-brand">
                    <circle r={9} className="fill-brand-light opacity-25" />
                    <path d={PLANE_GLYPH} transform="rotate(90) translate(-12,-12)" />
                    {/* Reduced motion parks the aircraft at the destination
                        instead of flying it: the spoke still reads as flown,
                        and nothing loops forever. */}
                    <animateMotion
                      ref={planeMotion}
                      dur={reducedMotion ? "0.01s" : "5.5s"}
                      repeatCount={reducedMotion ? 1 : "indefinite"}
                      fill="freeze"
                      rotate="auto"
                    >
                      <mpath href={`#spoke-${flyingCode}`} />
                    </animateMotion>
                  </g>
                </g>
              )}

              {/* hub */}
              <g>
                <circle cx={hubPoint[0]} cy={hubPoint[1]} r={13} className="fill-none stroke-gold/50" />
                <circle cx={hubPoint[0]} cy={hubPoint[1]} r={4} className="fill-gold" />
              </g>

            </svg>

            {/* The pins live in HTML, not in the drawing. Inside the viewBox a
                label set at 11 units renders at 11 x (container / 1000) — 3.2px on
                a 390px screen — and a pin of r=6 gives a 3.5px tap target. Out
                here a pixel is a pixel and the button can carry 44px of target
                whatever the dot measures. */}
            <div className="tgva-map-pins">
              {regions.map((region) => {
                const isActive = region.id === activeId;
                const dimmed = activeId !== null && !isActive;
                const at = percentOf(region.pin.lon, region.pin.lat, view);
                return (
                  <button
                    key={region.id}
                    ref={(node) => {
                      pinRefs.current[region.id] = node;
                    }}
                    type="button"
                    aria-expanded={isActive}
                    aria-label={region.title}
                    data-place={region.pin.labelPlacement}
                    className={`tgva-map-pin${isActive ? " is-active" : ""}${dimmed ? " is-dim" : ""}`}
                    style={{ left: `${at.left}%`, top: `${at.top}%` }}
                    /* Mouse only. On a touch screen `mouseenter` fires just before
                       `click`, so opening on hover meant the tap opened the card
                       and the click that followed closed it again — the pins were
                       effectively untappable on a phone. */
                    /* With nothing open the first pin opens at once. With a card
                       already up, another pin has to be rested on: the straight
                       line from ASIA to its card crosses EUROPE, and swapping on
                       contact swapped the card out from under the pointer. */
                    onPointerEnter={(event) => {
                      if (event.pointerType !== "mouse") return;
                      window.clearTimeout(hoverTimer.current);
                      if (activeId === null) open(region.id, null);
                      else if (activeId !== region.id) {
                        hoverTimer.current = window.setTimeout(
                          () => open(region.id, null),
                          HOVER_INTENT_MS,
                        );
                      }
                    }}
                    onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
                    /* A mouse has already opened it on the way in, so its click
                       only confirms — toggling there shut the card the reader
                       had just pointed at. A tap or a keypress still toggles.
                       `detail === 0` is a click the keyboard sent, which is what
                       decides whether focus is handed to the card. A real button
                       fires this for Enter and Space on its own, so there is no
                       key handler here to double up with. */
                    onClick={(event) => {
                      if ((event.nativeEvent as PointerEvent).pointerType === "mouse") {
                        open(region.id, null);
                      } else if (activeId === region.id) close();
                      else open(region.id, event.detail === 0 ? event.currentTarget : null);
                    }}
                  >
                    <span className="tgva-map-dot" aria-hidden />
                    <span className="tgva-map-name">{region.title}</span>
                  </button>
                );
              })}
            </div>
            </div>

            {/* Phone only. Two of the four pins sit ~40px apart even zoomed,
                so the regions are also offered as a row of full-size buttons —
                the same toggle, without the aim. */}
            <div className="tgva-region-chips" role="group" aria-label="Regions">
              {regions.map((region) => {
                const isActive = region.id === activeId;
                return (
                  <button
                    key={region.id}
                    type="button"
                    aria-pressed={isActive}
                    className={`tgva-region-chip${isActive ? " is-active" : ""}`}
                    onClick={(event) => {
                      if (isActive) close();
                      else open(region.id, event.detail === 0 ? event.currentTarget : null);
                    }}
                  >
                    {region.title}
                  </button>
                );
              })}
            </div>

            {active && (
              <RegionCard
                region={active}
                focusedCode={focused}
                takeFocus={handOff}
                onFocusCity={setFocusedCode}
                onOpenRoute={setOpenRoute}
                onClose={close}
              />
            )}
          </div>
        </Reveal>
      </div>

      {openRoute ? (
        <RouteDetailDialog destination={openRoute} onClose={() => setOpenRoute(null)} />
      ) : null}
    </section>
  );
}

function RegionCard({
  region,
  focusedCode,
  takeFocus,
  onFocusCity,
  onOpenRoute,
  onClose,
}: {
  region: Region;
  focusedCode: string | null;
  takeFocus: boolean;
  onFocusCity: (code: string | null) => void;
  onOpenRoute: (destination: Destination) => void;
  onClose: () => void;
}) {
  const countries = countriesOf(region);
  const [query, setQuery] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  /**
   * Destinations bucketed by country, in the order the network lists them, with
   * the search applied first. Cheap enough at this size to redo every render —
   * memoising it would only add a dependency on a prop rebuilt each time.
   */
  const needle = query.trim().toLowerCase();
  const groups: [string, typeof region.destinations][] = [];
  for (const city of region.destinations) {
    const hit =
      !needle ||
      city.city.toLowerCase().includes(needle) ||
      city.code.toLowerCase().includes(needle) ||
      city.country.toLowerCase().includes(needle);
    if (!hit) continue;
    const bucket = groups.find(([country]) => country === city.country);
    if (bucket) bucket[1].push(city);
    else groups.push([city.country, [city]]);
  }
  const { top } = percentOf(region.pin.lon, region.pin.lat);
  const [topPx, setTopPx] = useState<number | null>(null);

  /**
   * The card used to hang off its own marker, which worked while a region was a
   * handful of cities. With real tracks drawn to every destination it covered
   * the fan it was describing — every region's routes crowd the eastern half of
   * the map, which is exactly where its marker sits.
   *
   * So it lives in the western half instead, over ocean and the Americas, where
   * TGVA flies nowhere and nothing can be hidden. It still tracks the marker's
   * latitude, clamped to stay inside the map; the gold marker and the drawing
   * fan carry the connection.
   */
  useLayoutEffect(() => {
    const place = () => {
      const card = cardRef.current;
      if (!card) return;

      // Below 46rem the card is an ordinary block under the map, so there is
      // nothing to measure and nothing to hide: `top` is inert on a static
      // element, and setting it is what clears the first-frame visibility.
      if (getComputedStyle(card).position === "static") {
        setTopPx(0);
        return;
      }

      const map = card.offsetParent as HTMLElement | null;
      if (!map) return;

      const edge = 8;
      const markerY = (top / 100) * map.clientHeight;
      const lowest = Math.max(edge, map.clientHeight - card.offsetHeight - edge);
      setTopPx(Math.min(Math.max(markerY - card.offsetHeight / 2, edge), lowest));
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [top, region.id]);

  /**
   * A card opened from the keyboard takes focus, so the list is the next stop.
   * It waits for the card to be shown: on the first commit it is still hidden
   * while it is measured, and focus() on a hidden element does nothing. It runs
   * again for every region, because moving from one pin to the next by keyboard
   * keeps the card mounted and `takeFocus` true throughout.
   */
  const shown = topPx !== null;
  useEffect(() => {
    if (takeFocus && shown) cardRef.current?.focus({ preventScroll: true });
  }, [takeFocus, shown, region.id]);

  return (
    <div
      ref={cardRef}
      tabIndex={-1}
      role="group"
      aria-label={`${region.title} destinations`}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        onClose();
      }}
      className="tgva-region-card rounded-[14px] border border-brand/16 bg-white/95 p-4.5 backdrop-blur-lg"
      /* Hidden for the first frame only, while its height is measured. */
      style={{ top: topPx ?? 0, visibility: topPx === null ? "hidden" : "visible" }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${region.title}`}
        /* 44px of target in the corner; the mark inside it stays the 26px the
           card was drawn with. */
        className="absolute top-0 right-0 grid size-11 cursor-pointer place-items-center text-ink-mute transition-colors hover:text-brand"
      >
        <span className="grid size-6.5 place-items-center rounded-lg border border-brand/18 transition-colors hover:bg-surface-sunken">
          <CloseMark />
        </span>
      </button>

      <h3 className="mt-1.5 mr-11 font-display text-[22px] font-extrabold tracking-[0.06em] text-brand">
        {region.title}
      </h3>

      {/* Wraps rather than overflows: the three labels at this tracking are
          wider than the card, and TYPICAL SECTOR used to run out of it. */}
      <div className="mt-3 flex flex-wrap gap-x-4.5 gap-y-3 border-t border-brand/15 pt-3">
        <Stat value={String(region.destinations.length)} label="DESTINATIONS" />
        {countries.length > 1 && <Stat value={String(countries.length)} label="COUNTRIES" />}
        <Stat value={region.sector} label="TYPICAL SECTOR" small />
      </div>

      {/* Forty-five destinations across eighteen countries is too many to scan
          as one list, so they are grouped by country and — past a certain
          length — filterable. Search matches city, code or country, because
          people arrive knowing any one of the three. */}
      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-mute">
        <svg
          aria-hidden
          viewBox="0 0 14 10"
          className="size-2.5 shrink-0 text-gold-deep"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="square"
        >
          <path d="M0.5 5h12M8.5 1l4 4-4 4" />
        </svg>
        Select a city for its route and aircraft
      </p>

      {region.destinations.length > 8 && (
        <div className="relative mt-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city, code or country"
            aria-label={`Search ${region.title} destinations`}
            className="w-full rounded-md border border-brand/15 bg-surface py-2 pr-2.5 pl-7 text-[12px] text-ink-soft placeholder:text-ink-mute focus-visible:border-gold focus-visible:outline-none"
          />
          <SearchMark />
        </div>
      )}

      <div
        className="tgva-region-list mt-2.5 overflow-y-auto overscroll-contain"
        onMouseLeave={() => onFocusCity(null)}
      >
        {groups.map(([country, cities]) => (
          <section key={country}>
            {countries.length > 1 && (
              <h4 className="sticky top-0 z-1 flex items-baseline justify-between gap-2 bg-white/95 py-1.5 font-display text-[11.5px] font-bold tracking-[0.26em] text-brand-light backdrop-blur-sm">
                {country.toUpperCase()}
                <span className="font-mono text-[11px] font-normal tracking-normal text-ink-mute">
                  {cities.length}
                </span>
              </h4>
            )}
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,7.5rem),1fr))] gap-1 pb-1.5">
              {cities.map((city) => (
                <li key={city.code}>
                  <button
                    type="button"
                    onMouseEnter={() => onFocusCity(city.code)}
                    onFocus={() => onFocusCity(city.code)}
                    onClick={() => onOpenRoute(city)}
                    aria-label={`Route detail, Bangkok to ${city.city}`}
                    /* 33px of row, up from 29. Forty-five of these are tapped
                       one-handed on a phone, which is the device this card is
                       most used on. */
                    className={`tgva-city-row relative flex w-full cursor-pointer items-baseline gap-2 rounded-md py-2.5 pr-2 pl-2.5 text-left text-[12px] transition-colors ${
                      focusedCode === city.code
                        ? "bg-surface-sunken text-brand"
                        : "text-ink-soft hover:bg-surface-sunken hover:text-brand"
                    }`}
                  >
                    {/* Colour is left to the .tgva-city-row rules: a text-* utility here
                        would outrank them and the code would never turn gold. */}
                    <b className="font-mono text-[11px] font-semibold tracking-[0.04em]">
                      {city.code}
                    </b>
                    {city.city}
                    {/* Drawn, not an arrow glyph set in the figure face —
                        Plex Mono is for timetable figures only. */}
                    <svg
                      aria-hidden
                      viewBox="0 0 14 10"
                      className="tgva-city-go ml-auto size-2.5 shrink-0 self-center text-gold-deep"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="square"
                    >
                      <path d="M0.5 5h12M8.5 1l4 4-4 4" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {groups.length === 0 && (
          <p className="px-1 py-4 text-center text-[11.5px] text-ink-mute">
            Nothing in {region.title} matches “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label, small }: { value: string; label: string; small?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col">
      <b
        className={`font-display font-extrabold text-brand tabular-nums ${
          small ? "text-[13px]" : "text-[22px] leading-tight"
        }`}
      >
        {value}
      </b>
      <span className="mt-1 font-display text-[11px] leading-snug font-bold tracking-[0.2em] text-ink-mute">
        {label}
      </span>
    </div>
  );
}

