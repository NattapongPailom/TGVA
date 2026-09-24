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
  /** The code the timetable writes — A32Q is the team's code for the A321neo. */
  code: string;
  maker: Maker;
  name: string;
  /** Metres. Drawing scale only. */
  length: number;
  height: number;
};

export const fleet: Aircraft[] = [
  { code: "A320", maker: "Airbus", name: "A320", length: 37.6, height: 11.8 },
  { code: "A321", maker: "Airbus", name: "A321", length: 44.5, height: 11.8 },
  { code: "A32Q", maker: "Airbus", name: "A321neo", length: 44.5, height: 11.8 },
  { code: "A333", maker: "Airbus", name: "A330-300", length: 63.7, height: 16.8 },
  // The document names the A340 without a variant; the profile is drawn to the
  // -600, the longest of them, and no figure for it is shown anywhere.
  { code: "A340", maker: "Airbus", name: "A340", length: 75.4, height: 17.3 },
  { code: "A359", maker: "Airbus", name: "A350-900", length: 66.8, height: 17.1 },
  { code: "A380", maker: "Airbus", name: "A380", length: 72.7, height: 24.1 },

  { code: "B772", maker: "Boeing", name: "777-200", length: 63.7, height: 18.5 },
  { code: "B77W", maker: "Boeing", name: "777-300ER", length: 73.9, height: 18.6 },
  { code: "B744", maker: "Boeing", name: "747-400", length: 70.7, height: 19.4 },
  { code: "B788", maker: "Boeing", name: "787-8", length: 56.7, height: 16.9 },
  { code: "B789", maker: "Boeing", name: "787-9", length: 62.8, height: 17.0 },

  { code: "MD11", maker: "McDonnell Douglas", name: "MD-11", length: 61.6, height: 17.6 },
];

export const makers: Maker[] = ["Airbus", "Boeing", "McDonnell Douglas"];

/** Which edge a maker's board arrives from — and so which way it is dragged back. */
export const arrivesFrom: Record<Maker, "left" | "right"> = {
  Airbus: "left",
  Boeing: "right",
  "McDonnell Douglas": "right",
};

/** The scale every silhouette on the page is drawn to. */
export const longest = Math.max(...fleet.map((a) => a.length));
export const tallest = Math.max(...fleet.map((a) => a.height));

export const typesBy = (maker: Maker) => fleet.filter((a) => a.maker === maker);

/** What a maker's opening panel says, read off the list rather than written down. */
export function makerSummary(maker: Maker) {
  const types = typesBy(maker);
  return {
    /** The longest airframe the maker has here — the shape its panel wears. */
    flagship: types.reduce((a, b) => (b.length > a.length ? b : a)),
    names: types.map((a) => a.name).join("  ·  "),
  };
}

/** The timetable writes aircraft as type codes; these are the types they name. */
export const typeByCode = (code: string) => fleet.find((a) => a.code === code);

export const typeByName = (name: string) => fleet.find((a) => a.name === name);

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
