/**
 * Hairline rule centred on two diamonds — the divider used between story beats.
 *
 * It shipped unused while the same pair of diamonds was re-drawn by hand in CSS
 * for the mission label. `label` is that case: the rule parts around a centred
 * caption instead of running straight through.
 */
export function DiamondRule({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-4.5 ${className}`} aria-hidden={label ? undefined : true}>
      <span aria-hidden className="h-px flex-1 bg-linear-to-r from-brand/15 to-gold/75" />
      <span aria-hidden className="block size-1.25 rotate-45 bg-brand-light/55" />
      <span aria-hidden className="block size-2.25 rotate-45 bg-gold" />

      {label ? (
        <span className="font-display text-[11.5px] font-bold tracking-[0.26em] whitespace-nowrap text-gold-deep uppercase">
          {label}
        </span>
      ) : null}

      <span aria-hidden className="block size-2.25 rotate-45 bg-gold" />
      <span aria-hidden className="block size-1.25 rotate-45 bg-brand-light/55" />
      <span aria-hidden className="h-px flex-1 bg-linear-to-r from-gold/75 to-brand/15" />
    </div>
  );
}
