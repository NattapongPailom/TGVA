import { hub, type Destination } from "@/content/regions";

/**
 * Per-route figures for the Route Detail dialog.
 *
 * Every figure here comes from the team's timetable and nothing else — never
 * derived from the code or the coordinates, which would be plausible enough to
 * be mistaken for fact. Edit content/regions.ts and they appear here.
 */
export type RouteDetail = {
  flightNumber: string;
  flightTime: string;
  aircraft: string;
  /**
   * Great-circle kilometres between the two airports. Unlike the figures above
   * this is not from the timetable — but it is not a guess either: it falls out
   * of the coordinates both ends already carry.
   */
  distanceKm: number;
};

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

function distanceKm(from: { lon: number; lat: number }, to: { lon: number; lat: number }) {
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a)));
}

export function routeDetail(destination: Destination): RouteDetail {
  return {
    flightNumber: destination.flightNumber,
    flightTime: destination.flightTime,
    aircraft: destination.aircraft,
    distanceKm: distanceKm(hub, destination),
  };
}
