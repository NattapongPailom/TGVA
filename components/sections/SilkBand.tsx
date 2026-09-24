import { regions } from "@/content/regions";
import { fleet } from "@/content/fleet";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The band between the people and the network.
 *
 * Every figure below is counted from the content files rather than written
 * here, so adding a destination or an aircraft type moves the number with it
 * and there is nowhere for the two to drift apart.
 */
const destinations = regions.flatMap((region) => region.destinations);
const countries = new Set(destinations.map((destination) => destination.country)).size;
const makers = [...new Set(fleet.map((aircraft) => aircraft.maker))].join(", ");
const regionNames = regions
  .map((region) => region.title.charAt(0) + region.title.slice(1).toLowerCase())
  .join(", ");

const facts = [
  {
    label: `${destinations.length} Destinations`,
    detail: `Across ${countries} countries`,
    icon: "pin" as const,
  },
  {
    label: `${fleet.length} Aircraft Types`,
    detail: makers,
    icon: "tail" as const,
  },
  {
    label: `${regions.length} Regions`,
    detail: regionNames,
    icon: "globe" as const,
  },
  {
    label: "Infinite Flight",
    detail: "Where every TGVA flight is flown",
    icon: "device" as const,
  },
];

export function SilkBand() {
  return (
    <section className="tgva-band" aria-label="Thai Airways Virtual at a glance">
      <div className="tgva-band-rule" />

      {/* Set as a shape rather than a heading: it bleeds past both edges and
          sinks out of the page, and the cards below rest on its foot. The
          facts carry the same information in text, so nothing is lost to a
          reader who never sees it. */}
      <p className="tgva-band-word" aria-hidden>
        TGVA THAIAIRWAY
      </p>

      <div className="tgva-facts">
        {facts.map((fact, i) => (
          <Reveal key={fact.label} index={i} className="tgva-fact">
            <FactIcon name={fact.icon} />
            <div>
              <b>{fact.label}</b>
              <small>{fact.detail}</small>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const PATHS = {
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  tail: <path d="M3 14.5 10.5 12V5.2a1.5 1.5 0 0 1 3 0V12L21 14.5v2L13.5 15v3.4l2.2 1.6v1.4L12 20.4 8.3 21.4V20l2.2-1.6V15L3 16.5Z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.4 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.4-3.5-8.5S9.7 5.9 12 3.5Z" />
    </>
  ),
  device: (
    <>
      <rect x="6" y="2.6" width="12" height="18.8" rx="2.4" />
      <path d="M9.2 13.4 11 12.9l1.6.9 2.5-.9-2.7-2.5 1.1-.4 3.4 1.7" />
    </>
  ),
};

function FactIcon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      {PATHS[name]}
    </svg>
  );
}
