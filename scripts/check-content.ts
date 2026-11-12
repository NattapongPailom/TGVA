/**
 * `npm run check:content`: the rules content/ states about itself, checked.
 *
 * Every check here is one a comment in content/ already asks for: an image's
 * width and height are its real size, a timetable aircraft code names a type
 * in the fleet, a service's emphasis is part of its title, and so on. It reads
 * the same modules the site renders, so it sees exactly what the page will.
 *
 * It cannot check that a fact is true. That stays with the owner, who supplies
 * every line of content (docs/PRODUCT.md).
 *
 * Offline and fast, so `npm run verify` runs it on every pull request.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import * as eventsModule from "@/content/events";
import * as fleetModule from "@/content/fleet";
import * as partnersModule from "@/content/partners";
import * as regionsModule from "@/content/regions";
import * as siteModule from "@/content/site";
import { membershipQr } from "@/lib/membership-qr";

/** npm runs every script from the package root. */
const root = process.cwd();
const problems: string[] = [];
const fail = (where: string, message: string) => problems.push(`${where}: ${message}`);

/* ---------------------------------------------------------------- walking */

type Visit = (value: unknown, where: string) => void;

/** Every value under every export of a module, with a readable path to it. */
function walk(module: Record<string, unknown>, file: string, visit: Visit) {
  const seen = new Set<unknown>();
  const go = (value: unknown, where: string) => {
    visit(value, where);
    if (value === null || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    for (const [key, child] of Object.entries(value)) {
      go(child, Array.isArray(value) ? `${where}[${key}]` : `${where}.${key}`);
    }
  };
  for (const [name, value] of Object.entries(module)) {
    if (typeof value !== "function") go(value, `${file} ${name}`);
  }
}

const modules: [string, Record<string, unknown>][] = [
  ["content/site.ts", siteModule],
  ["content/events.ts", eventsModule],
  ["content/fleet.ts", fleetModule],
  ["content/partners.ts", partnersModule],
  ["content/regions.ts", regionsModule],
];

/* ------------------------------------------------------------ image sizes */

/** Width and height from a PNG or JPEG header, or null for another format. */
function imageSize(file: string): { width: number; height: number } | null {
  const bytes = readFileSync(file);
  // PNG: the IHDR chunk follows the 8-byte signature.
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  // JPEG: walk the markers to the first start-of-frame.
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let at = 2;
    while (at + 9 < bytes.length) {
      if (bytes[at] !== 0xff) return null;
      const marker = bytes[at + 1];
      const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isFrame) return { height: bytes.readUInt16BE(at + 5), width: bytes.readUInt16BE(at + 7) };
      at += 2 + bytes.readUInt16BE(at + 2);
    }
  }
  return null;
}

