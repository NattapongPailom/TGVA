import { story } from "@/content/site";
import { Reveal } from "@/components/motion/Reveal";
import { StoryReel } from "@/components/media/StoryReel";

/**
 * Video-led story section: the showreel opens at cinema proportions carrying the
 * headline, and the copy follows underneath as three labelled columns.
 */
export function OurStory() {
  return (
    <section id="story" className="bg-white pb-20">
      <StoryReel
        src="/video/showreel.mp4"
        captions="/video/showreel.en.vtt"
        eyebrow={story.eyebrow}
        heading={story.heading}
      />

      <div className="mx-auto mt-14 grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))] gap-x-14 gap-y-11 px-12">
        {story.columns.map((column, i) => (
          <Reveal key={column.label} index={i}>
            <article>
              <p className="font-display text-[22px] font-extrabold tracking-[0.06em] text-brand">
                {column.label}
              </p>
              <p className="mt-4.5 text-[17px] leading-[1.75] text-ink-soft text-pretty">
                {column.body}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
