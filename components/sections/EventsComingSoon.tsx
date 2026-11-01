import { membershipFormUrl } from "@/content/site";
import { ActionLink } from "@/components/ui/ActionLink";

/** The same glyph the route ticket flies along its track. */
const PLANE =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

/**
 * The Events page while content/events.ts is empty — what every EVENTS link on
 * the site lands on until the calendar opens.
 *
 * One statement and two ways on, nothing else. The only aviation in it is a
 * single route line with an aircraft partway along: drawn, still, quiet. Join Us
 * is the site's own membership form, the same place the bar's JOIN US goes.
 */
export function EventsComingSoon() {
  return (
    <section className="tgva-soon" aria-labelledby="events-soon-title">
      <svg className="tgva-soon-route" viewBox="0 0 320 64" aria-hidden>
        <path className="tgva-soon-arc" d="M12 52 Q160 -4 308 52" />
        <circle cx="12" cy="52" r="4" />
        <circle cx="308" cy="52" r="4" />
        {/* A third of the way along, nose on the arc's tangent (about 6° up
            from level there); the disc breaks the line under the aircraft. */}
        <g transform="translate(118 26) rotate(84)">
          <circle r="14" className="tgva-soon-gap" />
          <path d={PLANE} transform="scale(0.95) translate(-12 -12)" />
        </g>
      </svg>

      <p className="tgva-soon-eyebrow">Events</p>
      <h1 id="events-soon-title" className="tgva-soon-title">
        Coming soon
      </h1>
      <p className="tgva-soon-body">
        Group flights, academy intakes and community nights are being scheduled. They will be
        listed here as soon as the first dates are set.
      </p>

      <div className="tgva-soon-actions">
        <ActionLink href={membershipFormUrl} variant="gold">
          JOIN US
        </ActionLink>
        <ActionLink href="/" variant="line">
          EXPLORE MAIN SITE
        </ActionLink>
      </div>
    </section>
  );
}