const publicFile = (src: string) => path.join(root, "public", decodeURIComponent(src.split(/[?#]/)[0]));

/* ----------------------------------------------------- checks on all values */

const placeholder = /lorem ipsum|\bTODO\b|\bTBD\b|\bFIXME\b|example\.(com|org)|discord\.gg\/\.\.\./i;

for (const [file, contentModule] of modules) {
  walk(contentModule, file, (value, where) => {
    if (typeof value === "string") {
      if (placeholder.test(value)) fail(where, `reads like a placeholder: "${value}"`);

      // A file the page links to under public/ has to be there.
      if (/^\/(images|video|logos?|icons?)\//.test(value) && !existsSync(publicFile(value))) {
        fail(where, `${value} is not in public/`);
      }

      if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
        let url: URL | null = null;
        try {
          url = new URL(value);
        } catch {
          fail(where, `is not a valid URL: ${value}`);
        }
        if (url && url.protocol === "http:") fail(where, `uses http, not https: ${value}`);
      }
      return;
    }

    // `{ src, width, height }`: "A file under public/, and its intrinsic size in pixels."
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const { src, width, height } = value as Record<string, unknown>;
      if (typeof src !== "string" || typeof width !== "number" || typeof height !== "number") return;
      if (!src.startsWith("/")) return;
      const file = publicFile(src);
      if (!existsSync(file)) return; // reported above, as a missing file
      const real = imageSize(file);
      if (!real) return;
      if (real.width !== width || real.height !== height) {
        fail(where, `${src} is ${real.width}×${real.height}, but the content says ${width}×${height}`);
      }
    }
  });
}

/* ------------------------------------------------------- the stated rules */

// site.ts: the membership form is the one place every join link goes.
if (!/^https:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/.test(siteModule.membershipFormUrl)) {
  fail("content/site.ts membershipFormUrl", "is not a Google Forms address");
}

// lib/membership-qr.ts: the manifest drops its QR code when the two differ.
if (membershipQr.url !== siteModule.membershipFormUrl) {
  fail(
    "lib/membership-qr.ts url",
    "is not membershipFormUrl, so the crew manifest shows no QR code; regenerate it for the new form",
  );
}

// site.ts: "`emphasis` ... must be a substring of `title`".
walk(siteModule, "content/site.ts", (value, where) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const { title, emphasis } = value as Record<string, unknown>;
  if (typeof title === "string" && typeof emphasis === "string" && !title.includes(emphasis)) {
    fail(where, `emphasis "${emphasis}" is not part of the title "${title}"`);
  }
});

// site.ts: the staff pass shows a photo from public/ when one is given.
siteModule.team.forEach((member, i) => {
  if (member.photo && !existsSync(publicFile(member.photo))) {
    fail(`content/site.ts team[${i}].photo`, `${member.photo} is not in public/`);
  }
});

// events.ts: the contract each entry's type comment sets out.
const eventIds = new Set<string>();
eventsModule.events.forEach((event, i) => {
  const where = `content/events.ts events[${i}] (${event.id})`;
  if (eventIds.has(event.id)) fail(where, "id is used twice; a dismissal is remembered by id");
  eventIds.add(event.id);
  for (const [key, text] of Object.entries(event)) {
    if (typeof text === "string" && !text.trim()) fail(where, `${key} is empty`);
  }
  if (!event.poster.startsWith("/images/events/")) fail(where, "poster is not under /images/events");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(event.starts)) {
    fail(where, `starts is not ISO 8601 with an offset: ${event.starts}`);
  } else {
    // The printed date has to name the day the countdown counts to, in Bangkok.
    const starts = new Date(event.starts);
    const day = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", day: "numeric" }).format(starts);
    // Three letters: en-GB writes September as "Sept", the page as "Sep".
    const month = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", month: "short" })
      .format(starts)
      .slice(0, 3);
    if (!new RegExp(`\\b${day}\\b`).test(event.date) || !event.date.toLowerCase().includes(month.toLowerCase())) {
      fail(where, `date "${event.date}" is not the day in starts (${day} ${month}, Bangkok time)`);
    }
  }
  if (!event.joinUrl.startsWith("https://")) fail(where, "joinUrl is not an https address");
});

// regions.ts: "IATA code — the key everything else hangs off", with real coordinates.
const codes = new Set<string>();
regionsModule.regions.forEach((region) => {
  region.destinations.forEach((destination) => {
    const where = `content/regions.ts ${destination.code} (${destination.city})`;
    if (!/^[A-Z]{3}$/.test(destination.code)) fail(where, "code is not a three-letter IATA code");
    if (codes.has(destination.code)) fail(where, "code appears twice in the network");
    codes.add(destination.code);
    if (Math.abs(destination.lat) > 90 || Math.abs(destination.lon) > 180) {
      fail(where, `coordinates out of range: ${destination.lat}, ${destination.lon}`);
    }
    // "Every destination carries all three."
    for (const key of ["flightNumber", "aircraft", "flightTime"] as const) {
      if (!destination[key]?.trim()) fail(where, `${key} is missing`);
    }
    // fleet.ts: a code in no fleet group "now means a typo, and is the only thing that would catch one".
    for (const code of fleetModule.aircraftCodes(destination.aircraft)) {
      if (!fleetModule.typeByCode(code)) fail(where, `aircraft code ${code} is not a type in content/fleet.ts`);
    }
  });
});

/* ----------------------------------------------------------------- report */

if (problems.length) {
  console.error(`check:content found ${problems.length} problem${problems.length === 1 ? "" : "s"}:\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log("check:content: content/ follows its own rules.");
