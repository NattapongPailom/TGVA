/**
 * The airlines TGVA flies alongside, in the order the strip shows them.
 *
 * Star Alliance carriers first, then the rest. `alliance` is the alliance the
 * carrier belongs to in its own right — a non-member is a partner of TGVA, not
 * of Star Alliance, and the badge says so rather than borrowing the mark.
 *
 * Logos are the owner's files with their white margins trimmed, so every mark
 * fills its own box and sizing them by area works; the untouched originals are
 * in _source-media/partner-originals. No fleet sizes are given here because
 * none have been supplied.
 */
export type Alliance = "Star Alliance" | "oneworld" | "SkyTeam";

export type Partner = {
  name: string;
  /** Null for a carrier in no alliance. */
  alliance: Alliance | null;
  logo: { src: string; width: number; height: number };
};

const logo = (file: string, width: number, height: number) => ({
  src: `/images/partners/${file}.png`,
  width,
  height,
});

export const partners: Partner[] = [
  { name: "ANA", alliance: "Star Alliance", logo: logo("ana", 433, 121) },
  { name: "Air China", alliance: "Star Alliance", logo: logo("air-china", 663, 215) },
  { name: "Air New Zealand", alliance: "Star Alliance", logo: logo("air-new-zealand", 731, 128) },
  { name: "Asiana Airlines", alliance: "Star Alliance", logo: logo("asiana-airlines", 739, 83) },
  { name: "Austrian", alliance: "Star Alliance", logo: logo("austrian", 496, 103) },
  { name: "Brussels Airlines", alliance: "Star Alliance", logo: logo("brussels-airlines", 268, 71) },
  { name: "Ethiopian", alliance: "Star Alliance", logo: logo("ethiopian", 474, 203) },
  { name: "EVA Air", alliance: "Star Alliance", logo: logo("eva-air", 324, 84) },
  { name: "SAS", alliance: "Star Alliance", logo: logo("sas", 721, 133) },
  { name: "Singapore Airlines", alliance: "Star Alliance", logo: logo("singapore-airlines", 546, 193) },
  { name: "SWISS", alliance: "Star Alliance", logo: logo("swiss", 433, 111) },
  { name: "Turkish Airlines", alliance: "Star Alliance", logo: logo("turkish-airlines", 432, 75) },
  { name: "United", alliance: "Star Alliance", logo: logo("united", 738, 168) },
  { name: "Iberia", alliance: "oneworld", logo: logo("iberia", 738, 176) },
  { name: "Emirates", alliance: null, logo: logo("emirates", 393, 275) },
  { name: "flydubai", alliance: null, logo: logo("flydubai", 353, 82) },
  { name: "STARLUX", alliance: null, logo: logo("starlux", 188, 185) },
  { name: "AirAsia", alliance: null, logo: logo("airasia", 588, 340) },
];
