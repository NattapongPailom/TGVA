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

/** However many spokes a region has, the whole fan finishes drawing in this long. */
const FAN_DRAW_MS = 700;

const labelAnchor = {
  right: { dx: 16, anchor: "start" as const, dy: 4 },
  left: { dx: -16, anchor: "end" as const, dy: 4 },
  below: { dx: 0, anchor: "middle" as const, dy: 26 },
};

/** Marker position as a percentage of the map box, so cards scale with it. */
function percentOf(lon: number, lat: number) {
  const [x, y] = project(lon, lat);
  return { left: (x / MAP_VIEWBOX.width) * 100, top: (y / MAP_VIEWBOX.height) * 100 };
}

export function WhereWeFly() {
  const [activeId, setActiveId] = useState<RegionId | null>(null);
  const [focusedCode, setFocusedCode] = useState<string | null>(null);
  const [openRoute, setOpenRoute] = useState<Destination | null>(null);
  const planeMotion = useRef<SVGAnimateMotionElement>(null);

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

  const close = useCallback(() => {
    setActiveId(null);
    setFocusedCode(null);
  }, []);

  const hubPoint = project(hub.lon, hub.lat);

  return (
    <section id="wherewefly" lang="en" className="bg-white px-12 pt-20 pb-32 md:pb-44">
      <div className="mx-auto max-w-[1240px]">
        <SectionHeading title="Where We Fly" rule={false} />

        <Reveal className="mt-12">
          <div
            className="relative"
            onMouseLeave={close}
          >
            <svg
              viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
              className="block h-auto w-full overflow-visible"
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
                      <text x={8} y={y - 5} className="fill-brand/40 font-display text-[9px] font-bold tracking-[0.1em]">
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
                            className="fill-brand font-display text-[8.5px] font-bold tracking-[0.1em]"
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
                    <animateMotion ref={planeMotion} dur="5.5s" repeatCount="indefinite" rotate="auto">
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

              {/* region pins */}
              {regions.map((region) => {
                const isActive = region.id === activeId;
                const dimmed = activeId !== null && !isActive;
                const [x, y] = project(region.pin.lon, region.pin.lat);
                const label = labelAnchor[region.pin.labelPlacement];
                return (
                  <g
                    key={region.id}
                    tabIndex={0}
                    role="button"
                    aria-label={region.title}
                    className="cursor-pointer focus:outline-none"
                    onMouseEnter={() => setActiveId(region.id)}
                    onFocus={() => setActiveId(region.id)}
                    onClick={() => (activeId === region.id ? close() : setActiveId(region.id))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveId(region.id);
                      }
                    }}
                  >
                    {!dimmed && (
                      <circle
                        cx={x}
                        cy={y}
                        r={7}
                        className="fill-brand-light origin-center"
                        style={{ transformBox: "fill-box", animation: "tgva-pin-pulse 2.8s ease-in-out infinite" }}
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? 9 : 6}
                      strokeWidth={2}
                      className={`stroke-white transition-all duration-300 ${
                        isActive ? "fill-gold" : dimmed ? "fill-brand opacity-30" : "fill-brand"
                      }`}
                    />
                    <text
                      x={x + label.dx}
                      y={y + (label.dy - 4)}
                      textAnchor={label.anchor}
                      className={`pointer-events-none font-display text-[11px] font-bold tracking-[0.16em] transition-all duration-300 ${
                        isActive ? "fill-gold-deep" : dimmed ? "fill-brand opacity-30" : "fill-brand"
                      }`}
                    >
                      {region.title}
                    </text>
                  </g>
                );
              })}
            </svg>

            {active && (
              <RegionCard
                region={active}
                focusedCode={focused}
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
  onFocusCity,
  onOpenRoute,
  onClose,
}: {
  region: Region;
  focusedCode: string | null;
  onFocusCity: (code: string | null) => void;
  onOpenRoute: (destination: Destination) => void;
  onClose: () => void;
}) {
  const countries = countriesOf(region);
  const [query, setQuery] = useState("");

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
  const cardRef = useRef<HTMLDivElement>(null);
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
      const map = card?.offsetParent as HTMLElement | null;
      if (!card || !map) return;

      const edge = 8;
      const markerY = (top / 100) * map.clientHeight;
      const lowest = Math.max(edge, map.clientHeight - card.offsetHeight - edge);
      setTopPx(Math.min(Math.max(markerY - card.offsetHeight / 2, edge), lowest));
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [top, region.id]);

  return (
    <div
      ref={cardRef}
      className="absolute left-[3%] z-5 w-[min(21rem,80vw)] rounded-[14px] border border-brand/16 bg-white/95 p-4.5 shadow-[0_22px_46px_rgba(54,10,111,0.18)] backdrop-blur-lg max-sm:left-1/2 max-sm:-translate-x-1/2 sm:w-84"
      /* Hidden for the first frame only, while its height is measured. */
      style={{ top: topPx ?? 0, visibility: topPx === null ? "hidden" : "visible" }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${region.title}`}
        className="absolute top-2.5 right-2.5 grid h-6.5 w-6.5 cursor-pointer place-items-center rounded-lg border border-brand/18 text-sm text-ink-mute transition-colors hover:bg-surface-sunken hover:text-brand"
      >
        ✕
      </button>

      <h3 className="mt-1.5 mr-8 font-display text-[19px] font-extrabold tracking-[0.03em] text-brand">
        {region.title}
      </h3>

      <div className="mt-3 flex gap-4.5 border-t border-brand/15 pt-3">
        <Stat value={String(region.destinations.length)} label="DESTINATIONS" />
        {countries.length > 1 && <Stat value={String(countries.length)} label="COUNTRIES" />}
        <Stat value={region.sector} label="TYPICAL SECTOR" small />
      </div>

      {/* Forty-five destinations across eighteen countries is too many to scan
          as one list, so they are grouped by country and — past a certain
          length — filterable. Search matches city, code or country, because
          people arrive knowing any one of the three. */}
      {region.destinations.length > 8 && (
        <div className="relative mt-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city, code or country"
            aria-label={`Search ${region.title} destinations`}
            className="w-full rounded-md border border-brand/15 bg-surface py-1.5 pr-2.5 pl-7 text-[11.5px] text-ink-soft placeholder:text-ink-mute/60 focus-visible:border-gold focus-visible:outline-none"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 font-mono text-[11px] text-ink-mute/70"
          >
            ⌕
          </span>
        </div>
      )}

      <div
        className="mt-2.5 max-h-80 overflow-y-auto overscroll-contain"
        onMouseLeave={() => onFocusCity(null)}
      >
        {groups.map(([country, cities]) => (
          <section key={country}>
            {countries.length > 1 && (
              <h4 className="sticky top-0 z-1 flex items-baseline justify-between gap-2 bg-white/95 py-1.5 font-display text-[9.5px] font-bold tracking-[0.18em] text-brand-light backdrop-blur-sm">
                {country.toUpperCase()}
                <span className="font-mono text-[9.5px] font-normal tracking-normal text-ink-mute/70">
                  {cities.length}
                </span>
              </h4>
            )}
            <ul className="grid grid-cols-2 gap-1 pb-1.5">
              {cities.map((city) => (
                <li key={city.code}>
                  <button
                    type="button"
                    onMouseEnter={() => onFocusCity(city.code)}
                    onFocus={() => onFocusCity(city.code)}
                    onClick={() => onOpenRoute(city)}
                    aria-label={`Route detail, Bangkok to ${city.city}`}
                    className={`tgva-city-row relative flex w-full cursor-pointer items-baseline gap-2 rounded-md py-1.5 pr-2 pl-2.5 text-left text-[11.5px] transition-colors ${
                      focusedCode === city.code
                        ? "bg-surface-sunken text-brand"
                        : "text-ink-soft hover:bg-surface-sunken hover:text-brand"
                    }`}
                  >
                    {/* Colour is left to the .tgva-city-row rules: a text-* utility here
                        would outrank them and the code would never turn gold. */}
                    <b className="font-mono text-[9.5px] font-semibold tracking-[0.04em]">
                      {city.code}
                    </b>
                    {city.city}
                    <span
                      aria-hidden
                      className="tgva-city-go ml-auto font-mono text-[11px] text-gold-deep"
                    >
                      →
                    </span>
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
    <div className="flex flex-col">
      <b
        className={`font-display font-extrabold text-brand tabular-nums ${
          small ? "text-[13px]" : "text-[21px] leading-tight"
        }`}
      >
        {value}
      </b>
      <span className="mt-1 font-display text-[10px] font-bold tracking-[0.16em] text-ink-mute">
        {label}
      </span>
    </div>
  );
}

