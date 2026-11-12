---
name: tgva-content
description: Change what the TGVA site says. Use when the owner hands over new or corrected copy, staff, events, routes, fleet types, partners, links or images for the site, or asks to change any text a visitor reads.
---

# Changing TGVA content

Everything a visitor reads lives in `content/*.ts`. The components only lay it
out. Change content there, not in a component.

## The one rule

**Say only what is true** (`docs/PRODUCT.md`). Every name, number, date, route,
event, quote and link comes from the owner, in their words. If something is
missing, it stays missing: a vacant role reads as open, and an empty events list
says so. Never write plausible filler, never "improve" a fact, and never invent
a sample. If the owner's text reads like a typo, ask them; don't correct it.

## Where things live

| What | File | Notes |
|---|---|---|
| Membership form, nav, social links, every section's copy, staff, footer | `content/site.ts` | A link with no URL yet is left out, not pointed nowhere. |
| Events | `content/events.ts` | Empty until the team announces one. The type comment is the contract: unique `id`, poster under `/images/events/`, `starts` in ISO 8601 with an offset, `date` naming that same day. |
| Destinations and timetable | `content/regions.ts` | IATA code, real airport coordinates, and `flightNumber`, `aircraft` and `flightTime` exactly as the team wrote them. |
| Fleet | `content/fleet.ts` | Only the types the team flies. Image `width` and `height` are the file's real pixel size. |
| Partner airlines | `content/partners.ts` | Logos are the owner's files, margins trimmed. |
| The membership QR code | `lib/membership-qr.ts` | Must encode `membershipFormUrl`. If the form changes, regenerate it. |

Images go under `public/`. Keep the owner's untouched originals in
`_source-media/`, outside the repository.

## Checking

1. Run the `content_check` tool (or `npm run check:content`). It enforces the
   rules the content files state about themselves. Fix what it reports; never
   loosen the check to make it pass.
2. If a link was added or changed, run `links_check` (or `npm run check:links`).
3. Look at the page: `npm run dev`, then the section you changed, on a narrow
   screen as well as a wide one.

Then ship it with the `tgva-ship` skill. Content paths merge on their own once
the checks pass.
