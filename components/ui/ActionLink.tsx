"use client";

import Link from "next/link";
import { scrollToHash } from "@/lib/hash-scroll";
import { useState, type ComponentProps, type MouseEvent } from "react";

/**
 * `primary`, `outline` and `light` belong to the orchid grounds, where cream is
 * the readable colour and gold is the light. `gold` and `line` are their pair
 * for the white grounds — the closing block is one — where cream on near-white
 * is invisible and the orchid has to do the work instead.
 */
export type ActionVariant = "primary" | "outline" | "light" | "gold" | "line";

/**
 * How much the button asks for. `still` is the default and belongs on most of
 * them: colours swap on hover and nothing else moves. `roll` and `beacon` are
 * for the handful of calls to action the page is actually built around — spend
 * them sparingly or none of them reads as important.
 */
export type ActionMotion = "still" | "roll" | "beacon";

/** Nose north, turned east below so it reads as leaving the button. */
const PLANE =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

/**
 * A link that leaves the site says so before it is clicked, not after. The mark
 * is drawn rather than a unicode arrow so it carries the same stroke weight as
 * the rest of the system, and the sentence beside it names the destination for
 * anyone who cannot see the mark.
 */
function departureNote(href: string) {
  if (href.includes("docs.google.com/forms") || href.includes("forms.gle"))
    return "opens the membership form on Google Forms in a new tab";
  return "opens in a new tab";
}

function DepartureMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="ml-2 size-[0.85em] shrink-0 self-center"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
    >
      <path d="M3.4 8.6 8.6 3.4" />
      <path d="M4.6 3.4h4v4" />
    </svg>
  );
}

/** Kept in step with the flight keyframes in globals.css. */
const LAUNCH_MS = 1200;

const base =
  "relative isolate inline-flex items-center rounded-full font-display font-bold tracking-[0.1em] transition-colors duration-500";

/**
 * Each variant names its resting shell, the plain hover it falls back to, the
 * panel that drops in when it rolls, and the colour the incoming label copy is
 * drawn in. Never override them through `className` — two competing utilities
 * resolve by stylesheet order, not by which one you passed last.
 */
const variants: Record<
  ActionVariant,
  { shell: string; hover: string; cover: string; alt: string }
> = {
  primary: {
    shell: "bg-gold text-ink",
    hover: "hover:bg-cream hover:text-brand",
    cover: "bg-cream",
    alt: "[--tgva-btn-alt:var(--color-brand)]",
  },
  outline: {
    shell: "border-[1.5px] border-cream/50 text-cream",
    hover: "hover:border-gold hover:text-gold",
    cover: "bg-gold",
    alt: "border-gold/70 [--tgva-btn-alt:var(--color-ink)]",
  },
  light: {
    shell: "bg-cream/90 text-brand",
    hover: "hover:bg-gold hover:text-ink",
    cover: "bg-gold",
    alt: "[--tgva-btn-alt:var(--color-ink)]",
  },
  /**
   * Gold on white. It reverses to Royal Orchid rather than to cream: `primary`
   * drops a cream panel in, which on a near-white ground leaves the pill with
   * no edge and the label floating.
   */
  gold: {
    shell: "bg-gold text-ink",
    hover: "hover:bg-brand hover:text-cream",
    cover: "bg-brand",
    alt: "[--tgva-btn-alt:var(--color-cream)]",
  },
  /**
   * The outlined button for white grounds. `outline` is drawn in cream for the
   * orchid grounds and disappears completely here.
   */
  line: {
    shell: "border-[1.5px] border-brand/28 text-brand",
    hover: "hover:border-brand hover:bg-brand hover:text-cream",
    cover: "bg-brand",
    alt: "border-brand [--tgva-btn-alt:var(--color-cream)]",
  },
};

/**
 * `compact` is for the site header, where a button sized for a section would
 * set the height of the whole bar.
 */
export type ActionSize = "default" | "compact";

type Props = Omit<ComponentProps<typeof Link>, "children"> & {
  variant?: ActionVariant;
  motion?: ActionMotion;
  size?: ActionSize;
  /** A string, because the roll draws a second copy of it from `data-label`. */
  children: string;
};

export function ActionLink({
  variant = "primary",
  motion = "still",
  size: scale = "default",
  className = "",
  href,
  children,
  onClick,
  ...props
}: Props) {
  const [launching, setLaunching] = useState(false);
  const opensNewTab = typeof href === "string" && href.startsWith("http");
  const departure = opensNewTab ? departureNote(href as string) : null;
  const animated = motion !== "still";
  const style = variants[variant];

  /**
   * An animated link that leaves the site flies the plane out before the tab
   * opens. A click's user activation lasts several seconds, so opening this
   * late is still allowed; should a blocker refuse anyway, navigate in place
   * rather than silently doing nothing.
   */
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    // Same-page anchors scroll themselves; see lib/hash-scroll.
    if (typeof href === "string" && href.includes("#") && scrollToHash(href)) {
      event.preventDefault();
      return;
    }

    if (!animated || !opensNewTab || launching || event.defaultPrevented) return;
    // Leave the browser's own open-in-new-tab gestures alone.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

    event.preventDefault();
    setLaunching(true);

    const wait = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : LAUNCH_MS;
    window.setTimeout(() => {
      if (!window.open(href, "_blank", "noopener,noreferrer")) window.location.href = href;
      setLaunching(false);
    }, wait);
  };

  const size =
    scale === "compact"
      ? "px-6 py-[13px] text-[13.5px]"
      : motion === "beacon"
        ? "px-9 py-[18px] text-[15px]"
        : "px-7 py-[15px] text-sm";
  const skin = animated
    ? `tgva-btn overflow-hidden ${style.alt} ${motion === "beacon" ? "tgva-btn-beacon" : ""}`
    : style.hover;

  return (
    <Link
      href={href}
      {...(opensNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
      onClick={handleClick}
      className={`${base} ${size} ${style.shell} ${skin} ${className}`}
    >
      {animated ? (
        <>
          <span aria-hidden className="absolute inset-0 -z-1 overflow-hidden">
            <span className={`tgva-btn-cover block h-full w-full ${style.cover}`} />
          </span>

          <span className="tgva-btn-clip">
            <span className="tgva-btn-label" data-label={children}>
              {children}
            </span>
          </span>
          {opensNewTab ? <DepartureMark /> : null}

          {launching ? (
            <span aria-hidden className="absolute inset-0 z-1 overflow-hidden">
              <span className="tgva-btn-trail absolute inset-0 block bg-black" />
              <svg
                viewBox="0 0 24 24"
                className="tgva-btn-plane absolute top-1/2 size-8 -translate-y-1/2 fill-gold"
              >
                <path d={PLANE} transform="rotate(90 12 12)" />
              </svg>
            </span>
          ) : null}
        </>
      ) : (
        <>
          {children}
          {opensNewTab ? <DepartureMark /> : null}
        </>
      )}

      {departure ? <span className="sr-only"> — {departure}</span> : null}
    </Link>
  );
}
