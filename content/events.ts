/**
 * The events TGVA announces.
 *
 * The list is empty until the team hands over real ones. With nothing in it the
 * arrival announcement never opens, the bar shows no count and the Events page
 * says so plainly — which is the honest state, not a placeholder line-up nobody
 * can fly. Add an entry and all three follow it with nothing else to change.
 *
 * An example of a filled-in entry:
 *
 *   {
 *     id: "silk-route-night",
 *     title: "Silk Route Night",
 *     blurb: "One formation, one frequency, all the way to London.",
 *     poster: "/images/events/silk-route-night.jpg",
 *     route: "BKK → LHR",
 *     aircraft: "777-300ER · TG916",
 *     date: "Sat 19 Sep",
 *     time: "20:00 ICT",
 *     gate: "Discord",
 *     starts: "2026-09-19T20:00:00+07:00",
 *     joinUrl: "https://discord.gg/...",
 *   }
 */
export type TgvaEvent = {
  /** Stable and unique — a browser remembers a dismissal by this. */
  id: string;
  title: string;
  blurb: string;
  /** Poster artwork, under /public/images/events. */
  poster: string;
  /** Printed large on the stub: a city pair, or the programme's own name. */
  route: string;
  /** The line under it — type and flight number, or the intake. */
  aircraft: string;
  /** Written the way they should read: "Sat 19 Sep", "20:00 ICT". */
  date: string;
  time: string;
  /** Where it happens — Discord, a server, a network. */
  gate: string;
  /** ISO 8601 with an offset. The only field the countdown reads. */
  starts: string;
  /** Where JOIN THE FLIGHT goes. */
  joinUrl: string;
};

export const events: TgvaEvent[] = [];
