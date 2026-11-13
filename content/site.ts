import { regions } from "@/content/regions";

/** Membership sign-up form. Swap this one constant if the form is ever replaced. */
export const membershipFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSeIGvvaSnKmKiFZMC_Q8-JM5GO4uN0d_YE1qhgiUuEinjqvkA/viewform";

/**
 * The bar's own map of the page.
 *
 * `sections` lists the ids an entry stands for, which is what lets the bar mark
 * the section the reader is currently in — add a section to the page, name it
 * here, and the marker follows it with nothing else to change. Links are
 * root-relative (`/#what`) so they still work from a page other than the home
 * one, such as Events.
 */
export type NavItem = {
  key: string;
  label: string;
  href?: string;
  sections: string[];
  children?: { label: string; href: string; section: string; note: string }[];
};

export const nav: NavItem[] = [
  { key: "about", label: "About Us", href: "/#about", sections: ["top", "story", "windowseat"] },
  {
    key: "inside",
    label: "Inside TGVA",
    sections: ["what", "vision", "staff"],
    children: [
      {
        label: "What We Do",
        href: "/#what",
        section: "what",
        note: "Operations, routes, events and the pilot community",
      },
      {
        label: "Vision & Mission",
        href: "/#vision",
        section: "vision",
        note: "What we fly for, and the promises behind it",
      },
      {
        label: "Staff",
        href: "/#staff",
        section: "staff",
        note: "The people who run TGVA, and the seats still open",
      },
    ],
  },
  { key: "where", label: "Where We Fly", href: "/#wherewefly", sections: ["wherewefly"] },
  { key: "fleet", label: "Our Fleet", href: "/#fleet", sections: ["fleet"] },
];

/**
 * Community channels, shown as icons in the bar. A channel with no URL yet is
 * left out rather than linked nowhere — fill in the href and it appears.
 * `short` is the name the phone menu prints when the full one will not fit.
 */
