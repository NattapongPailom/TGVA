/** Shared transport glyphs — used by the control bar and the toggle burst. */

export function PlayIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`${className} fill-current`}>
      <path d="M8 5.14v13.72L19 12 8 5.14Z" />
    </svg>
  );
}

export function PauseIcon({ className = "size-4.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`${className} fill-current`}>
      <path d="M6.5 4.75h3.75v14.5H6.5zM13.75 4.75h3.75v14.5h-3.75z" />
    </svg>
  );
}

function SpeakerBody() {
  return <path d="M4 9.4h3.3L12 5.2v13.6L7.3 14.6H4z" className="fill-current" />;
}

export function SoundOnIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5">
      <SpeakerBody />
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M15.4 9.3a3.7 3.7 0 0 1 0 5.4" />
        <path d="M17.9 6.8a7.2 7.2 0 0 1 0 10.4" />
      </g>
    </svg>
  );
}

export function SoundOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5">
      <SpeakerBody />
      <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M16 9.6l4.4 4.8M20.4 9.6L16 14.4" />
      </g>
    </svg>
  );
}

/**
 * Captions. The rounded plate with two bars is the mark every player uses for
 * this, so it is read before it is looked at.
 */
export function CaptionsIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5">
      <rect
        x="2.6"
        y="4.8"
        width="18.8"
        height="14.4"
        rx="3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={on ? 1 : 0.55}
      >
        <path d="M9.1 10.4a2.4 2.4 0 1 0 0 3.2" />
        <path d="M16.6 10.4a2.4 2.4 0 1 0 0 3.2" />
      </g>
    </svg>
  );
}
