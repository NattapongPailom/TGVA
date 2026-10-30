import type { CSSProperties } from "react";
import { services, vision, mission } from "@/content/site";
import { ChapterRail, type Chapter } from "@/components/sections/ChapterRail";
import { ServiceRail } from "@/components/sections/ServiceRail";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { DiamondRule } from "@/components/ui/DiamondRule";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Three chapters under one heading. The left column stays put while the right
 * one scrolls, and the rail at its foot marks where the reader has got to —
 * the ids below are what the rail and the site nav both point at.
 */
const CHAPTERS: readonly Chapter[] = [
  { id: "what", label: "What We Do" },
  { id: "vision", label: "Vision & Mission" },
];

export function InsideTgva() {
  return (
    <section className="tgva-gutter bg-white pt-18 pb-24">
      {/* `minmax(0,1fr)` on the single-column case too, not just on the two-column
            one. An `auto` track takes its minimum from its content, and the service
            rail's min-content is the sum of its eight cards — 2961px. The track grew
            to that inside a 372px box and `overflow-x: clip` cropped the rest, which
            put SHOW ALL at x=2822 and the mission stack off-screen entirely. The
            desktop template never had the problem because it already says
            minmax(0, …). */}
        <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] items-start gap-x-16 gap-y-4 md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
        {/* min-h keeps the rail down at the foot of the viewport rather than
            tucked under the intro, which is what makes it read as a status. */}
        <div className="md:sticky md:top-28 md:flex md:min-h-[calc(100vh-9rem)] md:flex-col md:justify-between">
          <div>
            <SectionHeading layout="stack" eyebrow="Inside TGVA" title="How We Operate" />
            <p className="mt-7 max-w-[44ch] text-[17px] leading-[1.75] text-ink-soft text-pretty">
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
              <Eyebrow tone="gold-deep">{services.commitment.label}</Eyebrow>
              <p className="mt-3 text-[17px] leading-[1.75] text-ink-soft text-pretty">
                {services.commitment.body}
              </p>
            </Reveal>
          </article>

          <article id="vision">
            <ChapterHeading title="Vision & Mission" />

            <Reveal>
              {/* The airline's statement, printed. It used to carry a testimonial's
                  furniture — an open-quote glyph, a rule down the left, a round
                  avatar badge — which is the component every product uses for a
                  customer saying something nice, applied here to an organisation
                  quoting itself. The statement is the whole block now: a hairline
                  above it, the words at section scale, the owner named beneath in
                  the same label type the rest of the site signs things with. */}
              <figure className="mt-9 border-t border-brand/15 pt-8">
                {/* The only long-form copy on the site set at headline scale. The shared
                    Headline step floors at 2.375rem, which is right for a heading of
                    two or three words and wrong for a 145-character statement: on a
                    390px screen it ran to ten lines and 46% of the viewport. This
                    floors on 22px instead — the documented Title step, so it lands on
                    the ramp rather than inventing a size the No Middle Rule forbids —
                    and the leading opens up as the type comes down. Above 478px the
                    two are identical. */}
                <blockquote className="font-display text-[clamp(1.375rem,4.6vw,3.875rem)] font-extrabold leading-[1.3] tracking-[-0.02em] text-brand text-balance min-[478px]:leading-[1.02] min-[478px]:tracking-[-0.03em]">
                  {vision.statement}
                </blockquote>
                <figcaption className="mt-9 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-[11.5px] font-bold tracking-[0.26em] uppercase">
                  <span className="text-gold-deep">{vision.role}</span>
                  <span aria-hidden className="text-brand/30">
                    /
                  </span>
                  <span className="text-brand">{vision.attribution}</span>
                </figcaption>
              </figure>
            </Reveal>

            {/* Four cards fanned like a hand of passes, each straightening
                when the reader reaches for it. A centred fan wants a centred
                label, so the mission names itself between the divider's own
                diamonds rather than under a rule running off to one side. */}
            <Reveal className="mt-12">
              <DiamondRule label="Our mission" className="mb-7.5" />

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

        </div>
      </div>
    </section>
  );
}

function ChapterHeading({ title }: { title: string }) {
  return (
    <Reveal>
      {/* The documented headline step. It used to run 42–68px, larger than the
          h2 it sits under, so the outline and the page disagreed. */}
      <h3 className="font-display text-[clamp(2.375rem,4.6vw,3.875rem)] font-extrabold leading-[0.95] tracking-[-0.035em] text-brand text-balance">
        {title}
      </h3>
    </Reveal>
  );
}
