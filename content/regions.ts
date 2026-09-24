/**
 * The route network, region by region.
 *
 * Every destination carries its IATA code and real airport coordinates, which
 * is what lets the map draw an actual great-circle track to each one rather
 * than a decorative arc. Add a destination here and it appears on the map, on
 * the region card and in the ticker — there is nowhere else to update.
 *
 * Source: the destination list from the TGVA team, with flight numbers,
 * aircraft and block times from their timetable document.
 */
export type RegionId = "1" | "2" | "3" | "4";

export type Destination = {
  /** IATA code — the key everything else hangs off. */
  code: string;
  city: string;
  country: string;
  lon: number;
  lat: number;
  /**
   * The airline's own figures, transcribed from the team's timetable exactly as
   * written — including the entries that read like typos, which are theirs to
   * correct. Two were corrected by the team on the way in: Perth's prefix and
   * Phuket's number. Every destination carries all three.
   */
  flightNumber: string;
  aircraft: string;
  flightTime: string;
};

export type Region = {
  id: RegionId;
  title: string;
  summary: string;
  /** Typical block time, shown on the card. */
  sector: string;
  /**
   * Where the region's marker sits. This is a label anchor chosen to keep the
   * cards apart, not an airport — the destinations below carry the real
   * coordinates.
   */
  pin: { lon: number; lat: number; labelPlacement: "right" | "left" | "below" };
  destinations: Destination[];
};

/** Bangkok Suvarnabhumi — the origin of every track drawn on the map. */
export const hub = { lon: 100.75, lat: 13.69 } as const;

