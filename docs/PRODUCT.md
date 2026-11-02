# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Infinite Flight pilots who do not know TGVA yet. They arrive curious about joining a virtual airline, evaluate whether this one is active, well-run and worth their flying time, and the job the site does for them is a decision: join, and go to the membership form.

Existing members are not the site's audience. Day-to-day community life happens in Discord, not here.

## Product Purpose

Thai Airways Virtual (TGVA) is a non-profit virtual airline and aviation community built around Infinite Flight, inspired by the identity and hospitality of Thai Airways. The site exists to present the airline to prospective pilots and convert interest into membership sign-ups.

Success is a prospective pilot reaching the membership form convinced TGVA is real, active and professionally run.

## Positioning

A Thai-identity virtual airline: "Smooth as Silk" carried into the virtual skies. The differentiator is the pairing of Thai hospitality and character with a genuine operational network — scheduled flights, special and group flights, a published route network across Thailand, Asia and beyond, and a multi-type fleet — rather than a Discord server with a logo.

## Operating Context

- Flying happens in Infinite Flight; community life happens in Discord.
- Membership sign-up is an external Google Form (`membershipFormUrl` in `tgva/content/site.ts`).
- Routes, flight numbers, aircraft and block times come from the team's own timetable document.
- The organisation runs on named executive roles (CEO, COO, Chief Pilot, HR Director, CMO), some currently vacant.
- TGVA collaborates with other virtual airlines and aviation communities on joint events.

## Capabilities and Constraints

- Stack in place: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, at `tgva/`. Fonts via `next/font` — Archivo for headings, Sarabun for body (Thai-capable).
- Site language is **English only**. Thai appears in repository documentation, not in site copy. Sarabun remains for Thai names and terms.
- Content is separated from markup in `tgva/content/` (`site.ts`, `regions.ts`, `fleet.ts`, `events.ts`). Design work changes layout without rewriting copy, and copy without touching layout.
- Route data carries real airport coordinates; the world map draws actual great-circle tracks from Bangkok (`lib/world-map.ts`). Adding a destination in `regions.ts` updates map, region card and ticker together.
- Fleet entries carry real published dimensions used only to draw every aircraft silhouette to one scale. No seat counts, ranges or aircraft totals exist — the team has published none.
- Video masters are deliberately excluded from Git. The two web-encoded files, `public/video/who-we-are.mp4` and `showreel.mp4` (about 8MB together), are committed and served from Vercel's CDN; at that size no separate streaming service is needed.
- `NEXT_PUBLIC_SITE_URL` must be set to the real domain before deploy; metadata, robots, sitemap and share cards all read it.
- Legal constraint: TGVA is not affiliated with Thai Airways International Public Company Limited, and the site must say so.

## Brand Commitments

- Name: Thai Airways Virtual (TGVA).
- Motto in use: "Smooth as Silk", taken as the airline's own spirit.
- Vision statement and mission lines are the team's own words, in `content/site.ts`.
- Voice: warm, welcoming, professional. Hospitality first, not hard sell.
- Visual identity draws on Thai Airways' purple and gold; brand colours are tokens under `@theme` in `tgva/app/globals.css`.
- The non-affiliation notice is a standing commitment, not decoration.

## Evidence on Hand

Real, usable:
- Full route network with IATA codes, real coordinates, flight numbers, aircraft and block times (`content/regions.ts`).
- Full fleet list, 14+ types across Airbus, Boeing and McDonnell Douglas (`content/fleet.ts`).
- The team's own About, Story, Vision, Mission and services copy (`content/site.ts`), transcribed from their document.
- Live membership form URL.
- Discord invite: https://discord.gg/cV84VuPEc9 — guild "Thai Airways Virtual.", a non-expiring invite (checked against the Discord API on 2 Nov 2026). It replaced an earlier temporary invite that expired on 27 Oct 2026.
- Instagram channel: https://www.instagram.com/if.tgva/
- Source media: `_source-media/masters/` (who-we-are, promote video masters) and `_source-media/reference-screenshots/`, including a logo file.

Absent — never fabricate:
- **Staff names and photos.** Only CEO (Tjb0709) and COO (IFTH-Prichachan) are named. Chief Pilot, HR Director and CMO are vacant. No team photographs exist. Do not invent names and do not fill the slots with stock portraits.
- **Events.** `content/events.ts` is empty. No event has been announced. The empty state is the truthful state; do not write a sample line-up into the page.

- No member counts, flight-hour totals, testimonials, awards, press or partner names have been supplied.

The services copy in `content/site.ts` is the team's current wording and is treated as real copy, not a gap.

## Product Principles

1. **Say only what is true.** Missing facts appear as absences, never as plausible filler. A vacant role reads as open; an empty events list says so.
2. **The site's job is the decision to join.** Every surface answers "is this airline real, active and worth my time", and the membership form is never far.
3. **Thai hospitality, professionally delivered.** Warmth is the character; sloppiness is not warmth.
4. **The network is the proof.** Real routes, real coordinates, a real fleet — the operation evidences itself rather than claiming credibility.
5. **Content stays separable from design.** Copy and data live in `content/`; design work must not bake text into markup.

## Accessibility & Inclusion

No product-specific standard has been established by the team. Known outstanding item: the showreel video has no captions track (`<track>`).
