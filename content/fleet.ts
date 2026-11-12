/**
 * The fleet, type by type.
 *
 * Straight from the team's document: the types TGVA flies, and nothing else.
 * There are no seat counts, ranges or aircraft totals here because the team has
 * published none — the section shows each type's name and its shape, which is
 * all that can be said truthfully today.
 *
 * `length` and `height` are the type's published dimensions in metres and exist
 * for one reason: AircraftSilhouette draws every profile to a single scale from
 * them. They are never printed on the page.
 */
export type Maker = "Airbus" | "Boeing" | "McDonnell Douglas";

export type Aircraft = {
  /** The code the timetable writes. */
  code: string;
  maker: Maker;
  name: string;
  /** Metres. Drawing scale only. */
  length: number;
  height: number;
  /**
   * A full-colour side view in the airline's livery, cropped to the airframe.
   * They all face right, nose to the right edge, because that is the way the
   * livery reads, and every one shows the right-hand side: none is mirrored,
   * so every title reads the right way round. A type without one
   * falls back to its drawn silhouette.
   * The untouched originals are in _source-media/fleet-originals.
   */
  image?: AircraftImage;
  /** Flown once, not now. Kept so the fleet can show what it used to fly. */
  retired?: true;
  /**
   * In neither fleet, but still named by the timetable. Resolvable so a route
   * can print it properly; counted nowhere and shown in no fleet list.
   */
  legacy?: true;
};

/** A file under public/, and its intrinsic size in pixels. */
export type AircraftImage = { src: string; width: number; height: number; credit?: PhotoCredit };

/**
 * Who took a photograph and the licence it is used under. A Creative Commons
 * photograph is credited by name, with links to its page and its licence, and
 * the footer lists every one. They were cut out of their backgrounds and
 * their colour lifted, which the footer says too.
 */
export type PhotoCredit = { author: string; source: string; license: string; licenseUrl: string };

/**
 * Every type the site can name, in one list, in three groups.
 *
 * The owner's breakdown of 2 Oct 2026 is eight active and four retired. A32Q
 * is in neither, but the timetable still assigns it to two routes — so it sits
 * here as `legacy`: resolvable by a route ticket, counted nowhere.
 *
 * A route prints whatever the timetable gave it. Whether the airline still
 * flies that type is a fact about the fleet, not about the route.
 */
