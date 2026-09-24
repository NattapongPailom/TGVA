"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { nav, social, membershipFormUrl } from "@/content/site";
import { events } from "@/content/events";
import { ActionLink } from "@/components/ui/ActionLink";
import { useScrollLock } from "@/lib/use-scroll-lock";

/** Above the hero the bar always shows; hiding it there would serve nothing. */
const REVEAL_ZONE = 180;
/** Rubber-band and sub-pixel jitter shouldn't flip it — only a real scroll. */
const THRESHOLD = 8;
/** Past this the bar draws itself in: shorter, with a smaller logo. */
const COMPACT_ZONE = 120;

/** Every section the bar can mark, in the order they appear on the page. */
const SECTIONS = nav.flatMap((item) => item.sections);
const KEY_OF = new Map(nav.flatMap((item) => item.sections.map((id) => [id, item.key])));

const ICON = {
  discord:
    "M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.61 1.25a18.27 18.27 0 0 0-5.49 0 12.6 12.6 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.64-1.87.89a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.23 1.99a.08.08 0 0 0 .08.03 19.84 19.84 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z",
  instagram:
    "M12 2.2c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z",
};

/** Channels the team has given a URL for. The rest wait rather than lead nowhere. */
const CHANNELS = social.filter((channel) => channel.href);

