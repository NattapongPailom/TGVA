"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { events } from "@/content/events";
import { ActionLink } from "@/components/ui/ActionLink";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { CloseMark } from "@/components/ui/CloseMark";

/** Long enough for the page to arrive before anything covers it. */
const ENTRANCE_MS = 900;
/** After a dismissal the announcement keeps quiet for this long. */
const QUIET_DAYS = 7;
/** Kept in step with the flight in ActionLink, so the ticket leaves after it. */
const JOIN_MS = 1400;

const KEY = "tgva-events-seen";

/**
 * What a browser remembers between visits: the events already dismissed, and
 * the date the announcement may speak up again. A new event is still announced
 * inside the quiet spell — being quiet about the ones already seen is the
 * point, not going silent altogether.
 */
type Memory = { seen: string[]; quietUntil: number };

const BLANK: Memory = { seen: [], quietUntil: 0 };

function readMemory(): Memory {
  try {
    return { ...BLANK, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return BLANK;
  }
}

function writeMemory(memory: Memory) {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* private browsing: the announcement simply shows again next time */
  }
}

/** Days out while it is far off, a clock once it is close enough to matter. */
function timeLeft(starts: string, now: number) {
  const left = new Date(starts).getTime() - now;
  if (Number.isNaN(left)) return null;
  if (left <= 0) return "NOW BOARDING";

  const pad = (value: number) => String(value).padStart(2, "0");
  const days = Math.floor(left / 86_400_000);
  const hours = Math.floor((left % 86_400_000) / 3_600_000);
  const minutes = Math.floor((left % 3_600_000) / 60_000);
  const seconds = Math.floor((left % 60_000) / 1_000);
  return days > 0
    ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function EventAnnouncement() {
  const [index, setIndex] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const passRef = useRef<HTMLElement>(null);

  const open = index !== null;
  const event = index === null ? null : events[index];
  const next = index === null ? null : events[(index + 1) % events.length];
  const left = event ? timeLeft(event.starts, now) : null;

  useScrollLock(open);

  /* Which event to announce, if any: the first one this browser has not seen,
     and only once the quiet spell after the last dismissal has run out. */
  useEffect(() => {
    if (!events.length) return;
    const memory = readMemory();
    const unseen = events.findIndex((candidate) => !memory.seen.includes(candidate.id));
    if (unseen === -1) return;
    if (memory.seen.length && Date.now() < memory.quietUntil) return;

    const timer = window.setTimeout(() => {
      setIndex(unseen);
      requestAnimationFrame(() => setShown(true));
    }, ENTRANCE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // The clock ticks only while a pass is on screen to read it.
  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  const remember = useCallback((id: string) => {
    const memory = readMemory();
    if (!memory.seen.includes(id)) memory.seen.push(id);
    memory.quietUntil = Date.now() + QUIET_DAYS * 86_400_000;
    writeMemory(memory);
  }, []);

  /**
   * A dismissed ticket is not thrown away — it flies into the EVENTS button in
   * the bar, which is where the reader can pick it up again.
   */
  const flyHome = useCallback(() => {
    const card = passRef.current;
    const home = document.getElementById("tgva-events-button");
    if (!card || !home || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const from = card.getBoundingClientRect();
    const to = home.getBoundingClientRect();
    card.animate(
      [
        { translate: "0 0", scale: 1, opacity: 1 },
        {
          translate: `${to.left + to.width / 2 - (from.left + from.width / 2)}px ${
            to.top + to.height / 2 - (from.top + from.height / 2)
          }px`,
          scale: Math.max(0.06, to.width / from.width),
          opacity: 0,
        },
      ],
      { duration: 620, easing: "cubic-bezier(0.5, 0, 0.2, 1)" },
    );
    window.setTimeout(() => home.classList.add("is-landed"), 480);
    window.setTimeout(() => home.classList.remove("is-landed"), 1430);
  }, []);

  const close = useCallback(
    ({ fly = true }: { fly?: boolean } = {}) => {
      if (index === null) return;
      remember(events[index].id);
      if (fly) flyHome();
      setShown(false);
      window.setTimeout(() => setIndex(null), 450);
    },
    [flyHome, index, remember],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  if (!event) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tgva-pass-title"
      onClick={() => close()}
      className={`tgva-pass-scrim ${shown ? "is-open" : ""}`}
    >
      <div className="tgva-pass-wrap" onClick={(click) => click.stopPropagation()}>
        <article ref={passRef} className="tgva-pass">
          <button
            type="button"
            onClick={() => close()}
            aria-label="Close"
            className="tgva-pass-close"
          >
            {/* The shared mark, not a text ✕: this was the last of the three
                different dismiss affordances the page had. */}
            <CloseMark className="size-3.5" />
          </button>

          <a
            href={event.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => remember(event.id)}
            className="tgva-pass-stub"
            aria-label={`Join ${event.title}`}
          >
            <Image src={event.poster} alt="" aria-hidden fill sizes="18rem" />
            <span className="tgva-pass-veil" />
            <span className="tgva-pass-seat">
              <b>{event.route}</b>
              <span>{event.aircraft}</span>
            </span>
          </a>

          <div className="tgva-pass-body">
            <h2 id="tgva-pass-title">{event.title}</h2>
            <p>{event.blurb}</p>

            <dl className="tgva-pass-fields">
              <div>
                <dt>DATE</dt>
                <dd>{event.date}</dd>
              </div>
              <div>
                <dt>BRIEFING</dt>
                <dd>{event.time}</dd>
              </div>
              <div>
                <dt>GATE</dt>
                <dd>{event.gate}</dd>
              </div>
            </dl>

            <p className="tgva-pass-countdown">
              <span>DOORS OPEN IN:</span>
              <b>{left ?? "—"}</b>
            </p>

            <div className="tgva-pass-actions">
              <ActionLink
                href={event.joinUrl}
                variant="primary"
                motion="roll"
                onClick={() => {
                  remember(event.id);
                  window.setTimeout(() => close({ fly: false }), JOIN_MS);
                }}
              >
                JOIN THE FLIGHT
              </ActionLink>
              <Link href="/events" onClick={() => close({ fly: false })} className="tgva-pass-more">
                See all events
              </Link>
            </div>
          </div>
        </article>

        {next && next.id !== event.id ? (
          <button
            type="button"
            className="tgva-pass-next"
            onClick={() => setIndex((current) => ((current ?? 0) + 1) % events.length)}
          >
            <span className="tgva-pass-tag">ALSO ON</span>
            <b>{next.title}</b>
            <span className="tgva-pass-when">
              {next.date} · {next.time}
            </span>
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
