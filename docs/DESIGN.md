---
name: TGVA — Thai Airways Virtual
description: The airline's own printed matter made live — tickets, boarding passes and route charts drawn on real coordinates.
colors:
  brand: "#360a6f"
  brand-light: "#5b2ba8"
  brand-deep: "#1e0640"
  brand-abyss: "#0e0326"
  route: "#301661"
  gold: "#d8a657"
  gold-deep: "#b8801f"
  cream: "#f7f3ee"
  ink: "#150e22"
  ink-soft: "#3e3a4e"
  ink-mute: "#5c5670"
  surface: "#f8f7fc"
  surface-sunken: "#efeef4"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6.4vw, 5.75rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.375rem, 4.6vw, 3.875rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.06em"
  body:
    fontFamily: "Sarabun, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.26em"
  figure:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  hairline: "3px"
  sm: "6px"
  md: "12px"
  card: "14px"
  hero: "26px"
  full: "9999px"
spacing:
  xs: "0.375rem"
  sm: "0.75rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "3.5rem"
  section: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "15px 28px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.brand}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.full}"
    padding: "15px 28px"
  button-outline-hover:
    textColor: "{colors.gold}"
  button-light:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.brand}"
    rounded: "{rounded.full}"
    padding: "15px 28px"
  button-light-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
  button-compact:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "13px 24px"
  card-floating:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.card}"
    padding: "18px"
  panel-sunken:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.card}"
    padding: "24px 28px"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.sm}"
    padding: "6px 10px 6px 28px"
  nav-link:
    textColor: "{colors.brand}"
    typography: "{typography.title}"
    padding: "0"
  nav-menu-item:
    backgroundColor: "transparent"
    textColor: "{colors.brand}"
    rounded: "{rounded.md}"
    padding: "0.85rem 1rem"
  ticket:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    width: "min(44rem, 100%)"
---

# Design System: TGVA — Thai Airways Virtual

## Overview

**Creative North Star: "The Silk Timetable"**

TGVA's interface is the airline's own printed matter, made live. The route dialog is a ticket with a perforation, a barcode and a stub; the network is a chart drawn from real airport coordinates rather than decorative arcs; flight numbers and block times are set in mono because that is how a timetable sets them. Nothing here imitates a web page pretending to be paper — the paper metaphors are load-bearing, and they carry real data the team supplied.

The system runs on two grounds. White is the working ground: hairline-ruled, flat, densely informative, where the reader reads and compares. Deep orchid (`#1e0640`) is the ceremonial ground: the hero, the closing invitation, the fleet stage — full-bleed, cream type, gold as the only light in it. Moving between them is the page's rhythm, and it is the reason the site feels like an airline rather than a landing page: the dark blocks are the cabin, the white blocks are the documents.

Motion is mechanical, not decorative. A button's label rolls up while a panel drops in behind it; an external link launches a plane that lays a black trail before the tab opens; the nav marker measures the link it sits under and slides; the route track draws itself and the aircraft flies it. Equipment moving, precisely — never ambient float.

**Key Characteristics:**
- Two grounds, alternating: white for reading, deep orchid for arrival.
- Gold is light, never decoration — it marks the one thing that matters on a screen.
- Hairlines (1px at 15–16% brand) do the dividing work that boxes would do elsewhere.
- Display type is set enormous, tight and negative-tracked; labels are tiny and widely letterspaced. There is nothing in between by accident.
- Documents over cards: tickets, boarding passes, charts, timetables.
- Real data drawn to real scale — great-circle tracks from true coordinates, aircraft silhouettes to published dimensions.

## Colors

Two brand colours and one long neutral ramp. Orchid purple carries every structural and ceremonial surface; gold is rationed to the single most important mark in any view.

### Primary
- **Royal Orchid** (`#360a6f`): Thai Airways' own orchid purple. Section headings, nav links, active states, and every hairline (used at 10–20% opacity for borders and rules). The identity colour.
- **Orchid Light** (`#5b2ba8`): eyebrows, small headings inside white blocks, and the secondary diamond in the rule. The readable purple where full brand would over-weight small type.
- **Orchid Deep** (`#1e0640`): the ceremonial ground. Hero wrapper, Join Us, fleet stage, ticket stub gradient terminus. Whole-viewport surfaces, not accents.
- **Orchid Abyss** (`#0e0326`): the deepest step, for shadow tinting and the darkest layered ground.
- **Route Orchid** (`#301661`): the Route Detail stub only. Deliberately lighter than Royal Orchid because the stub sits against white, where the darker brand reads nearly black.

### Secondary
- **Cabin Gold** (`#d8a657`): light. The focus ring, the nav marker, the primary button's rest state, the beacon pulse, the diamond in the divider, the aircraft in flight. Never a background for body text.
- **Cabin Gold Deep** (`#b8801f`): gold on white, where `#d8a657` loses contrast. Nav link hover is its only routine use.

