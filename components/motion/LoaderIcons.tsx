import type { CSSProperties } from "react";
import { OrchidMark } from "@/components/motion/OrchidMark";

export type LoaderIconProps = { className?: string; style?: CSSProperties };

/**
 * Travel icons for the loading screen, drawn in the airline's own colours.
 * Gradients and clip paths are declared once in {@link LoaderDefs} and shared
 * by id, so the same fills can never drift apart between icons.
 */

export function LoaderDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <linearGradient id="tgva-ld-purple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6a34c0" />
          <stop offset="1" stopColor="#320963" />
        </linearGradient>
        <linearGradient id="tgva-ld-magenta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0409c" />
          <stop offset="1" stopColor="#c9106f" />
        </linearGradient>
        <linearGradient id="tgva-ld-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0c883" />
          <stop offset="1" stopColor="#c08c2e" />
        </linearGradient>
        <clipPath id="tgva-ld-clip-case">
          <rect x="8" y="19" width="48" height="35" rx="6" />
        </clipPath>
        <clipPath id="tgva-ld-clip-pass">
          <rect x="10" y="20" width="44" height="30" rx="5" />
        </clipPath>
      </defs>
    </svg>
  );
}

function BoardingPassIcon({ className, style }: LoaderIconProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className} style={style}>
      <rect x="10" y="20" width="44" height="30" rx="5" fill="#f7f3ee" />
      <g clipPath="url(#tgva-ld-clip-pass)">
        <rect x="10" y="20" width="17" height="30" fill="url(#tgva-ld-purple)" />
        <rect x="10" y="44" width="17" height="6" fill="url(#tgva-ld-magenta)" />
        <path
          d="M18.5 26.5l6 4.2v1.6l-6-1.8v3.6l1.8 1.4v1.3l-2.8-.8-2.8.8v-1.3l1.8-1.4v-3.6l-6 1.8v-1.6l6-4.2v-3.1a1 1 0 0 1 2 0z"
          fill="#f7f3ee"
        />
        <rect x="32" y="26" width="18" height="3" rx="1.5" fill="url(#tgva-ld-purple)" opacity=".85" />
        <rect x="32" y="33" width="13" height="3" rx="1.5" fill="url(#tgva-ld-magenta)" />
        <rect x="32" y="40" width="16" height="3" rx="1.5" fill="url(#tgva-ld-gold)" />
      </g>
      <path d="M28.5 20v30" stroke="#360a6f" strokeWidth="1.6" strokeDasharray="3 3" opacity=".45" />
      <rect
        x="10.8"
        y="20.8"
        width="42.4"
        height="28.4"
        rx="4.2"
        fill="none"
        stroke="#d8a657"
        strokeWidth="1.5"
        opacity=".6"
      />
    </svg>
  );
}

function PassportIcon({ className, style }: LoaderIconProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className} style={style}>
      <rect x="20" y="9" width="30" height="46" rx="3" fill="#f7f3ee" />
      <rect x="24" y="14" width="26" height="2.6" rx="1.3" fill="#cfc7dd" />
      <rect x="24" y="20" width="26" height="2.6" rx="1.3" fill="#cfc7dd" />
      <rect x="12" y="7" width="34" height="50" rx="4" fill="url(#tgva-ld-purple)" />
      <rect
        x="12.8"
        y="7.8"
        width="32.4"
        height="48.4"
        rx="3.4"
        fill="none"
        stroke="#d8a657"
        strokeWidth="1.5"
        opacity=".75"
      />
      <circle cx="29" cy="26" r="8.6" fill="none" stroke="url(#tgva-ld-gold)" strokeWidth="2.4" />
      <path
        d="M29 18.5c3.2 3.4 3.2 11.6 0 15M29 18.5c-3.2 3.4-3.2 11.6 0 15M20.6 26h16.8"
        fill="none"
        stroke="#d8a657"
        strokeWidth="1.5"
        opacity=".85"
      />
      <rect x="19" y="42" width="20" height="3" rx="1.5" fill="url(#tgva-ld-gold)" />
      <rect x="19" y="48" width="13" height="3" rx="1.5" fill="url(#tgva-ld-magenta)" />
    </svg>
  );
}

function SuitcaseIcon({ className, style }: LoaderIconProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className} style={style}>
      <path
        d="M24 19v-6a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v6"
        fill="none"
        stroke="url(#tgva-ld-gold)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="8" y="19" width="48" height="35" rx="6" fill="url(#tgva-ld-purple)" />
      <g clipPath="url(#tgva-ld-clip-case)">
        <rect x="23" y="19" width="6" height="35" fill="url(#tgva-ld-magenta)" />
        <rect x="29" y="19" width="3" height="35" fill="#f7f3ee" opacity=".9" />
        <rect x="32" y="19" width="6" height="35" fill="url(#tgva-ld-gold)" />
        <rect x="8" y="30" width="48" height="3.5" fill="#1b0538" opacity=".4" />
      </g>
      <rect
        x="8.5"
        y="19.5"
        width="47"
        height="34"
        rx="5.5"
        fill="none"
        stroke="#d8a657"
        strokeWidth="1.6"
        opacity=".6"
      />
      <rect x="13" y="28.5" width="7" height="6" rx="1.6" fill="url(#tgva-ld-gold)" />
      <rect x="44" y="28.5" width="7" height="6" rx="1.6" fill="url(#tgva-ld-gold)" />
    </svg>
  );
}

/**
 * Shown in this order. The orchid leads because it is the only one that names
 * the airline; the rest follow for visitors whose connection keeps them waiting.
 */
export const LOADER_ICONS = [
  { id: "orchid", Icon: OrchidMark },
  { id: "boarding-pass", Icon: BoardingPassIcon },
  { id: "passport", Icon: PassportIcon },
  { id: "suitcase", Icon: SuitcaseIcon },
] as const;
