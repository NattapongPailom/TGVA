import { Reveal } from "@/components/motion/Reveal";

type Props = {
  eyebrow?: string;
  title: string;
  /** Trailing hairline that fades toward the right; used by most sections. */
  rule?: boolean;
};

export function SectionHeading({ eyebrow, title, rule = true }: Props) {
  return (
    <Reveal className="flex flex-wrap items-baseline gap-x-10 gap-y-5">
      {eyebrow ? (
        <p className="font-display text-xs font-bold tracking-[0.26em] text-brand-light">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-[clamp(2.375rem,4.6vw,3.875rem)] font-extrabold leading-none tracking-[-0.03em] text-brand text-balance">
        {title}
      </h2>
      {rule ? (
        <span className="h-px flex-1 basis-32 bg-linear-to-r from-gold/90 to-brand/15" aria-hidden />
      ) : null}
    </Reveal>
  );
}