### Neutral
- **Cream** (`#f7f3ee`): all type on orchid grounds. Warmer than white on purpose — white on deep purple reads clinical.
- **Ink** (`#150e22`): body text on white, and the label colour on gold buttons.
- **Ink Soft** (`#3e3a4e`): long-form paragraph text in white blocks.
- **Ink Mute** (`#5c5670`): captions, inactive rail entries, secondary metadata.
- **Surface** (`#f8f7fc`): field grounds and hover fills inside white blocks.
- **Surface Sunken** (`#efeef4`): the recessed panel — a step down from white, not a card floating above it.

### Named Rules

**The One Light Rule.** Gold is the only light source in the system. In any single viewport it marks at most one thing: the focus ring, or the active nav marker, or the beacon button — never several at once. Its scarcity is what makes it read as attention rather than trim.

**The Hairline Rule.** Structure on white is drawn with 1px lines at `brand/15` (`rgba(54,10,111,0.15)`), not with boxes, fills, or shadows. A list separated by hairlines is correct; the same list in bordered cards is not this system.

**The Two Grounds Rule.** Every block is either white or an orchid deep. There is no third ground and no gradient wash between them. A section that cannot decide which it is has not been designed yet.

## Typography

**Display Font:** Archivo (with `ui-sans-serif, system-ui, sans-serif`) — weights 500, 700, 800
**Body Font:** Sarabun (with `ui-sans-serif, system-ui, sans-serif`) — weights 300, 400, 600
**Figure Font:** IBM Plex Mono (with `ui-monospace, SFMono-Regular, monospace`) — weights 400, 500

**Character:** Archivo is a grotesque with enough width to survive being set at 5.75rem and enough weight at 800 to act as a graphic element rather than a headline. Sarabun is the Thai-capable humanist that carries the reading, and its lower contrast keeps long paragraphs from competing with the display. Plex Mono exists for one job: flight numbers, IATA codes and block times need a fixed advance width so a timetable column aligns.

### Hierarchy
- **Display** (800, `clamp(2.75rem, 6.4vw, 5.75rem)`, line-height 0.95, tracking -0.035em): the page's own H1 and the closing invitation. Set tight enough that lines nearly touch — the block is a shape, not a sentence.
- **Headline** (800, `clamp(2.375rem, 4.6vw, 3.875rem)`, line-height 1, tracking -0.03em): every `SectionHeading`. Always Royal Orchid, always `text-balance`.
- **Title** (800, 22px, tracking 0.06em): column labels in Our Story, card titles. Slightly positive tracking because at this size the 800 weight closes up.
- **Body** (400, 17–18px, line-height 1.75): paragraph text in Ink Soft on white, Cream at 75–85% on orchid. Measure capped at 52ch for lead paragraphs, 62ch maximum anywhere.
- **Label** (700, 11–12.5px, tracking 0.24–0.26em, uppercase): eyebrows, footer wordmark, fleet tabs, button text (0.1em). The widest tracking in the system, and the reason it reads as signage.
- **Figure** (500, 11–13px, Plex Mono): flight numbers, IATA codes, block times, barcode digits. Never used for prose.

### Named Rules

**The No Middle Rule.** Type is either very large (display/headline) or very small and letterspaced (label). The 22px title is the only step between them. Reaching for 28px or 32px body-ish headings means the hierarchy has slipped.

**The Tracking Inversion Rule.** Large type tracks negative (-0.03em and tighter); small type tracks wide (0.24em and up). The two move in opposite directions as size changes, and that contrast is the typographic signature.

**The Mono Is Data Rule.** IBM Plex Mono appears only where a real figure from the timetable is printed. It is never a stylistic choice for labels or code-like decoration.

## Layout

A single centred column of `1240px` maximum, with `3rem` (px-12) side padding held at every section — the container is consistent enough that the alternating grounds, not the width, are what mark one section from the next.

Section rhythm runs `pt-18`/`pt-20` to `pb-24`/`pb-32` (roughly 4.5rem top, 6rem–8rem bottom) on white blocks; orchid blocks are sized by content or fill the viewport outright (`min-h-svh` on Join Us, so arriving there shows that and nothing else).

Multi-column content uses intrinsic grids rather than fixed column counts: `grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))]` with `gap-x-14 gap-y-11`. Columns collapse when they run out of room, with no breakpoint to maintain.

Responsive behaviour is handled at content-driven breakpoints, not a device scale: `68rem`, `46rem`, `34rem`, `26rem`, plus `860px` where the fleet stage changes layout and `(hover: hover)` where a hover-only affordance needs a pointer to exist. Anchor targets carry `scroll-margin-top: 7rem` so the sticky header never covers a landing.

