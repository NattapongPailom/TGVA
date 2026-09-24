import { destinationTicker } from "@/content/site";

/** Seconds each destination takes to cross the strip — the reading pace. */
const SECONDS_PER_DESTINATION = 1.6;

/** Continuous marquee. The list is duplicated so the loop has no visible seam. */
export function DestinationTicker() {
  const line = destinationTicker.join(" · ");
  // Scale the loop with the list: a fixed duration would speed the whole strip
  // up every time a destination is added, until nothing is readable.
  const duration = destinationTicker.length * SECONDS_PER_DESTINATION;

  return (
    <div aria-hidden className="overflow-hidden bg-brand py-4 text-cream/85">
      <div
        className="flex w-max gap-14 font-display text-sm font-bold tracking-[0.22em] whitespace-nowrap"
        style={{ animation: `tgva-marquee ${duration}s linear infinite` }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i}>{line} ·</span>
        ))}
      </div>
    </div>
  );
}
