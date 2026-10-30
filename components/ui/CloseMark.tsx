/**
 * The dismiss mark.
 *
 * Drawn rather than set as ✕. A text glyph inherits the font's own weight and
 * metrics instead of the system's stroke, so it never quite matches the icons
 * beside it — and ✕ is missing from enough fonts to arrive as a fallback or a
 * box. This is one path at the stroke weight everything else in the system is
 * drawn with.
 *
 * `non-scaling-stroke` is what lets it be shared. The path lives in a 12-unit
 * viewBox, so without it the stroke thickens with the rendered size — the same
 * mark at 17px would come out at 2.1px where the 12px one is 1.5px, and the
 * system has exactly one hairline weight. This way the width is in device
 * pixels and the mark can be any size.
 */
export function CloseMark({ className = "size-3" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    >
      <path d="m3 3 6 6M9 3l-6 6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
