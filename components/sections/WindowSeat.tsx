import { windowSeat } from "@/content/site";
import { ActionLink } from "@/components/ui/ActionLink";
import { Reveal } from "@/components/motion/Reveal";
import { OrchidMark } from "@/components/motion/OrchidMark";
import { WindowShade } from "@/components/sections/WindowShade";

/**
 * The window seat. A pause between the story and the operation: the reader
 * has heard what TGVA is, and is now sat at the window of one of its aircraft.
 *
 * Orchid Deep, so the long white run from the map through Inside TGVA breaks
 * here instead of continuing four blocks deep. One column, set like the
 * team's poster it comes from — window, tagline, rule — with the motto as
 * the gold in it, which is why the button is the outline one.
 */
export function WindowSeat() {
  return (
    <section id="windowseat" aria-labelledby="window-heading" className="tgva-window-seat bg-brand-deep">
      <div className="tgva-gutter mx-auto flex max-w-[1240px] flex-col items-center text-center">
        <WindowShade />

        <Reveal>
          <h2
            id="window-heading"
            className="mt-10 font-display text-[clamp(2rem,3.6vw,3.25rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance"
          >
            <span className="text-cream">{windowSeat.lead} </span>
            <span className="text-gold">{windowSeat.accent}</span>
            <br />
            <span className="text-white">{windowSeat.close}</span>
          </h2>
        </Reveal>

        <Reveal index={1} className="mt-8 flex w-full max-w-[26rem] flex-col items-center gap-8">
          <div aria-hidden className="flex w-full items-center gap-4">
            <span className="h-px flex-1 bg-linear-to-r from-cream/0 to-cream/30" />
            <OrchidMark className="size-6" />
            <span className="h-px flex-1 bg-linear-to-r from-cream/30 to-cream/0" />
          </div>
          <ActionLink href={windowSeat.action.href} variant="outline" motion="roll">
            {windowSeat.action.label}
          </ActionLink>
        </Reveal>
      </div>
    </section>
  );
}
