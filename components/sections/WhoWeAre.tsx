import { about, membershipFormUrl } from "@/content/site";
import { ActionLink } from "@/components/ui/ActionLink";
import { HeroLift } from "@/components/motion/HeroLift";
import { Reveal } from "@/components/motion/Reveal";

export function WhoWeAre() {
  return (
    <section id="top" className="relative bg-white">
      {/* The clip and the card climb towards each other on scroll; HeroLift
          drives both from one listener. */}
      <HeroLift className="relative overflow-hidden bg-brand-deep">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_30%,rgba(216,166,87,0.16)_0%,rgba(216,166,87,0)_60%)]"
        />

        <div
          data-hero-clip
          className="relative z-1 h-[clamp(26.25rem,52vw,47.5rem)] w-full overflow-hidden bg-brand-deep"
        >
          <video
            src="/video/who-we-are.mp4"
            poster="/images/who-we-are-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            /* max-w-none is required: Tailwind's preflight caps video at max-width:100%,
               which would clip the 160px of extra width used to shift the framing left. */
            className="tgva-hero-video block h-full w-[calc(100%+160px)] max-w-none -ml-40 object-cover object-[center_65%] saturate-105 contrast-[1.04]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(30,6,64,0.9)_0%,rgba(30,6,64,0.25)_12%,rgba(30,6,64,0)_30%,rgba(30,6,64,0)_62%,rgba(30,6,64,0.35)_84%,rgba(30,6,64,0.72)_100%)]"
          />
        </div>

        {/* Rests flush under the clip and climbs over it as the page scrolls.
            The strip it uncovers below is the wrapper's own brand-deep, so the
            climb leaves nothing to see. */}
        <div className="tgva-hero-card relative z-2 mx-auto w-[min(100%-4rem,97.5rem)] rounded-t-[26px] border-t-2 border-gold/55 bg-brand-deep shadow-[0_-26px_70px_rgba(12,2,30,0.62)]">
          <div id="about" className="mx-auto max-w-[1240px] px-12 pt-14 pb-12 text-cream">
            <Reveal>
              <p className="font-display text-[12px] font-bold tracking-[0.26em] text-gold">
                {about.eyebrow}
              </p>
            </Reveal>

            <Reveal index={1}>
              <h1 className="mt-5 font-display text-[clamp(2.75rem,6.4vw,5.75rem)] font-extrabold leading-[0.95] tracking-[-0.035em] text-white text-balance [text-shadow:0_2px_30px_rgba(21,14,34,0.5)]">
                {about.heading}
              </h1>
            </Reveal>

            <Reveal index={2} className="mt-8.5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-10">
              {about.paragraphs.map((text) => (
                <p key={text} className="text-lg leading-relaxed text-cream/85 text-pretty">
                  {text}
                </p>
              ))}
            </Reveal>

            <Reveal index={3} className="mt-11 border-t border-cream/15 pt-9">
              <div className="flex flex-wrap items-center gap-3">
                {about.actions.map((action) => (
                  <ActionLink key={action.href} href={action.href} variant={action.variant}>
                    {action.label}
                  </ActionLink>
                ))}
                <ActionLink href={membershipFormUrl} variant="primary" motion="beacon">
                  JOIN US
                </ActionLink>
              </div>
            </Reveal>
          </div>
        </div>
      </HeroLift>
    </section>
  );
}
