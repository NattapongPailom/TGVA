"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { type Destination } from "@/content/regions";
import { aircraftCodes, typeByCode } from "@/content/fleet";
import { routeDetail } from "@/lib/route-details";
import { AircraftPicture } from "@/components/sections/AircraftPicture";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { CloseMark } from "@/components/ui/CloseMark";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/** Bangkok's own details, the origin of every route in the network. */
const ORIGIN = { code: "BKK", city: "Bangkok", country: "Thailand" };

/** The straight track every route is drawn on, in the track's own viewBox. */
const TRACK = "M14 22 L386 22";

const PLANE =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";
const PIN =
  "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z";

const format = (value: number) => value.toLocaleString("en-US");

/**
 * Bars derived from the flight number, so a route always prints the same code
 * and two different routes never print the same one.
 */
function barcode(seed: string) {
  let state = 0;
  for (const character of seed) state = (state * 31 + character.charCodeAt(0)) % 9973;
  return Array.from({ length: 46 }, () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return { height: 40 + ((state >> 8) % 60), width: (state >> 4) % 3 === 0 ? 3 : 2 };
  });
}

export function RouteDetailDialog({
  destination,
  onClose,
}: {
  destination: Destination;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const planeMotion = useRef<SVGAnimateMotionElement>(null);
  /** SMIL ignores the stylesheet's reduced-motion block, so it asks directly. */
  const reducedMotion = usePrefersReducedMotion();
  const detail = routeDetail(destination);
  const codes = aircraftCodes(detail.aircraft);
  const bars = barcode(detail.flightNumber);

  /* Focus starts on the close button and, when the ticket goes, returns to the
     city row that opened it — so the reader can move straight on to the next
     city instead of starting again from the top of the page. */
  useFocusTrap(dialogRef, true, { initialFocus: closeRef });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // SMIL will not start on its own inside a freshly mounted subtree.
  useEffect(() => {
    const timer = setTimeout(() => planeMotion.current?.beginElement(), 350);
    return () => clearTimeout(timer);
  }, []);

  useScrollLock(true);

  const trackId = `tgva-track-${destination.code}`;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Route detail, Bangkok to ${destination.city}`}
      onClick={onClose}
      className="fixed inset-0 z-90 grid place-items-center overflow-y-auto bg-ink/60 p-[max(1.5rem,env(safe-area-inset-left))] backdrop-blur-[5px]"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="tgva-ticket"
      >
        <div className="tgva-ticket-stub">
          {/* Grey land on white. The stylesheet inverts it and screens it over
              the stub, which turns the white ground transparent and leaves the
              continents as a faint light wash — no alpha channel needed. */}
          <Image
            src="/images/world-map.png"
            alt=""
            aria-hidden
            fill
            sizes="44rem"
            priority={false}
            className="tgva-ticket-map"
          />

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="tgva-ticket-close"
          >
            <CloseMark />
          </button>

          <div className="tgva-ticket-top">
            <span>
              {ORIGIN.city}, {ORIGIN.country}
            </span>
            <span>
              {destination.city}, {destination.country}
            </span>
          </div>

          <div className="tgva-ticket-route">
            <b>{ORIGIN.code}</b>

            <div className="tgva-ticket-track">
              <svg viewBox="0 0 400 44" aria-hidden>
                <path className="tgva-t-under" d={TRACK} />
                <path className="tgva-t-line" d={TRACK} />
                <path className="tgva-t-flow" d={TRACK} />
                <path id={trackId} d={TRACK} fill="none" />

                <g className="tgva-t-node tgva-t-from" transform="translate(14,22)">
                  <circle className="tgva-t-ring-soft" r={9.5} />
                  <circle className="tgva-t-ring" r={6} />
                  <circle className="tgva-t-dot" r={2.6} />
                </g>

                <g className="tgva-t-node tgva-t-to" transform="translate(386,22)">
                  <circle className="tgva-t-ring" r={6} />
                </g>
                <g transform="translate(386,22)">
                  <circle className="tgva-t-ping" r={7} />
                  <circle className="tgva-t-ping tgva-t-ping-late" r={7} />
                  <circle className="tgva-t-arrived" r={7} />
                  <circle className="tgva-t-arrived-dot" r={2.2} />
                  <g className="tgva-t-pin">
                    <path d={PIN} transform="scale(1.15) translate(-12,-22)" />
                  </g>
                </g>

                <g className="tgva-t-plane">
                  <path d={PLANE} transform="rotate(90) scale(1.5) translate(-12,-12)" />
                  <animateMotion
                    ref={planeMotion}
                    dur={reducedMotion ? "0.01s" : "3.2s"}
                    begin="indefinite"
                    fill="freeze"
                    rotate="auto"
                    calcMode="spline"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    keySplines="0.42 0 0.3 1"
                  >
                    <mpath href={`#${trackId}`} />
                  </animateMotion>
                </g>
              </svg>
            </div>

            <b>{destination.code}</b>
          </div>
        </div>

        <div className="tgva-ticket-perf">
          <i />
          <u>
            <b />
          </u>
        </div>

        <div className="tgva-ticket-body">
          <dl className="tgva-ticket-fields">
            <Field label="FLIGHT" value={detail.flightNumber} />
            <Field label="DURATION" value={detail.flightTime} />
            <Field label="DISTANCE" value={format(detail.distanceKm)} unit="km" />
          </dl>

          <div className="tgva-ticket-fleet-head">
            <h4>AIRCRAFT ON THIS ROUTE</h4>
            <span>
              {codes.length} type{codes.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="tgva-ticket-planes">
            {codes.map((code) => {
              const spec = typeByCode(code);

              /* Every code in the timetable resolves — active, retired or
                 legacy. Should one arrive that does not, it is named as written
                 rather than guessed at, and that means a typo. */
              if (!spec) {
                return (
                  <div key={code} className="tgva-ticket-plane">
                    <div>
                      <span className="tgva-ticket-plane-name">{code}</span>
                      <p className="tgva-ticket-plane-none">Not in the published fleet</p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={code} className="tgva-ticket-plane">
                  <div>
                    {/* The hidden commas keep a screen reader from running
                        name, code and label together as "A350-900A359". */}
                    <span className="tgva-ticket-plane-name">
                      {spec.name}
                      <span className="sr-only">, </span>
                    </span>
                    <span className="tgva-ticket-plane-code">
                      {code}
                      {spec.retired ? <span className="sr-only">, </span> : null}
                    </span>
                    {/* A fact about the fleet, not a fault with the route — so
                        it is set as a quiet label beside the code, in the ink
                        the rest of the ticket's secondary text uses. */}
                    {spec.retired ? <span className="tgva-ticket-plane-retired">Retired</span> : null}
                  </div>
                  <AircraftPicture aircraft={spec} sizes="15rem" className="tgva-ticket-silo" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="tgva-ticket-foot">
          <span className="tgva-ticket-barcode" aria-hidden>
            {bars.map((bar, index) => (
              <i key={index} style={{ height: `${bar.height}%`, width: `${bar.width}px` }} />
            ))}
          </span>
          <span className="tgva-ticket-tag">
            {ORIGIN.code} → {destination.code}
            <br />
            {detail.flightNumber}
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="tgva-ticket-field">
      <dt>{label}</dt>
      <dd>
        {value}
        {unit ? <small>{unit}</small> : null}
      </dd>
    </div>
  );
}
