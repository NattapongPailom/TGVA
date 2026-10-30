import { regions } from "@/content/regions";
import { fleet } from "@/content/fleet";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The network, totalled.
 *
 * It arrives after the chart and the fleet, so every figure here is a count of
 * something the reader has just been shown rather than a claim made in advance.
 *
 * Every figure is counted from the content files rather than written here, so
 * adding a destination or an aircraft type moves the number with it and there
 * is nowhere for the two to drift apart.
 */
const destinations = regions.flatMap((region) => region.destinations);
const countries = new Set(destinations.map((destination) => destination.country)).size;
const makers = [...new Set(fleet.map((aircraft) => aircraft.maker))].join(" · ");
const regionNames = regions
  .map((region) => region.title.charAt(0) + region.title.slice(1).toLowerCase())
  .join(" · ");

/**
 * `figure` marks a real count, which is what earns Plex Mono. The last entry is
 * a name, not a measurement, so it is set in the display face like any other
 * proper noun.
 */
const facts = [
  { value: String(destinations.length), label: "Destinations", detail: `In ${countries} countries`, figure: true },
  { value: String(fleet.length), label: "Aircraft types", detail: makers, figure: true },
  { value: String(regions.length), label: "Regions", detail: regionNames, figure: true },
  { value: "Infinite Flight", label: "Flown in", detail: "Every TGVA flight, without exception", figure: false },
];

export function SilkBand() {
  return (
    <section className="tgva-band" aria-label="The TGVA network, totalled">
      <div className="tgva-band-rule" />

      {/* Set as a shape rather than a heading: it bleeds past both edges and
          sinks out of the page, and the summary below rests on its foot. The
          figures carry the same information in text, so nothing is lost to a
          reader who never sees it.

          Two changes from the version this restores. The name is spelled the
          way the airline spells it — it used to read "TGVA THAIAIRWAY", a
          missing space and a missing S at 240px. And the sink is a mask over
          solid Royal Orchid rather than a gradient fill on the text itself:
          same fade, but the colour stays one documented token instead of
          becoming decoration. */}
      <p className="tgva-band-word" aria-hidden>
        TGVA THAI AIRWAYS VIRTUAL
      </p>

      <div className="tgva-band-inner">

        {/* A ruled summary rather than four floating cards: the figures are the
            largest thing in the block and the hairlines do all the dividing,
            which is how the rest of the site draws structure on white. */}
        <dl className="tgva-band-table">
          {facts.map((fact, i) => (
            /* Reading order is label, figure, detail — "Destinations, 67, in 18
               countries" — which is also what a `<dl>` requires: every `dt`
               before its `dd`s. The figure is lifted above the label visually
               by CSS order alone. */
            <Reveal key={fact.label} index={i} className="tgva-band-cell">
              <dt>{fact.label}</dt>
              <dd className={fact.figure ? "tgva-band-figure" : "tgva-band-figure is-name"}>
                {fact.value}
              </dd>
              <dd className="tgva-band-detail">{fact.detail}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
