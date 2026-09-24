import type { CSSProperties } from "react";
import { services, vision, mission, team } from "@/content/site";
import { ChapterRail, type Chapter } from "@/components/sections/ChapterRail";
import { ServiceRail } from "@/components/sections/ServiceRail";
import { OrchidMark } from "@/components/motion/OrchidMark";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Three chapters under one heading. The left column stays put while the right
 * one scrolls, and the rail at its foot marks where the reader has got to —
 * the ids below are what the rail and the site nav both point at.
 */
const CHAPTERS: readonly Chapter[] = [
  { id: "what", label: "What We Do" },
  { id: "vision", label: "Vision & Mission" },
  { id: "team", label: "Meet the Staff" },
];

export function InsideTgva() {
  return (
    <section className="bg-white px-12 pt-18 pb-24">
      <div className="mx-auto grid max-w-[1240px] items-start gap-x-16 gap-y-4 md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
        {/* min-h keeps the rail down at the foot of the viewport rather than
            tucked under the intro, which is what makes it read as a status. */}
        <div className="md:sticky md:top-28 md:flex md:min-h-[calc(100vh-9rem)] md:flex-col md:justify-between">
          <div>
            <p className="font-display text-xs font-bold tracking-[0.26em] text-brand-light">
              INSIDE TGVA
            </p>
            <h2 className="mt-5 font-display text-[clamp(2.375rem,4.6vw,3.875rem)] font-extrabold leading-none tracking-[-0.03em] text-brand text-balance">
              How We Operate
            </h2>
            <p className="mt-7 max-w-[44ch] text-[17px] leading-relaxed text-ink-soft text-pretty">
              Three parts make up TGVA — what we do, where we are heading, and the
              people behind all of it.
            </p>
          </div>

          <ChapterRail chapters={CHAPTERS} />
        </div>

        <div className="flex flex-col gap-24">
          <article id="what">
            <ServiceRail
              heading={<ChapterHeading title="What We Do" />}
              lead={services.lead}
              intro={services.intro}
              items={services.items}
            />

            {/* White, not sunken: the filled cards took that ground, and the
                line that closes them has to sit apart from them. */}
            <Reveal className="mt-4.5 rounded-[14px] bg-white px-7 py-6.5 ring-1 ring-brand/12 ring-inset">
              <p className="font-display text-[10.5px] font-bold tracking-[0.2em] text-gold-deep">
                {services.commitment.label}
              </p>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-soft text-pretty">
                {services.commitment.body}
              </p>
            </Reveal>
          </article>

          <article id="vision">
            <ChapterHeading title="Vision & Mission" />

            <Reveal>
              {/* Set as a pull quote: the mark and the rule down the left carry
                  the statement, and the attribution below names its owner —
                  which is the label, so no eyebrow is needed above it. */}
              <figure className="mt-9 grid grid-cols-[2.25rem_1fr] gap-x-4">
                <div aria-hidden className="flex flex-col items-center">
                  <span className="font-display text-[38px] font-extrabold leading-[0.7] text-gold">
                    &ldquo;
                  </span>
                  <span className="mt-3 w-px flex-1 bg-brand/15" />
                </div>

                <div>
                  <blockquote className="font-display text-[clamp(1.5rem,2.9vw,2.125rem)] font-extrabold leading-[1.22] tracking-[-0.025em] text-brand text-balance">
                    {vision.statement}
                  </blockquote>
                  <figcaption className="mt-8 flex items-center gap-3.5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-sunken ring-1 ring-brand/10 ring-inset">
                      <OrchidMark className="size-6.5" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-display text-sm font-bold text-brand">
                        {vision.attribution}
                      </span>
                      <span className="text-[13px] text-ink-mute">{vision.role}</span>
                    </span>
                  </figcaption>
                </div>
              </figure>
            </Reveal>

            {/* Four cards fanned like a hand of passes, each straightening
                when the reader reaches for it. A centred fan wants a centred
                label, so the mission names itself between the divider's own
                diamonds rather than under a rule running off to one side. */}
            <Reveal className="mt-12">
              <div className="tgva-stack-head">
                <i aria-hidden />
                <i aria-hidden />
                <span>OUR MISSION</span>
                <i aria-hidden />
                <i aria-hidden />
              </div>

              <div className="tgva-stack">
                {mission.map((item, i) => (
                  <article
                    key={item}
                    className="tgva-mission-card"
                    style={{ "--tgva-mission-rot": `${-4 + i * 2.6}deg` } as CSSProperties}
                  >
                    <i aria-hidden />
                    <p>{item}</p>
                  </article>
                ))}
              </div>
            </Reveal>
          </article>

          <article id="team">
            <ChapterHeading title="Meet the Staff" />

            <Reveal>
              <p className="mt-7 max-w-[52ch] text-[16px] leading-relaxed text-ink-soft text-pretty">
                The people who run TGVA — and the posts still open to be filled.
              </p>
            </Reveal>

            <ul className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-x-8 gap-y-9">
              {team.map((member, i) => (
                <li key={member.role}>
                  {/* No portraits: the team has published none, and a grey box
                      standing in for one says less than the post itself. */}
                  <Reveal index={i} className="border-t-2 border-brand/75 pt-5">
                    <p className="font-display text-[10.5px] font-bold tracking-[0.18em] text-gold-deep">
                      {member.role.toUpperCase()}
                    </p>
                    <p className="mt-3.5 font-display text-[21px] font-extrabold tracking-[-0.015em] text-brand">
                      {member.name ?? <span className="text-ink-mute/60">To be announced</span>}
                    </p>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-ink-mute text-pretty">
                      {member.blurb}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

function ChapterHeading({ title }: { title: string }) {
  return (
    <Reveal>
      <h3 className="font-display text-[clamp(2.625rem,5.2vw,4.25rem)] font-extrabold leading-[0.95] tracking-[-0.035em] text-brand text-balance">
        {title}
      </h3>
    </Reveal>
  );
}
