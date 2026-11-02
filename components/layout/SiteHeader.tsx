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
import { SocialIcon } from "@/components/ui/SocialIcon";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { scrollToHash } from "@/lib/hash-scroll";

/** Above the hero the bar always shows; hiding it there would serve nothing. */
const REVEAL_ZONE = 180;
/** Rubber-band and sub-pixel jitter shouldn't flip it — only a real scroll. */
const THRESHOLD = 8;
/** Past this the bar draws itself in: shorter, with a smaller logo. */
const COMPACT_ZONE = 120;

/** Every section the bar can mark, in the order they appear on the page. */
const SECTIONS = nav.flatMap((item) => item.sections);
const KEY_OF = new Map(nav.flatMap((item) => item.sections.map((id) => [id, item.key])));

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
  const burgerRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<string, HTMLElement>());
  const closeTimer = useRef(0);

  const activeKey = active ? (KEY_OF.get(active) ?? null) : null;

  useScrollLock(sheetOpen);

  /* The open sheet is modal: Tab cycles through the bar and the sheet — the
     burger stays in reach, so it can be closed the way it was opened — and
     never walks out into the page under the scrim. Every way of closing it
     (the burger, Escape, the scrim, a link) hands focus back to the burger;
     a tap on the scrim otherwise left it on <body>. */
  useFocusTrap(headerRef, sheetOpen, { returnTo: burgerRef });

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
      // A dropdown closed with focus inside it would hide the item holding
      // focus, and focus would drop to <body>. It goes back to the trigger.
      const group = (document.activeElement as Element | null)?.closest(".tgva-nav-group");
      group?.querySelector<HTMLButtonElement>(":scope > button")?.focus();
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
          {/* Both marks ship: the gold one reads on the orchid ground the bar
              rests on, the purple one on the white it turns once the page
              scrolls. Only one is ever visible, and the alt text sits on that
              one so the pair is announced once.

              The gold mark is the supplied artwork with its purple field keyed
              out. The field was Royal Orchid, not the Orchid Deep this bar sits
              on, so left in it read as a lighter rectangle; removing it also
              lets the bar show through the orchid's loops, which is how the
              mark is drawn to work. */}
          {/* Left to the router, the logo scrolled up only once: with the
              address already at /#top a second tap changed nothing, and with
              the sheet open the tap was swallowed by its scroll lock. On the
              home page it closes whatever is open and scrolls by hand, a frame
              later, once the lock has lifted. Elsewhere the router takes it. */}
          <Link
            href="/#top"
            className="tgva-nav-logo"
            aria-label="TGVA — Thai Airways Virtual"
            onClick={(event) => {
              setOpenMenu(null);
              setSheetOpen(false);
              if (!document.getElementById("top")) return;
              event.preventDefault();
              requestAnimationFrame(() => scrollToHash("/#top"));
            }}
          >
            <Image
              className="tgva-logo-light"
              src="/images/logo-tgva-gold.png"
              alt=""
              width={1179}
              height={339}
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

                  {/* Inert while closed. The stylesheet holds `visibility`
                      until the 350ms fade has run, so without this a Tab in
                      that window landed on an item that was disappearing. */}
                  <div className="tgva-nav-menu" inert={openMenu !== item.key}>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={(event) => {
                          setOpenMenu(null);
                          if (scrollToHash(child.href)) event.preventDefault();
                        }}
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
                  onClick={(event) => {
                    if (scrollToHash(item.href!)) event.preventDefault();
                  }}
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
            ref={burgerRef}
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
                        onClick={(event) => {
                          setSheetOpen(false);
                          if (scrollToHash(child.href)) event.preventDefault();
                        }}
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
                    onClick={(event) => {
                      setSheetOpen(false);
                      if (scrollToHash(item.href!)) event.preventDefault();
                    }}
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
                        {(channel.short ?? channel.label).toUpperCase()}
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