export const regions: Region[] = [
  {
    id: "1",
    title: "DOMESTIC",
    summary:
      "Short sectors out of Suvarnabhumi to eight airfields across Thailand — northern valleys, the north-eastern plateau and runways beside the southern sea. Where most TGVA pilots fly their first hours.",
    sector: "1–2 hrs",
    pin: { lon: 100.5, lat: 14, labelPlacement: "below" },
    destinations: [
      { code: "CNX", city: "Chiang Mai", country: "Thailand", lon: 98.96, lat: 18.77,
        flightNumber: "THA102", aircraft: "A333/B788/B772", flightTime: "1 h 20 m" },
      { code: "CEI", city: "Chiang Rai", country: "Thailand", lon: 99.88, lat: 19.95,
        flightNumber: "THA130", aircraft: "A320/A321", flightTime: "1 h 20 m" },
      { code: "KKC", city: "Khon Kaen", country: "Thailand", lon: 102.78, lat: 16.47,
        flightNumber: "THA40", aircraft: "A320/A321", flightTime: "1 h 00 m" },
      { code: "UTH", city: "Udon Thani", country: "Thailand", lon: 102.79, lat: 17.39,
        flightNumber: "THA2", aircraft: "A320/A321", flightTime: "0 h 50 m" },
      { code: "UBP", city: "Ubon Ratchathani", country: "Thailand", lon: 104.87, lat: 15.25,
        flightNumber: "THA20", aircraft: "A320/A321", flightTime: "1 h 05 m" },
      { code: "HKT", city: "Phuket", country: "Thailand", lon: 98.32, lat: 8.11,
        flightNumber: "THA101", aircraft: "A333/B77W", flightTime: "1 h 20 m" },
      { code: "KBV", city: "Krabi", country: "Thailand", lon: 98.99, lat: 8.1,
        flightNumber: "THA241", aircraft: "A320/A321", flightTime: "1 h 25 m" },
      { code: "HDY", city: "Hat Yai", country: "Thailand", lon: 100.39, lat: 6.93,
        flightNumber: "THA259", aircraft: "A320/A321", flightTime: "1 h 15 m" },
    ],
  },
  {
    id: "2",
    title: "ASIA",
    summary:
      "The largest part of the network by a wide margin — forty-five destinations across eighteen countries, reaching from Sapporo in the north to Bali below the equator, and west as far as Karachi.",
    sector: "2–7 hrs",
    pin: { lon: 115, lat: 28, labelPlacement: "right" },
    destinations: [
      { code: "NRT", city: "Tokyo Narita", country: "Japan", lon: 140.39, lat: 35.76,
        flightNumber: "THA642", aircraft: "A359/B77W", flightTime: "5 h 50 m" },
      { code: "HND", city: "Tokyo Haneda", country: "Japan", lon: 139.78, lat: 35.55,
        flightNumber: "THA660", aircraft: "A359/B77W", flightTime: "6 h 10 m" },
      { code: "KIX", city: "Osaka", country: "Japan", lon: 135.24, lat: 34.43,
        flightNumber: "THA622", aircraft: "B77W", flightTime: "5 h 10 m" },
      { code: "NGO", city: "Nagoya", country: "Japan", lon: 136.81, lat: 34.86,
        flightNumber: "THA644", aircraft: "A359", flightTime: "5 h 10 m" },
      { code: "FUK", city: "Fukuoka", country: "Japan", lon: 130.45, lat: 33.59,
        flightNumber: "THA648", aircraft: "A333", flightTime: "5 h 00 m" },
      { code: "CTS", city: "Sapporo", country: "Japan", lon: 141.69, lat: 42.78,
        flightNumber: "THA670", aircraft: "A333", flightTime: "6 h 20 m" },

      { code: "ICN", city: "Seoul", country: "South Korea", lon: 126.44, lat: 37.46,
        flightNumber: "THA652", aircraft: "A359", flightTime: "5 h 15 m" },

      { code: "PEK", city: "Beijing", country: "China", lon: 116.58, lat: 40.08,
        flightNumber: "THA614", aircraft: "A359", flightTime: "4 h 30 m" },
      { code: "PVG", city: "Shanghai", country: "China", lon: 121.81, lat: 31.14,
        flightNumber: "THA644", aircraft: "A359", flightTime: "3 h 55 m" },
      { code: "CAN", city: "Guangzhou", country: "China", lon: 113.3, lat: 23.39,
        flightNumber: "THA688", aircraft: "A333/B772", flightTime: "2 h 20 m" },
      { code: "CTU", city: "Chengdu", country: "China", lon: 103.95, lat: 30.58,
        flightNumber: "THA616", aircraft: "A333", flightTime: "3 h 05 m" },
      { code: "KMG", city: "Kunming", country: "China", lon: 102.93, lat: 25.1,
        flightNumber: "THA612", aircraft: "A359/B772", flightTime: "2 h 00 m" },
      { code: "CSX", city: "Changsha", country: "China", lon: 113.22, lat: 28.19,
        flightNumber: "THA694", aircraft: "A32Q/A320", flightTime: "3 h 25 m" },
      { code: "XMN", city: "Xiamen", country: "China", lon: 118.13, lat: 24.54,
        flightNumber: "THA610", aircraft: "A32Q/A333", flightTime: "3 h 30 m" },
      { code: "SZX", city: "Shenzhen", country: "China", lon: 113.81, lat: 22.64,
        flightNumber: "THA6456", aircraft: "A320", flightTime: "2 h 45 m" },

      { code: "HKG", city: "Hong Kong", country: "Hong Kong", lon: 113.91, lat: 22.31,
        flightNumber: "THA600", aircraft: "A359/A333/B772/B77W/B788", flightTime: "2 h 35 m" },

      { code: "TPE", city: "Taipei", country: "Taiwan", lon: 121.23, lat: 25.08,
        flightNumber: "THA632", aircraft: "B77W", flightTime: "3 h 20 m" },
      { code: "KHH", city: "Kaohsiung", country: "Taiwan", lon: 120.35, lat: 22.58,
        flightNumber: "THA630", aircraft: "A320", flightTime: "3 h 10 m" },

      { code: "MNL", city: "Manila", country: "Philippines", lon: 121.02, lat: 14.51,
        flightNumber: "THA620", aircraft: "A359/B788/B772/B77W", flightTime: "3 h 05 m" },

      { code: "DEL", city: "Delhi", country: "India", lon: 77.1, lat: 28.57,
        flightNumber: "THA323", aircraft: "A359/A333", flightTime: "4 h 00 m" },
      { code: "BOM", city: "Mumbai", country: "India", lon: 72.87, lat: 19.09,
        flightNumber: "THA351", aircraft: "A359/A333", flightTime: "4 h 30 m" },
      { code: "MAA", city: "Chennai", country: "India", lon: 80.17, lat: 12.99,
        flightNumber: "THA337", aircraft: "B772", flightTime: "3 h 35 m" },
      { code: "BLR", city: "Bengaluru", country: "India", lon: 77.71, lat: 13.2,
        flightNumber: "THA325", aircraft: "A359/A333", flightTime: "3 h 35 m" },
      { code: "AMD", city: "Ahmedabad", country: "India", lon: 72.63, lat: 23.07,
        flightNumber: "THA434", aircraft: "A320", flightTime: "4 h 40 m" },
      { code: "CCU", city: "Kolkata", country: "India", lon: 88.45, lat: 22.65,
        flightNumber: "THA313", aircraft: "A320", flightTime: "2 h 30 m" },
      { code: "GAY", city: "Gaya", country: "India", lon: 84.95, lat: 24.74,
        flightNumber: "THA327", aircraft: "A320", flightTime: "3 h 10 m" },
      { code: "HYD", city: "Hyderabad", country: "India", lon: 78.43, lat: 17.24,
        flightNumber: "THA329", aircraft: "B772/A333", flightTime: "3 h 45 m" },

      { code: "LHE", city: "Lahore", country: "Pakistan", lon: 74.4, lat: 31.52,
        flightNumber: "THA345", aircraft: "A359", flightTime: "5 h 15 m" },
      { code: "ISB", city: "Islamabad", country: "Pakistan", lon: 72.83, lat: 33.55,
        flightNumber: "THA349", aircraft: "A359", flightTime: "5 h 35 m" },
      { code: "KHI", city: "Karachi", country: "Pakistan", lon: 67.16, lat: 24.91,
        flightNumber: "THA341", aircraft: "A333", flightTime: "5 h 35 m" },

      { code: "SIN", city: "Singapore", country: "Singapore", lon: 103.99, lat: 1.36,
        flightNumber: "THA403", aircraft: "A359/A333/B772/B77W", flightTime: "2 h 20 m" },

      { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", lon: 101.71, lat: 2.75,
        flightNumber: "THA415", aircraft: "A333/B788/B789", flightTime: "2 h 03 m" },
      { code: "PEN", city: "Penang", country: "Malaysia", lon: 100.28, lat: 5.3,
        flightNumber: "THA425", aircraft: "B788/B789", flightTime: "1 h 45 m" },

      { code: "CGK", city: "Jakarta", country: "Indonesia", lon: 106.66, lat: -6.13,
        flightNumber: "THA433", aircraft: "A359/B788", flightTime: "3 h 30 m" },
      { code: "DPS", city: "Denpasar", country: "Indonesia", lon: 115.17, lat: -8.75,
        flightNumber: "THA431", aircraft: "A359", flightTime: "4 h 20 m" },

      { code: "HAN", city: "Hanoi", country: "Vietnam", lon: 105.81, lat: 21.22,
        flightNumber: "THA560", aircraft: "A320/A321", flightTime: "1 h 45 m" },
      { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam", lon: 106.66, lat: 10.82,
        flightNumber: "THA550", aircraft: "A320/A321", flightTime: "1 h 30 m" },
      { code: "DAD", city: "Da Nang", country: "Vietnam", lon: 108.2, lat: 16.04,
        flightNumber: "THA558", aircraft: "A320/A321", flightTime: "1 h 40 m" },

      { code: "PNH", city: "Phnom Penh", country: "Cambodia", lon: 104.84, lat: 11.55,
        flightNumber: "THA586", aircraft: "A320", flightTime: "1 h 20 m" },
      { code: "VTE", city: "Vientiane", country: "Laos", lon: 102.56, lat: 17.99,
        flightNumber: "THA570", aircraft: "A320", flightTime: "1 h 00 m" },
      { code: "RGN", city: "Yangon", country: "Myanmar", lon: 96.13, lat: 16.91,
        flightNumber: "THA301", aircraft: "A320", flightTime: "1 h 20 m" },
      { code: "DAC", city: "Dhaka", country: "Bangladesh", lon: 90.4, lat: 23.84,
        flightNumber: "THA339", aircraft: "A333/B77W", flightTime: "2 h 35 m" },
      { code: "KTM", city: "Kathmandu", country: "Nepal", lon: 85.36, lat: 27.7,
        flightNumber: "THA309", aircraft: "A320/A333/B772", flightTime: "3 h 25 m" },
      { code: "CMB", city: "Colombo", country: "Sri Lanka", lon: 79.88, lat: 7.18,
        flightNumber: "THA307", aircraft: "A320", flightTime: "3 h 45 m" },
      { code: "SAI", city: "Siem Reap", country: "Cambodia", lon: 104.07, lat: 13.53,
        flightNumber: "THA588", aircraft: "A320/A321", flightTime: "0 h 45 m" },
    ],
  },
  {
    id: "3",
    title: "EUROPE",
    summary:
      "Eleven non-stop long-haul sectors out of Bangkok across seven time zones — intercontinental fuel planning, relief crews in the flight deck, and arrivals into weather that turns with the season.",
    sector: "11–13 hrs",
    pin: { lon: 9, lat: 50, labelPlacement: "left" },
    destinations: [
      { code: "LHR", city: "London", country: "United Kingdom", lon: -0.45, lat: 51.47,
        flightNumber: "THA910", aircraft: "B77W", flightTime: "13 h 35 m" },
      { code: "CDG", city: "Paris", country: "France", lon: 2.55, lat: 49.01,
        flightNumber: "THA930", aircraft: "B77W", flightTime: "12 h 00 m" },
      { code: "BRU", city: "Brussels", country: "Belgium", lon: 4.48, lat: 50.9,
        flightNumber: "THA934", aircraft: "B788/789", flightTime: "11 h 45 m" },
      { code: "FRA", city: "Frankfurt", country: "Germany", lon: 8.56, lat: 50.04,
        flightNumber: "THA912", aircraft: "B77W", flightTime: "12 h 00 m" },
      { code: "MUC", city: "Munich", country: "Germany", lon: 11.79, lat: 48.35,
        flightNumber: "THA924", aircraft: "A359", flightTime: "11 h 30 m" },
      { code: "ZRH", city: "Zurich", country: "Switzerland", lon: 8.55, lat: 47.46,
        flightNumber: "THA970", aircraft: "B77W", flightTime: "11 h 50 m" },
      { code: "MXP", city: "Milan", country: "Italy", lon: 8.72, lat: 45.63,
        flightNumber: "THA640", aircraft: "B788/789", flightTime: "11 h 15 m" },
      { code: "CPH", city: "Copenhagen", country: "Denmark", lon: 12.66, lat: 55.62,
        flightNumber: "THA950", aircraft: "B77W", flightTime: "11 h 20 m" },
      { code: "OSL", city: "Oslo", country: "Norway", lon: 11.1, lat: 60.19,
        flightNumber: "THA954", aircraft: "A359", flightTime: "10 h 35 m" },
      { code: "ARN", city: "Stockholm", country: "Sweden", lon: 17.92, lat: 59.65,
        flightNumber: "THA960", aircraft: "A359", flightTime: "11 h 50 m" },
      { code: "IST", city: "Istanbul", country: "Türkiye", lon: 28.74, lat: 41.26,
        flightNumber: "THA900", aircraft: "A359", flightTime: "10 h 20 m" },
    ],
  },
  {
    id: "4",
    title: "AUSTRALIA",
    summary:
      "Three cities on the far side of the equator — overnight sectors that keep a crew on the flight deck through the small hours, and the longest legs in the network outside Europe.",
    sector: "7–9 hrs",
    pin: { lon: 135, lat: -25, labelPlacement: "left" },
    destinations: [
      { code: "SYD", city: "Sydney", country: "Australia", lon: 151.18, lat: -33.94,
        flightNumber: "THA475", aircraft: "A359/B77W", flightTime: "9 h 15 m" },
      { code: "MEL", city: "Melbourne", country: "Australia", lon: 144.84, lat: -37.67,
        flightNumber: "THA461", aircraft: "A359", flightTime: "9 h 00 m" },
      { code: "PER", city: "Perth", country: "Australia", lon: 115.97, lat: -31.94,
        flightNumber: "THA483", aircraft: "B788", flightTime: "6 h 45 m" },
    ],
  },
];

export const regionsById = Object.fromEntries(
  regions.map((region) => [region.id, region]),
) as Record<RegionId, Region>;

/** Countries a region reaches, in the order its destinations are listed. */
export function countriesOf(region: Region): string[] {
  return [...new Set(region.destinations.map((destination) => destination.country))];
}

/** Every destination in the network, hub excluded. */
export const allDestinations = regions.flatMap((region) => region.destinations);
