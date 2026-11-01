<div align="center">

# TGVA — Thai Airways Virtual

**The website of Thai Airways Virtual, a non-profit virtual airline for Infinite Flight pilots.**
*"Smooth as Silk", carried into the virtual skies.*

[**Live site → tgva.vercel.app**](https://tgva.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

</div>

---

## About the project

TGVA is a virtual airline built around [Infinite Flight](https://infiniteflight.com) and inspired by
the identity and hospitality of Thai Airways. This site introduces the airline to pilots who have
not heard of it yet. Its one job is to help them decide to join, and to take them to the membership
form.

The site makes that case with evidence, not claims:

- **A real route network.** Every destination carries its real airport coordinates. The world map
  draws true great-circle tracks out of Bangkok.
- **A real fleet.** Every aircraft silhouette is drawn to one scale from published dimensions.
- **Only true content.** Missing facts show as absences. A vacant role reads as open, and an empty
  events list says so. The site never fills a gap with invented content.

> [!NOTE]
> TGVA is a flight-simulation community. It is **not affiliated** with Thai Airways International
> Public Company Limited, and the site states this in the footer.

## Features

| | |
| --- | --- |
| **Cinematic opening** | Loading screen, hero video and scroll-triggered reveals. Motion respects `prefers-reduced-motion`. |
| **Where We Fly** | Interactive world map with four regions: Domestic, Asia, Europe and Australia. Each route opens a detail dialog with its flight number, aircraft and block time. A strip of partner airlines sits under the map. |
| **Destination ticker** | A departures-board strip of every city in the network. |
| **Our Fleet** | Current and retired types from Airbus, Boeing and McDonnell Douglas, drawn to scale. |
| **Inside TGVA** | What the airline does, with its vision and mission, in a chaptered scroll. |
| **Events** | An announcement popup, a count badge in the nav and a dedicated `/events` page. All three follow `content/events.ts`. |
| **Story reel** | Showreel video with custom controls and English captions. |
| **Join Us** | Every route through the page ends at the membership form. |
| **Responsive navigation** | Desktop dropdowns with a sliding active marker. Below 68rem, a full-height mobile sheet with a focus trap and scroll lock. |
| **SEO and sharing** | Generated Open Graph image, `sitemap.xml`, `robots.txt` and app icons. |
| **Hardened** | Security headers and a Content Security Policy in `next.config.ts`. `X-Powered-By` is hidden. |

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, fully static output) |
| UI | React 19 and TypeScript |
| Styling | Tailwind CSS v4, with design tokens under `@theme` in `app/globals.css` |
| Fonts | `next/font`: **Archivo** for headings, **Sarabun** for body text (Thai-capable), **IBM Plex Mono** for figures |
| Hosting | Vercel, deployed automatically on every push to `main` |

## Getting started

You need Node.js 20 or later.

```bash
npm install
npm run dev      # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server with hot reload. |
| `npm run build` | Makes the production build. Run it before every push. |
| `npm run start` | Serves the production build locally. |
| `npm run lint` | Runs ESLint. |

## Project structure

```
tgva/
├── app/                  Routes, metadata, icons, sitemap, robots
│   ├── page.tsx          Home page — section order is set here
│   ├── events/           The /events page
│   └── globals.css       Design tokens and component styles
├── components/
│   ├── layout/           Site header (nav + mobile sheet) and footer
│   ├── sections/         One component per home-page section
│   ├── media/            Video players, controls, reels
│   ├── motion/           Loading screen, reveals, hero animation
│   └── ui/               Shared buttons, headings, small marks
├── content/              All copy and data, kept apart from markup
│   ├── site.ts           Nav, about, story, services, vision, mission, footer
│   ├── regions.ts        Route network: destinations, coordinates, flights
│   ├── fleet.ts          Aircraft types and their real dimensions
│   ├── partners.ts       Partner airlines and alliances
│   └── events.ts         Announced events (empty until the team adds one)
├── lib/                  Map projection, site URL, hooks (focus trap, scroll lock…)
├── public/               Images, logos, web-encoded videos and captions
└── docs/                 PRODUCT.md and DESIGN.md
```

## Editing content

Copy and data live in `content/`. You can change them without touching layout.

| To change… | Edit |
| --- | --- |
| Navigation, about text, story, services, vision, mission, footer | `content/site.ts` |
| Membership form link and social channels | `content/site.ts` (`membershipFormUrl`, `social`) |
| Routes and destinations | `content/regions.ts` |
| Fleet | `content/fleet.ts` |
| Events | `content/events.ts` |

**Add a destination.** Add it to its region in `content/regions.ts`, with the IATA code, real
coordinates, flight number, aircraft and block time. The map, the region card and the ticker all
update from that one entry. See `lib/world-map.ts` for how coordinates are projected.

**Announce an event.** Add an entry to `content/events.ts`. The file contains a complete example.
The popup, the nav count and the `/events` page all follow the list, and nothing else needs to
change. With the list empty, the site shows an honest "nothing announced yet" state.

## Design

The visual identity draws on Thai Airways' purple and gold. The idea is the airline's own printed
matter made live: tickets, boarding passes and route charts on real coordinates.

| Token | Value | Use |
| --- | --- | --- |
| `brand` | `#360a6f` | Royal Orchid purple, the primary colour |
| `brand-deep` | `#1e0640` | Orchid Deep grounds and the hero |
| `gold` | `#d8a657` | Primary actions and accents |
| `cream` | `#f7f3ee` | Text on dark grounds |
| `ink` | `#150e22` | Body text on light grounds |

All colours are tokens under `@theme` in `app/globals.css`. Change a colour there once and the whole
site follows. The full system (typography, spacing, radii, components) is in
[`docs/DESIGN.md`](docs/DESIGN.md). Audience, purpose and content rules are in
[`docs/PRODUCT.md`](docs/PRODUCT.md).

## Deployment

The site is on **Vercel**, connected to this repository.

- A push to `main` builds and deploys to production at <https://tgva.vercel.app>.
- Every other branch gets its own preview URL.

**Domain.** When the site gets its own domain, set `NEXT_PUBLIC_SITE_URL` in Vercel:

```
NEXT_PUBLIC_SITE_URL=https://tgva.org
```

Metadata, `robots.txt`, `sitemap.xml` and social share cards all read this value. Until it is set,
the site uses the Vercel production address (see `lib/site-config.ts`).

**Video.** `.gitignore` keeps video files out of Git on purpose, because source masters are hundreds
of megabytes. The only exception is the two small web-encoded files in `public/video/`. The
full-quality masters stay outside the repository, in `../_source-media/masters/`.

## Open items

- The team has named only two staff: the CEO and the COO. Chief Pilot, HR Director and CMO are
  vacant, and no team photos exist yet.
- `content/events.ts` is empty until the team announces a real event.
- No member counts, flight-hour totals or testimonials have been supplied. The site does not invent
  them.

---

<div align="center">

Made for the TGVA community · Fly with us on Infinite Flight

</div>
