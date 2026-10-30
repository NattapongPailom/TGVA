import { join } from "@/content/site";
import { regions } from "@/content/regions";
import { fleet } from "@/content/fleet";
import { ActionLink } from "@/components/ui/ActionLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { ApproachStage, type Figure } from "@/components/sections/ApproachStage";

/** Counted, never typed: adding a destination or a type moves the figure with it. */
const destinations = regions.flatMap((region) => region.destinations);
const countries = new Set(destinations.map((destination) => destination.country)).size;

/**
 * The two rows sit at 56% and 76% of the picture's height, where the silhouette
 * has narrowed to leave at least 22% clear on each side. Any higher and the
 * wings are in the way: at the wing line the span reaches both edges.
 */
const figures: Figure[] = [
  { value: String(destinations.length), label: "Destinations", side: "l" },
  { value: String(countries), label: "Countries", side: "r" },
  { value: String(fleet.length), label: "Aircraft types", side: "l", low: true },
  { value: "1", label: "Home base", side: "r", low: true },
];

/**
 * The closing statement, and the last thing between a reader and the membership
 * form. "The Approach".
 *
 * The aircraft is a true cut-out, so it belongs to the page rather than to a
 * panel, and it fills the page container outright. A gold hairline runs at wing
 * height — a horizon for it to stand on, with its end ticks falling exactly on
 * the wingtips — and the figures sit below in the clear air either side of the
 * gear, mirrored, because a nose-on aircraft is symmetrical and the block can
 * be too.
 *
 * Three numbers measured off public/images/approach-aircraft.png govern the
 * layout, so a replacement aircraft means re-measuring rather than re-judging:
 * the wing line at 43.3% of the picture's height, the fin band in the top 19%
 * where the shape is a hairline, and the gear meeting the ground at 92%.
 *
 * It fills the viewport on purpose: arriving here should show this and nothing
 * else, which is also what keeps the detail footer hidden behind it — see the
 * stack in app/page.tsx. That stack is why this block stays opaque.
 */
export function JoinUs() {
  return (
    <section id="join" className="tgva-approach relative z-1 flex min-h-svh flex-col justify-center">
      <div className="tgva-approach-inner">
        <Reveal>
          <Eyebrow tone="gold-deep">{join.eyebrow}</Eyebrow>
        </Reveal>

        <div className="tgva-approach-scene">
          <Reveal index={1}>
            <h2 className="tgva-approach-head">{join.heading}</h2>
          </Reveal>

          <ApproachStage figures={figures} />
        </div>

        <Reveal index={2}>
          <p className="tgva-approach-caption">{join.caption}</p>

          <div className="tgva-approach-cta">
            {join.actions.map((action, i) => (
              <ActionLink
                key={action.href}
                href={action.href}
                variant={action.variant}
                motion={i === 0 ? "roll" : "still"}
              >
                {action.label}
              </ActionLink>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