export function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [marker, setMarker] = useState<{ x: number; width: number } | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<string, HTMLElement>());
  const closeTimer = useRef(0);

  const activeKey = active ? (KEY_OF.get(active) ?? null) : null;

  useScrollLock(sheetOpen);

  /* The gold marker is measured rather than laid out: the links are a plain
     row, and the bar under them slides between their boxes. */
  const measure = useCallback(() => {
    const row = linksRef.current;
    const link = activeKey ? linkRefs.current.get(activeKey) : undefined;
    if (!row || !link || !link.getClientRects().length) return setMarker(null);
    const box = row.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    setMarker({ x: rect.left - box.left, width: rect.width });
  }, [activeKey]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /* Which section the reader is in: whichever one crosses the middle band of
     the viewport. Off the home page there are no sections and nothing marks. */
  useEffect(() => {
    const targets = SECTIONS.map((id) => document.getElementById(id)).filter(
      (element) => element !== null,
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setCompact(y > COMPACT_ZONE);
        if (Math.abs(y - last) < THRESHOLD) return;
        setHidden(y > last && y > REVEAL_ZONE);
        last = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  /* A bar with something open stays put — sliding it away would take the menu
     with it while the reader is reading it. */
  const parked = sheetOpen || openMenu !== null;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenMenu(null);
      setSheetOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".tgva-nav-group")) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  // The sheet drops out of the bar, so it may only use the height below it.
  useEffect(() => {
    if (!sheetOpen) return;
    const height = headerRef.current?.getBoundingClientRect().height ?? 0;
    headerRef.current?.style.setProperty("--tgva-nav-h", `${height}px`);
  }, [sheetOpen]);

  return (
    <header
      ref={headerRef}
      /* Sticky rather than fixed: the bar keeps its place in the flow, so the
         page needs no spacer to sit under it, and translating it away still
         clears the viewport. A keyboard tab into it brings it back. */
      onFocusCapture={() => setHidden(false)}
      className={`tgva-nav ${hidden && !parked ? "is-hidden" : ""} ${compact ? "is-compact" : ""} ${
        sheetOpen ? "is-menu" : ""
      }`}
    >
      <div className="tgva-nav-body">
        {/* Same 1240px measure as every section below, so the logo lines up
            with page content. */}
        <div className="tgva-nav-bar">
          {/* Both marks ship: the cream one reads on the orchid ground the bar
              rests on, the purple one on the white it turns once the page
              scrolls. Only one is ever visible, and the alt text sits on that
              one so the pair is announced once. */}
          <Link href="/#top" className="tgva-nav-logo" aria-label="TGVA — Thai Airways Virtual">
            <Image
              className="tgva-logo-light"
              src="/images/logo-tgva-cream.png"
              alt=""
              width={866}
              height={288}
              priority
            />
            <Image
              className="tgva-logo-dark"
              src="/images/logo-tgva.png"
              alt=""
              width={866}
              height={288}
              priority
            />
          </Link>

          <nav ref={linksRef} className="tgva-nav-links" aria-label="Main">
            {nav.map((item) =>
              item.children ? (
                <div
                  key={item.key}
                  className={`tgva-nav-group ${openMenu === item.key ? "is-open" : ""}`}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "mouse") return;
                    window.clearTimeout(closeTimer.current);
                    setOpenMenu(item.key);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType !== "mouse") return;
                    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenu(null);
                  }}
                >
                  <button
                    type="button"
                    ref={(element) => {
                      if (element) linkRefs.current.set(item.key, element);
                    }}
                    className={`tgva-nav-link ${activeKey === item.key ? "is-active" : ""}`}
                    aria-expanded={openMenu === item.key}
                    aria-haspopup="true"
                    /* A mouse has already opened it on the way in; a tap or a
                       keypress is what toggles it shut again. */
                    onClick={(click) => {
                      const mouse =
                        (click.nativeEvent as PointerEvent).pointerType === "mouse";
                      setOpenMenu(mouse || openMenu !== item.key ? item.key : null);
                    }}
                  >
                    {item.label}
                    <Chevron />
                  </button>

                  <div className="tgva-nav-menu">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpenMenu(null)}
                        className={`tgva-nav-menu-item ${
                          active === child.section ? "is-active" : ""
                        }`}
                      >
                        <b>{child.label}</b>
                        <small>{child.note}</small>
                        <Arrow />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.key}
                  href={item.href!}
                  ref={(element) => {
                    if (element) linkRefs.current.set(item.key, element);
                  }}
                  aria-current={activeKey === item.key ? "true" : undefined}
                  className={`tgva-nav-link ${activeKey === item.key ? "is-active" : ""}`}
                >
                  {item.label}
                </Link>
              ),
            )}

            <span
              aria-hidden
              className={`tgva-nav-marker ${marker ? "is-on" : ""}`}
              style={marker ? { width: marker.width, translate: `${marker.x}px 0` } : undefined}
            />
          </nav>

          <div className="tgva-nav-tools">
            {CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={channel.label}
                className="tgva-nav-icon"
              >
                <SocialIcon name={channel.icon} />
              </a>
            ))}
            {CHANNELS.length ? <span aria-hidden className="tgva-nav-sep" /> : null}

            <EventsLink id="tgva-events-button" />

            <ActionLink href={membershipFormUrl} variant="primary" motion="beacon" size="compact">
              JOIN US
            </ActionLink>
          </div>

          <Link
            href="/events"
            className="tgva-nav-mini"
            aria-label={events.length ? `Events, ${events.length} upcoming` : "Events"}
          >
            <CalendarIcon />
            {events.length ? <span className="tgva-nav-count">{events.length}</span> : null}
          </Link>

          <button
            type="button"
            className="tgva-nav-burger"
            aria-expanded={sheetOpen}
            aria-label={sheetOpen ? "Close menu" : "Open menu"}
            onClick={() => setSheetOpen((open) => !open)}
          >
            <span>
              <i />
              <i />
            </span>
          </button>
        </div>

        <div className="tgva-nav-scrim" onClick={() => setSheetOpen(false)} />

        {/* Drops out of the bar: the clip opens downwards and the rows follow
            it in, a beat apart. */}
        <nav className="tgva-nav-sheet" aria-label="Menu">
          <div className="tgva-nav-sheet-in">
            {nav.map((item, index) => (
              <SheetRow key={item.key} index={index}>
                {item.children ? (
                  <>
                    <p className="tgva-nav-sheet-group">{item.label.toUpperCase()}</p>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setSheetOpen(false)}
                        className={`tgva-nav-sheet-link is-sub ${
                          active === child.section ? "is-active" : ""
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setSheetOpen(false)}
                    className={`tgva-nav-sheet-link ${activeKey === item.key ? "is-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                )}
              </SheetRow>
            ))}

            <SheetRow index={nav.length}>
              <div className="tgva-nav-sheet-foot">
                {CHANNELS.length ? (
                  <div className="tgva-nav-sheet-pair">
                    {CHANNELS.map((channel) => (
                      <a
                        key={channel.label}
                        href={channel.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setSheetOpen(false)}
                      >
                        <SocialIcon name={channel.icon} />
                        {channel.label.toUpperCase()}
                      </a>
                    ))}
                  </div>
                ) : null}

                <EventsLink onClick={() => setSheetOpen(false)} />

                <ActionLink
                  href={membershipFormUrl}
                  variant="primary"
                  motion="beacon"
                  className="w-full justify-center"
                >
                  JOIN US
                </ActionLink>
              </div>
            </SheetRow>
          </div>
        </nav>
      </div>
    </header>
  );
}

/**
 * The one place the announcement can be found again after it is dismissed —
 * which is why the popup flies into this element by id.
 */
function EventsLink({ id, onClick }: { id?: string; onClick?: () => void }) {
  return (
    <Link id={id} href="/events" className="tgva-nav-events" onClick={onClick}>
      <CalendarIcon />
      EVENTS
      {events.length ? <span className="tgva-nav-count">{events.length}</span> : null}
    </Link>
  );
}

function SheetRow({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div className="tgva-nav-row" style={{ "--i": index } as CSSProperties}>
      {children}
    </div>
  );
}

function SocialIcon({ name }: { name: keyof typeof ICON }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d={ICON[name]} />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="tgva-nav-stroke">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="tgva-nav-chev">
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="tgva-nav-arrow">
      <path d="M3 8h9.5M8.5 4l4 4-4 4" />
    </svg>
  );
}
