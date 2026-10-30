/**
 * The small wide-tracked label the site signs its sections with.
 *
 * Six hand-rolled versions of this had drifted apart — 10px/0.24em, 10.5px/0.2em,
 * 10.5px/0.18em, 11px/0.34em, 12px/0.3em, 13px/0.26em — four of them outside the
 * range the design system actually commits to. One component, one size, one
 * tracking: when the label looks different in two places, it is because the tone
 * is different, not because two people typed two numbers.
 */
export type EyebrowTone = "brand" | "gold" | "gold-deep" | "cream";

const tones: Record<EyebrowTone, string> = {
  /** On white, next to a heading. */
  brand: "text-brand-light",
  /** On an orchid ground, where gold is the light. */
  gold: "text-gold",
  /** On white, where plain gold would drop under 4.5:1. */
  "gold-deep": "text-gold-deep",
  /** On an orchid ground, when gold is already spent elsewhere in the view. */
  cream: "text-cream/80",
};

export function Eyebrow({
  children,
  tone = "brand",
  className = "",
}: {
  children: string;
  tone?: EyebrowTone;
  className?: string;
}) {
  return (
    <p
      className={`font-display text-[11.5px] font-bold tracking-[0.26em] uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </p>
  );
}
