import Image from "next/image";
import Link from "next/link";
import { join } from "@/content/site";
import { regions } from "@/content/regions";
import { ActionLink } from "@/components/ui/ActionLink";
import { OrchidMark } from "@/components/motion/OrchidMark";
import { Reveal } from "@/components/motion/Reveal";

const destinationCount = regions.reduce(
  (total, region) => total + region.destinations.length,
  0,
);

/**
 * The page's closing statement, and the last thing between a reader and the
 * membership form.
 *
 * Two halves: the invitation set as large as the page will carry it, and the
 * aircraft beside it. The two small panels under the buttons and the card on
 * the photograph are the only detail in the block — no rules, no marks, nothing
 * geometric. At this point in the page the words and the aeroplane are enough.
 *
 * It fills the viewport on purpose: arriving here should show this and nothing
 * else, which is also what keeps the detail footer hidden behind it — see the
 * stack in app/page.tsx.
 */
export function JoinUs() {
  return (
    <section
      id="join"
      className="relative z-1 flex min-h-svh flex-col justify-center bg-brand-deep px-12 py-16 text-cream"
    >
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div>
          <Reveal>
            <p className="font-display text-xs font-bold tracking-[0.3em] text-gold">
              {join.eyebrow}
            </p>
            {/* Uppercase and set tight: at this scale the sentence is the
                block's whole composition, so it is allowed to be the largest
                type on the site. */}
            <h2 className="mt-7 font-display text-[clamp(2.5rem,5.6vw,4.75rem)] font-extrabold leading-[0.92] tracking-[-0.04em] uppercase text-balance">
              {join.heading}
            </h2>
          </Reveal>

          <Reveal index={1}>
            <p className="mt-7 max-w-[46ch] text-[18px] leading-relaxed text-cream/75 text-pretty">
              {join.body}
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              {join.actions.map((action, i) => (
                <ActionLink
                  key={action.href}
                  href={action.href}
                  variant={action.variant}
                  motion={i === 0 ? "roll" : "still"}
                >
                  {action.label}
                </ActionLink>
              ))}
            </div>
          </Reveal>

          {/* Two facts a prospective pilot actually asks: where it flies from,
              and what they need to fly it in. */}
          <Reveal index={2} className="mt-10 grid gap-3 sm:grid-cols-2 sm:max-w-[34rem]">
            <Panel label="HUB" value="Bangkok Suvarnabhumi (BKK)" />
            <Panel label="FLOWN IN" value="Infinite Flight" />
          </Reveal>
        </div>

        <Reveal index={1} className="tgva-join-frame">
          <Image
            src="/images/who-we-are-poster.jpg"
            alt="A Thai Airways Virtual A350 climbing away from the coast."
            fill
            sizes="(max-width: 64rem) 92vw, 540px"
            className="tgva-join-photo"
          />

          {/* The mark, set into the corner of the frame rather than drawn on
              top of it. */}
          <span className="tgva-join-mark" aria-hidden>
            <OrchidMark className="size-7" />
          </span>

          <Link href="#wherewefly" className="tgva-join-jump">
            <span>
              <b>Where we fly</b>
              <small>{destinationCount} destinations</small>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </Link>
        </Reveal>
      </div>

      <Reveal index={3} className="mx-auto mt-14 w-full max-w-[1240px]">
        <p className="font-display text-[11px] font-bold tracking-[0.24em] text-cream/40">
          THAI AIRWAYS VIRTUAL
        </p>
      </Reveal>
    </section>
  );
}

function Panel({ label, value }: { label: string; value: string }) {
  return (
    <div className="tgva-join-panel">
      <p className="font-display text-[10px] font-bold tracking-[0.24em] text-gold">{label}</p>
      <p className="mt-2.5 font-display text-[17px] font-bold tracking-[-0.01em] text-cream">
        {value}
      </p>
    </div>
  );
}