### Named Rules

**The One Container Rule.** `max-w-[1240px]` and `px-12` on every block. A section that widens or narrows its own container to feel different is solving the problem the ground swap already solves.

**The Intrinsic Column Rule.** Columns wrap by `auto-fit` + `minmax`, never by a breakpoint-keyed column count. Adding a region, a service or a crew member must never require touching a media query.

## Elevation & Depth

Flat by default. Surfaces on white sit at page level and are separated by 1px hairlines and the tonal step down to Surface Sunken — no resting shadows, no borders-plus-shadow together. Shadow appears only when an element genuinely floats above the page, and then it is large, soft and deeply tinted rather than a subtle lift.

### Shadow Vocabulary
- **Ticket** (`box-shadow: 0 40px 90px rgba(9, 4, 18, 0.45)`): the Route Detail dialog, and the fleet's own overlay (`0 40px 90px rgba(9, 2, 24, 0.55)`). A held object over a dimmed page.
- **Map card** (`box-shadow: 0 22px 46px rgba(54, 10, 111, 0.18)`): the region card floating over the world map. Purple-tinted because it falls on a purple-cast surface.
- **Hero lift** (`box-shadow: 0 -26px 70px rgba(12, 2, 30, 0.62)`): cast upward, not down — the hero card climbs over the video clip and the shadow is what sells the overlap.
- **Menu** (`box-shadow: 0 24px 60px rgba(30, 6, 64, 0.18)`): the Inside TGVA dropdown.
- **Beacon ring** (`box-shadow: 0 0 0 0 → 14px rgba(216, 166, 87, 0.6 → 0)`): not depth. An expanding gold ring animated out past the button's own `overflow: hidden`.

### Named Rules

**The Floating-Or-Flat Rule.** An element either sits on the page (flat, hairline-bordered) or floats above it (large soft shadow, no border needed). There is no small resting shadow in this system, and `shadow-sm`-scale lifts are a drift signal.

## Shapes

Two radii and almost nothing between them. Buttons are full pills (`9999px`) — the only fully round shape, which is what makes them read as controls. Floating surfaces take `14px`; the nav dropdown and its items take `12px`; small controls take `6px`. Tabs and the ticket's close control take `3px`, near-square, because they belong to the document rather than to the interface.

The ticket is the system's signature silhouette: `4px 4px 14px 14px` — squared at the top where it is torn from a strip, rounded at the foot where it is held, with notches cut at the perforation line.

Recurring geometry: the 45°-rotated diamond (`DiamondRule`), used in pairs of one gold and one orchid-light between story beats; hairline rules that gradient from gold to `brand/15` rather than terminating flat; and the aircraft silhouette, drawn to published dimensions so every type in the fleet shares one scale.

### Named Rules

**The Pill-Means-Action Rule.** `rounded-full` belongs to buttons and status dots only. A pill-shaped card or panel breaks the one shape cue the interface has.

## Components

### Buttons
Kinetic and airline-mechanical. The label rolls out as a panel drops in behind it — one surface replacing another, not a colour tint.

- **Shape:** full pill (`border-radius: 9999px`); on hover the dropping panel squares to `0` as it lands, which is what makes the swap read as mechanical.
- **Typography:** Archivo 700, `tracking-[0.1em]`, uppercase labels.
- **Sizes:** default `15px 28px` at 14px; compact `13px 24px` at 13.5px (header only, where a section-sized button would set the bar height); beacon `18px 36px` at 15px.
- **Primary:** Cabin Gold ground, Ink label → hover Cream ground, Royal Orchid label.
- **Outline:** 1.5px `cream/50` border, Cream label → hover Cabin Gold border and label. The default on orchid grounds.
- **Light:** Cream at 90%, Royal Orchid label → hover Cabin Gold ground, Ink label.
- **Motion tiers:** `still` (colour swap only) is the default and belongs on most buttons. `roll` (panel + label roll, 0.5s / 0.7s) and `beacon` (2.8s infinite gold ring, paused on hover) are reserved for the handful of calls the page is built around.
- **Launch:** a button whose href leaves the site flies a plane across itself over 1.2s, laying a black trail, then opens the tab. Skipped entirely under `prefers-reduced-motion`.

