import { type ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Eyebrow, type EyebrowTone } from "@/components/ui/Eyebrow";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  /**
   * `inline` sets the eyebrow beside the title on one baseline and runs a
   * hairline out to the right of both. `stack` sets the eyebrow above it, which
   * is what a heading does when it shares a column with body copy.
   */
  layout?: "inline" | "stack";
  /** Which ground it sits on. `cream` is the orchid grounds. */
  tone?: "ink" | "cream";
  /** Trailing hairline that fades toward the right. `inline` only. */
  rule?: boolean;
  className?: string;
};

const eyebrowTone: Record<"ink" | "cream", EyebrowTone> = { ink: "brand", cream: "gold" };

/**
 * Every section heading on the site. It existed before and was used once, with
 * its own defining rule switched off, while five other sections hand-rolled the
 * same two elements at six different sizes.
 */
export function SectionHeading({
  eyebrow,
  title,
  layout = "inline",
  tone = "ink",
  rule = true,
  className = "",
}: Props) {
  const heading = (
    <h2
      className={`font-display text-[clamp(2.375rem,4.6vw,3.875rem)] font-extrabold leading-[0.96] tracking-[-0.03em] text-balance ${
        tone === "cream" ? "text-white" : "text-brand"
      }`}
    >
      {title}
    </h2>
  );

  if (layout === "stack") {
    return (
      <Reveal className={className}>
        {eyebrow ? <Eyebrow tone={eyebrowTone[tone]}>{eyebrow}</Eyebrow> : null}
        <div className={eyebrow ? "mt-5" : ""}>{heading}</div>
      </Reveal>
    );
  }

  return (
    <Reveal className={`flex flex-wrap items-baseline gap-x-10 gap-y-5 ${className}`}>
      {eyebrow ? <Eyebrow tone={eyebrowTone[tone]}>{eyebrow}</Eyebrow> : null}
      {heading}
      {rule ? (
        <span
          className={`h-px flex-1 basis-32 ${
            tone === "cream"
              ? "bg-linear-to-r from-gold/90 to-cream/15"
              : "bg-linear-to-r from-gold/90 to-brand/15"
          }`}
          aria-hidden
        />
      ) : null}
    </Reveal>
  );
}