export const social: {
  icon: "discord" | "instagram" | "infiniteflight";
  label: string;
  short?: string;
  href: string;
}[] = [
  { icon: "discord", label: "Discord", href: "https://discord.gg/cV84VuPEc9" },
  { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/if.tgva/" },
  {
    icon: "infiniteflight",
    label: "Infinite Flight Community",
    short: "IF Community",
    href: "https://community.infiniteflight.com/u/thaiairwaysvirtual/summary",
  },
];

/**
 * Everything below is the team's own copy, transcribed from their document.
 * Nothing here is written for them: if a line is missing, the section it
 * belongs to says so rather than filling the gap.
 */
export const about = {
  eyebrow: "WELCOME TO THAI AIRWAYS VIRTUAL",
  /**
   * The page's h1, "About Us" at the owner's request (1 Nov 2026). The motto
   * line it replaced, "Smooth as Silk, in the virtual skies.", still lives in
   * the paragraph below and in the heading further down. The eyebrow above it
   * carries the airline's name.
   */
  h1: "About Us",
  paragraphs: [
    "Thai Airways Virtual (TGVA) is a virtual airline and aviation community created for people who share a passion for flying, aviation, and the Infinite Flight experience.",
    "Inspired by the identity and hospitality of Thailand, TGVA brings the spirit of \u201cSmooth as Silk\u201d into the virtual skies. We aim to provide an enjoyable, professional, and welcoming environment where pilots can fly, connect, and grow together.",
  ],
  actions: [
    { href: "#what", label: "WHAT WE DO", variant: "outline" as const },
    { href: "#story", label: "OUR STORY", variant: "outline" as const },
    { href: "#wherewefly", label: "WHERE WE FLY", variant: "outline" as const },
  ],
};

export const story = {
  eyebrow: "OUR STORY",
  heading: "Smooth as Silk.",
  /** Each column carries one idea, so the label tells the reader what it answers. */
  columns: [
    {
      label: "WHERE WE OPERATE",
      body: "Our operations connect pilots with destinations across Thailand and Asia, offering scheduled flights, special events, group flights, and opportunities to experience a wide variety of routes and aircraft.",
    },
    {
      label: "MORE THAN AN AIRLINE",
      body: "But TGVA is more than just a virtual airline. We are a community built on passion, teamwork, professionalism, and friendship. Every pilot has a role in shaping our journey and contributing to the future of TGVA.",
    },
    {
      label: "WHERE WE ARE HEADING",
      body: "As we continue to grow, our goal is to build a strong and respected virtual aviation community that proudly represents the spirit of Thailand while connecting pilots from around the world.",
    },
  ],
};

/**
 * The staff, as the team's document lists them, shown in the Staff block at
 * the foot of Inside TGVA. A post with no name against it yet prints as a
 * standby pass and an open line on the manifest, rather than being left off —
 * the structure is the airline's, and the names arrive as they are appointed.
 *
 * `photo` is a path under public/; until one is given the pass shows the
 * person's initials. `links` takes a URL per channel; a channel without one
 * shows its mark as not yet linked rather than linking nowhere.
 *
 * Infinite Flight Community is the only channel. Personal Discord and
 * Instagram accounts were removed at the owner's request of 13 Nov 2026 as too
 * personal; the airline's own Discord and Instagram stay in the header and
 * footer.
 */
export type StaffLinks = Partial<Record<"infiniteflight", string>>;

export const team: {
  role: string;
  name: string | null;
  blurb: string;
  photo?: string;
  links?: StaffLinks;
}[] = [
  {
    role: "Chief Executive Officer",
    name: "Tjb0709",
    blurb: "Leads TGVA and sets the direction the community flies in.",
    links: {},
  },
  {
    role: "Chief Operating Officer",
    name: "IFTH-Prichachan",
    blurb: "Runs the airline day to day and keeps operations moving.",
    /* The owner's photo, cropped to the pass's passport shape; the original
       is in _source-media/staff-originals. */
    photo: "/images/staff/coo.jpg",
    links: {},
  },
  {
    role: "Chief Pilot",
    name: null,
    blurb: "Owns flight standards and how every TGVA route is flown.",
  },
  {
    role: "Human Resources Director",
    name: null,
    blurb: "Looks after the pilots — joining, records and the people side of the community.",
  },
  {
    role: "Chief Marketing Officer",
    name: null,
    blurb: "Brand, media and everything the outside world sees of TGVA.",
  },
];

/** The Staff block's own copy, approved by the owner on 5 Nov 2026. */
export const staff = {
  eyebrow: "INSIDE TGVA",
  lead: "Meet the",
  word: "STAFF",
  description:
    "The people who keep TGVA flying. Our staff lead the airline, set the standards every route is flown to, and welcome each new pilot into the community. Some seats are still open — yours could be next.",
  /** How many passes the block shows before "View all staff". */
  shown: 4,
};

/**
 * The full roster opens as a General Declaration — the document an airline
 * files listing the crew aboard. `reference` is a document reference, not a
 * flight number: there is no flight, and the page does not invent one.
 */
export const manifest = {
  kicker: "THAI AIRWAYS VIRTUAL · TGVA",
  title: "General Declaration",
  subtitle: "Crew Manifest",
  reference: "TGVA/GD/STAFF",
  certification: "CERTIFIED · TGVA OPERATIONS",
  note: "This declaration lists TGVA\u2019s staff positions. Open positions are filled from the membership.",
};

/**
 * `emphasis` is the part of the title drawn in gold on the card — the word the
 * service is actually about. It must be a substring of `title`; the card splits
 * the title on it, so the copy itself stays one string with nothing to keep in
 * step.
 */
export const services = {
  lead: "More than a flight. It\u2019s the TGVA experience.",
  intro:
    "At Thai Airways Virtual (TGVA), we aim to create an immersive and enjoyable virtual aviation experience for pilots around the world. From scheduled flights to community events, every part of TGVA is designed to bring aviation enthusiasts together.",
  items: [
    {
      title: "Virtual Airline Operations",
      emphasis: "Airline Operations",
      blurb:
        "Experience the world of Thai aviation through our virtual airline operations. Pilots can operate TGVA flights across our domestic and international network while representing the TGVA brand in the virtual skies.",
    },
    {
      title: "Domestic & International Routes",
      emphasis: "International Routes",
      blurb:
        "Explore destinations across Thailand, Asia, and beyond. Our route network gives pilots the opportunity to experience a wide variety of airports, aircraft, and flight environments.",
    },
    {
      title: "Scheduled & Special Flights",
      emphasis: "Special Flights",
      blurb:
        "Take part in regular operations as well as specially organised flights and group events. Fly together with fellow TGVA pilots and experience the journey as a community.",
    },
    {
      title: "Infinite Flight Operations",
      emphasis: "Infinite Flight",
      blurb:
        "TGVA is built around the Infinite Flight experience, allowing aviation enthusiasts to enjoy realistic virtual flying while becoming part of an international pilot community.",
    },
    {
      title: "Pilot Community",
      emphasis: "Community",
      blurb:
        "Join a community of aviation enthusiasts who share the same passion for flying. Connect with fellow pilots, exchange experiences, and enjoy virtual aviation together.",
    },
    {
      title: "Pilot Development & Achievements",
      emphasis: "Achievements",
      blurb:
        "TGVA encourages pilots to develop their skills and become more active within the community through flight participation, achievements, ranks, and other opportunities.",
    },
    {
      title: "Community Events",
      emphasis: "Events",
      blurb:
        "From group flights to special aviation events, TGVA regularly brings pilots together to experience memorable flights and create lasting connections.",
    },
    {
      title: "Partnerships & Community Connections",
      emphasis: "Community Connections",
      blurb:
        "We work with other Virtual Airlines and aviation communities to create opportunities for collaboration, joint events, and shared experiences across the virtual aviation world.",
    },
  ],
  commitment: {
    label: "OUR COMMITMENT",
    body: "At TGVA, every service has one purpose \u2014 to make every flight enjoyable, every journey meaningful, and every pilot feel part of something bigger.",
  },
};

/** Set as a quotation, so it carries an attribution rather than a label. */
export const vision = {
  statement:
    "To be a leading virtual airline that connects aviation enthusiasts worldwide through professionalism, Thai hospitality, and a passion for flight.",
  attribution: "Thai Airways Virtual",
  role: "Our vision",
};

export const mission = [
  "Deliver authentic and enjoyable virtual aviation experiences that reflect the pride of Thai Airways.",
  "Provide training, events, and opportunities that inspire growth and professionalism among members.",
  "Build a welcoming community founded on respect, teamwork, and the spirit of Thai hospitality.",
  "Connect the world through virtual skies, while fostering a passion for aviation in future generations.",
];

/**
 * Built from the route network so the ticker can never drift out of sync with
 * it — add a destination in regions.ts and it appears here automatically.
 */
export const destinationTicker = [
  "BANGKOK",
  ...regions.flatMap((region) => region.destinations.map((destination) => destination.city)),
];

/**
 * Footer link columns. A link with an empty `href` has no URL yet and renders
 * as plain text rather than one that goes nowhere — fill it in and it becomes
 * a link with nothing else to change.
 */
export const footerColumns = [
  {
    title: "Explore",
    links: [
      { href: "/#about", label: "About Us" },
      { href: "/#what", label: "What We Do" },
      { href: "/#wherewefly", label: "Where We Fly" },
      { href: "/#fleet", label: "Our Fleet" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/#story", label: "Our Story" },
      { href: "/#vision", label: "Vision & Mission" },
      { href: "/events", label: "Events" },
    ],
  },
  {
    /* Discord and Instagram are not listed here: the footer draws them as
       marks under the columns, where an icon says more than its own name. */
    title: "Connect",
    links: [
      { href: membershipFormUrl, label: "Become a member" },
      { href: "/events", label: "Events" },
    ],
  },
];

/**
 * The footer's credit for the aircraft photographs. The list itself is read
 * off content/fleet.ts, so a credited image added there is credited here.
 * Creative Commons asks for the changes to be named, and a ShareAlike licence
 * for the adapted image to be offered on the same terms; this says both.
 */
export const photoCreditsCopy = {
  title: "Photo credits",
  intro:
    "These aircraft photographs come from Wikimedia Commons. Each was cut out of its background and its colour lifted, and the adapted image is shared under the same licence as the original.",
};

/** A virtual airline has to say so plainly. */
export const footerNote =
  "Thai Airways Virtual is a non-profit flight simulation community. It is not affiliated with Thai Airways International Public Company Limited.";

/**
 * The window-seat interlude after Our Story. The tagline is the team's own,
 * from their "Fly with TGVA" poster; `accent` is the phrase the poster sets in
 * gold, and the page does the same.
 */
export const windowSeat = {
  lead: "Fly the",
  accent: "Smooth as Silk.",
  close: "Fly with TGVA.",
  action: { href: membershipFormUrl, label: "BECOME A MEMBER" },
};

export const join = {
  eyebrow: "THIS IS TGVA",
  heading: "This is where your journey begins.",
  /**
   * Three facts, each already established elsewhere in PRODUCT.md: TGVA is a
   * non-profit, flying happens in Infinite Flight, and the hub is Bangkok
   * Suvarnabhumi. Nothing here is new about the airline — it is the first place
   * on the page all three are said in one line, at the moment the reader is
   * deciding.
   */
  caption:
    "A non-profit virtual airline flown in Infinite Flight, from a home base at Bangkok Suvarnabhumi.",
  actions: [
    /* The white-ground pair: this block is the one light ground on the page. */
    { href: membershipFormUrl, label: "BECOME A MEMBER", variant: "gold" as const },
    { href: "#wherewefly", label: "EXPLORE THE NETWORK", variant: "line" as const },
  ],
};