### Navigation
- **Bar:** sticky, `rgba(255,255,255,0.95)` with `backdrop-filter: blur(16px)`, 1px `rgba(54,10,111,0.15)` bottom border, 1240px inner width. Padding and logo height both animate on scroll (`1.05rem → 0.6rem`, `3rem → 2.25rem`) via registered custom properties. The whole bar translates out of view on scroll down and returns on scroll up.
- **Links:** Archivo 700, 15px, `rgba(54,10,111,0.7)` → Cabin Gold Deep on hover → Royal Orchid when active.
- **Marker:** a 3px Cabin Gold bar, `3px 3px 0 0`, measured from the active link in the component and slid beneath it — so it stays exact however the type wraps or scales.
- **Dropdown:** 12px radius, white, menu shadow, items at `0.85rem 1rem` with a Surface hover fill; the active item is marked by a 6px gold dot before its label. A `::before` bridge spans the gap down from the bar so the pointer never crosses dead space.

### Cards and Panels
- **Floating card** (map region card): `14px` radius, `border: 1px rgba(54,10,111,0.16)`, `rgba(255,255,255,0.95)` with `backdrop-blur`, `18px` padding, map-card shadow. Used where the card genuinely sits over something.
- **Sunken panel** (Inside TGVA): `14px` radius, Surface Sunken ground, `24px 28px` padding, `1px inset ring` at `brand/10`, **no shadow**. Used where the panel is recessed into the page, which is most of the time.
- **Hero card:** `26px` top radius only, 2px `gold/55` top border, Orchid Deep ground, upward shadow. It climbs over the video clip on scroll.

### Inputs
- **Style:** `6px` radius, `1px brand/15` border, Surface ground, 11.5px text, left-padded for an inline icon.
- **Focus:** border turns Cabin Gold; the native outline is suppressed only because the border change replaces it.
- **Global focus:** everything else takes the base rule — `outline: 2px solid var(--color-gold); outline-offset: 3px`.

### Route Detail Ticket (signature)
The system's most distinctive object. A stub in a `150deg` Route Orchid → Orchid Deep gradient, carrying an inverted `mix-blend-mode: screen` world map at 30% (no transparent PNG required — white inverts to black, and black is the identity for `screen`). The great-circle track draws itself, the aircraft flies it, the destination pin drops and keeps pinging. Below the perforation it becomes a boarding pass of labelled fields, then a card per aircraft type, then a barcode foot. A route the timetable has not reached yet turns warm and its flight stops halfway — the state is drawn, not captioned.

### Scroll Reveal
`tgva-reveal`: 28px rise and fade over 0.7s on `--ease-out-soft`, staggered `80ms × index`. Applied by `Reveal.tsx` only after it confirms the element is off screen — never in server markup, or the page would arrive blank and stay blank until the bundle lands.

### Named Rules

**The Earned Motion Rule.** `roll` and `beacon` are spent, not applied. If more than one beacon is visible at once, none of them means anything.

**The Reduced-Motion Floor Rule.** Every animation in the system is disabled under `prefers-reduced-motion: reduce` (`0.01ms` duration, single iteration, smooth scroll off), and every JS-driven sequence — the plane launch above all — checks the media query itself rather than relying on the CSS override.

## Do's and Don'ts

### Do:
- **Do** alternate white and Orchid Deep grounds as the page's rhythm. Every block commits to one.
- **Do** draw structure on white with 1px hairlines at `brand/15`, and recess panels to Surface Sunken rather than lifting them.
- **Do** keep gold to one mark per viewport — the focus ring, the nav marker, or the beacon.
- **Do** set Plex Mono for real timetable figures only: flight numbers, IATA codes, block times.
- **Do** hold `max-w-[1240px]` and `px-12` on every section, and let columns wrap by `auto-fit` + `minmax`.
- **Do** invert the tracking with the size: negative at display scale, 0.24em+ at label scale.
- **Do** put new colours through the token block in `app/globals.css` under `@theme`, never as a literal in a component.
- **Do** disable every new animation under `prefers-reduced-motion`, and check the media query in JS for anything the CSS override cannot reach.

### Don't:
- **Don't** add a small resting shadow. Elements are flat on the page or floating above it; `shadow-sm`-scale lifts belong to a different system.
- **Don't** use `rounded-full` on anything but a button or a status dot.
- **Don't** introduce type between 22px and the headline clamp. The missing middle is deliberate.
- **Don't** drift toward the generic SaaS landing page: gradient blobs, floating 3D shapes, a 3-up grid of `rounded-2xl` cards, Inter as the voice.
- **Don't** drift toward the gamer or Discord-server aesthetic: neon on near-black, heavy glows, aggressive angular cuts. TGVA is an airline, not a clan.
- **Don't** borrow real airline booking furniture — fare tables, date pickers, seat maps, promo carousels. TGVA sells nothing, and the interface must never imply it does.
- **Don't** override `ActionLink` variant colours through `className`. Competing utilities resolve by stylesheet order, not by which one was passed last.
- **Don't** draw a decorative arc where a real great-circle track is available. Every line on the map comes from actual coordinates.
- **Don't** spend a third accent colour. Two brand colours and one neutral ramp is the whole palette.
