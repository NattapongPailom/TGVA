import Image from "next/image";
import { about, membershipFormUrl } from "@/content/site";
import { ActionLink } from "@/components/ui/ActionLink";
import { HeroLift } from "@/components/motion/HeroLift";
import { AmbientVideo } from "@/components/media/AmbientVideo";
import { Reveal } from "@/components/motion/Reveal";

export function WhoWeAre() {
  return (
    <section id="top" className="relative bg-white">
      {/* The clip and the card climb towards each other on scroll; HeroLift
          drives both from one listener. */}
      {/* The gold wash that used to sit here is gone. Seven separate gold marks
          shared the first viewport, and gold is the system's only light — it is
          supposed to show one thing. The card's 2px gold edge is the documented
          one; a glow behind it was competing with its own border. */}
      <HeroLift className="relative overflow-hidden bg-brand-deep">
        {/* Roleplay livery, not a membership claim: TGVA is a virtual airline and
            the alliance mark is part of the fiction it flies in. Set in cream
            rather than its own greyscale — the mark's dark faces fall to within
            a few points of this ground and the star breaks up. The name is set
            under it as live text, the way the alliance's own lockup reads, so
            the image itself carries no alt. */}
        <div className="tgva-hero-alliance">
          <Image src="/images/star-alliance-cream.png" alt="" width={328} height={310} />
          <span>STAR ALLIANCE</span>
        </div>

        <div
          data-hero-clip
          /* On a phone the clip is sized to the airframe, not to the hero. The
             aircraft spans ~1300 of the footage's 1600px, so the full jet only
             fits while the box is no taller than ~73% of its width — the
             420px floor the desktop uses cut off both the nose and the tail. */
          className="relative z-1 h-[min(73vw,26.25rem)] w-full overflow-hidden bg-brand-deep md:h-[clamp(26.25rem,52vw,47.5rem)]"
        >
          <AmbientVideo
            src="/video/who-we-are.mp4"
            poster="/images/who-we-are-poster.jpg"
            /* max-w-none is required: Tailwind's preflight caps video at max-width:100%,
               which would clip the 160px of extra width used to shift the framing left.
               Below md there is no shift: the frame is held on the airframe instead,
               whose centre sits right of the footage's own. */
            className="tgva-hero-video block h-full w-full max-w-none object-cover object-[93%_55%] saturate-105 contrast-[1.04] md:-ml-40 md:w-[calc(100%+160px)] md:object-[center_65%]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(30,6,64,0.9)_0%,rgba(30,6,64,0.25)_12%,rgba(30,6,64,0)_30%,rgba(30,6,64,0)_62%,rgba(30,6,64,0.35)_84%,rgba(30,6,64,0.72)_100%)]"
          />
        </div>

        {/* Rests flush under the clip and climbs over it as the page scrolls.
            The strip it uncovers below is the wrapper's own brand-deep, so the
            climb leaves nothing to see. */}
        <div className="tgva-hero-card relative z-2 mx-auto w-[min(100%-2rem,97.5rem)] md:w-[min(100%-4rem,97.5rem)] rounded-t-[26px] border-t-2 border-gold/55 bg-brand-deep shadow-[0_-26px_70px_rgba(12,2,30,0.62)]">
          <div id="about" className="tgva-gutter mx-auto max-w-[1240px] pt-14 pb-12 text-cream">
            <Reveal>
              <p className="font-display text-[12px] font-bold tracking-[0.26em] text-gold">
                {about.eyebrow}
              </p>
            </Reveal>

            <Reveal index={1}>
              <h1 className="mt-5 font-display text-[clamp(2.75rem,6.4vw,5.75rem)] font-extrabold leading-[0.95] tracking-[-0.035em] text-white text-balance [text-shadow:0_2px_30px_rgba(21,14,34,0.5)]">
                {about.h1}
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
                {/* `roll`, not `beacon`. The header's JOIN US is the page's one
                    beacon and it follows the reader the whole way down; two of
                    them pulsing in the same viewport on first paint meant
                    neither was the important one. */}
                <ActionLink href={membershipFormUrl} variant="primary" motion="roll">
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