const allTypes: Aircraft[] = [
  { code: "A320", maker: "Airbus", name: "A320", length: 37.6, height: 11.8,
    image: { src: "/images/airbus/airbus-a320.png", width: 886, height: 270 } },
  { code: "A321", maker: "Airbus", name: "A321-neo", length: 44.5, height: 11.8,
    image: { src: "/images/airbus/airbus-a321.png", width: 898, height: 237 } },
  { code: "A333", maker: "Airbus", name: "A330-300", length: 63.7, height: 16.8,
    image: { src: "/images/airbus/airbus-a330-300.png", width: 914, height: 237 } },
  { code: "A359", maker: "Airbus", name: "A350-900", length: 66.8, height: 17.1,
    image: { src: "/images/airbus/airbus-a350-900.png", width: 939, height: 236 } },

  { code: "B772", maker: "Boeing", name: "777-200", length: 63.7, height: 18.5,
    image: { src: "/images/boeing/boeing-777-200.png", width: 2000, height: 570,
      credit: { author: "N509FZ", license: "CC BY-SA 4.0",
        source: "https://commons.wikimedia.org/wiki/File:HS-TJR@PEK_(20240515174754).jpg",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" } } },
  { code: "B77W", maker: "Boeing", name: "777-300ER", length: 73.9, height: 18.6,
    image: { src: "/images/boeing/boeing-777-300er.png", width: 883, height: 217 } },
  { code: "B788", maker: "Boeing", name: "787-8", length: 56.7, height: 16.9,
    image: { src: "/images/boeing/boeing-787-8.png", width: 2000, height: 629,
      credit: { author: "contri", license: "CC BY-SA 2.0",
        source: "https://commons.wikimedia.org/wiki/File:Thai_Airways_International_Boeing_787-8_(HS-TQA-35315-190)_(20578573522).jpg",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/" } } },
  { code: "B789", maker: "Boeing", name: "787-9", length: 62.8, height: 17.0,
    image: { src: "/images/boeing/boeing-787-9.png", width: 898, height: 236 } },

  // Retired. The document names the A340 without a variant; the profile is
  // drawn to the -600, the longest of them, and no figure for it is shown.
  { code: "A340", maker: "Airbus", name: "A340", length: 75.4, height: 17.3, retired: true,
    image: { src: "/images/history/airbus-a340.png", width: 2000, height: 477,
      credit: { author: "QFSE Media", license: "CC BY-SA 3.0 NZ",
        source: "https://commons.wikimedia.org/wiki/File:01_Thai_Airways_HS-TNC.jpg",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/nz/" } } },
  { code: "A380", maker: "Airbus", name: "A380", length: 72.7, height: 24.1, retired: true,
    image: { src: "/images/history/airbus-a380.png", width: 2000, height: 664,
      credit: { author: "Alec Wilson", license: "CC BY-SA 2.0",
        source: "https://commons.wikimedia.org/wiki/File:HS-TUD_(27782856595).jpg",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/" } } },
  { code: "B744", maker: "Boeing", name: "747-400", length: 70.7, height: 19.4, retired: true,
    image: { src: "/images/history/boeing-747-400.png", width: 2000, height: 573,
      credit: { author: "Alec Wilson", license: "CC BY-SA 2.0",
        source: "https://commons.wikimedia.org/wiki/File:HS-TGP_(27148850934).jpg",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/" } } },
  // The MD-11 is in the airline's earlier white-and-magenta colours: the only
  // right-side photographs of it in the later purple ones are faded prints.
  { code: "MD11", maker: "McDonnell Douglas", name: "MD-11", length: 61.6, height: 17.6, retired: true,
    image: { src: "/images/history/mcdonnell-douglas-md-11.png", width: 2000, height: 628,
      credit: { author: "Aero Icarus", license: "CC BY-SA 2.0",
        source: "https://commons.wikimedia.org/wiki/File:266bb_-_Thai_Airways_International_MD-11;_HS-TME@ZRH;07.11.2003_(6113407256).jpg",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/" } } },

  // Legacy. Named by THA694 and THA610 and by nothing else on the site. It is
  // the same airframe as the active A321 above, so it carries the same name —
  // A321-neo, spelled one way everywhere at the owner's request of 30 Oct 2026
  // — and the same image. It stays a separate entry because its code differs.
  { code: "A32Q", maker: "Airbus", name: "A321-neo", length: 44.5, height: 11.8, legacy: true,
    image: { src: "/images/airbus/airbus-a321.png", width: 898, height: 237 } },
];

/** What the airline flies today. Every count on the site reads this. */
export const fleet: Aircraft[] = allTypes.filter((a) => !a.retired && !a.legacy);

/** What it used to. */
export const retired: Aircraft[] = allTypes.filter((a) => a.retired);

/** Every credited photograph, once each, in list order: what the footer credits. */
export const photoCredits = allTypes.flatMap((a) =>
  a.image?.credit && !a.legacy ? [{ name: a.name, credit: a.image.credit }] : [],
);

/**
 * Derived, not written down. McDonnell Douglas has no active type left, and a
 * maker with none would reach `makerSummary`, whose `reduce` carries no seed
 * and throws on an empty list — the fleet section would go down with it.
 */
export const makers: Maker[] = [...new Set(fleet.map((a) => a.maker))];

/** The makers with something in the history, which is not the same list. */
export const retiredMakers: Maker[] = [...new Set(retired.map((a) => a.maker))];

/** The scale every silhouette on the page is drawn to. */
/* Across every type, flown or not, so a retired silhouette is drawn to the same
   scale as the ones beside it. */
export const longest = Math.max(...allTypes.map((a) => a.length));
export const tallest = Math.max(...allTypes.map((a) => a.height));

export const typesBy = (maker: Maker) => fleet.filter((a) => a.maker === maker);

export const retiredBy = (maker: Maker) => retired.filter((a) => a.maker === maker);

/** What a maker's opening panel says, read off the list rather than written down. */
export function makerSummary(maker: Maker) {
  const types = typesBy(maker);
  return {
    /** The longest airframe the maker has here — the shape its panel wears. */
    flagship: types.reduce((a, b) => (b.length > a.length ? b : a)),
    names: types.map((a) => a.name).join("  ·  "),
  };
}

/**
 * The timetable writes aircraft as type codes; these are the types they name.
 *
 * It searches all three groups, so every code the timetable uses resolves to a
 * real aircraft and a route never reports one as unpublished. That message is
 * still there for a code in none of them — which now means a typo, and is the
 * only thing that would catch one.
 */
export const typeByCode = (code: string) => allTypes.find((a) => a.code === code);

export const typeByName = (name: string) => allTypes.find((a) => a.name === name);

/**
 * Splits an aircraft cell into codes. The document writes some of them as
 * "B788/789", dropping the letter on the second token — anything starting with
 * a digit borrows the letter in front of it.
 */
export function aircraftCodes(raw?: string): string[] {
  if (!raw) return [];
  let prefix = "";
  return raw.split("/").map((token) => {
    let code = token.trim();
    if (/^\d/.test(code) && prefix) code = prefix + code;
    prefix = code[0] ?? "";
    return code;
  });
}
