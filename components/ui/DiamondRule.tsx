/** Hairline rule centred on two diamonds — the divider used between story beats. */
export function DiamondRule({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center gap-4.5 ${className}`}>
      <span className="h-px flex-1 bg-linear-to-r from-brand/15 to-gold/75" />
      <span className="block h-2.25 w-2.25 rotate-45 bg-gold" />
      <span className="block h-1.25 w-1.25 rotate-45 bg-brand-light/55" />
      <span className="h-px flex-1 bg-linear-to-r from-gold/75 to-brand/15" />
    </div>
  );
}
