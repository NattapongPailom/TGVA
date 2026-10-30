"use client";

import { useEffect, useRef, useState } from "react";
import { VideoControls } from "@/components/media/VideoControls";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PauseIcon, PlayIcon } from "@/components/media/TransportIcons";

type Props = {
  src: string;
  poster?: string;
  /** WebVTT captions for the reel's audio. Omit only when there is no audio. */
  captions?: string;
  eyebrow: string;
  heading: string;
};

/** How long the title card holds over the video before it clears. */
const INTRO_MS = 5000;

/**
 * Cinematic showreel: when the section scrolls into view the video starts and a
 * title card holds over a dimmed frame, then both clear so the footage plays
 * unobstructed. The card shows once per visit — repeating it on every scroll-by
 * would nag.
 */
export function StoryReel({ src, poster, captions, eyebrow, heading }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  /** A deliberate pause outranks scrolling: don't restart what someone stopped. */
  const pausedByViewer = useRef(false);
  const [introState, setIntroState] = useState<"waiting" | "showing" | "done">("waiting");
  const [hovered, setHovered] = useState(false);
  /**
   * The transport flash. `id` climbs on every toggle so React remounts the
   * element and the animation replays even on a rapid second tap.
   */
  const [burst, setBurst] = useState<{ id: number; playing: boolean } | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!pausedByViewer.current) void video.play().catch(() => {});
          setIntroState((state) => (state === "waiting" ? "showing" : state));
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (introState !== "showing") return;
    const timer = setTimeout(() => setIntroState("done"), INTRO_MS);
    return () => clearTimeout(timer);
  }, [introState]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    const willPlay = video.paused;
    pausedByViewer.current = !willPlay;
    if (willPlay) void video.play().catch(() => {});
    else video.pause();

    setBurst((previous) => ({ id: (previous?.id ?? 0) + 1, playing: willPlay }));
  };

  const introVisible = introState === "showing";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative aspect-21/9 overflow-hidden bg-ink max-md:aspect-video"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onClick={togglePlayback}
        className="block h-full w-full cursor-pointer object-cover"
      >
        {/* The reel can be unmuted from the control bar, so its audio is real
            content and owes a caption track. The control bar draws the cues
            itself, above its own controls, when the CC button turns it on. */}
        {captions ? (
          <track kind="captions" src={captions} srcLang="en" label="English" />
        ) : null}
      </video>

      {/* Title card — dims the frame while it holds, then releases it. */}
      <div
        aria-hidden={!introVisible}
        className={`pointer-events-none tgva-gutter absolute inset-0 flex flex-col justify-end gap-3 pb-20 transition-opacity duration-1000 ${
          introVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-brand-deep/55" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent" />
        <div className="relative mx-auto flex w-full max-w-[1240px] flex-col gap-3">
          <Eyebrow tone="gold">{eyebrow}</Eyebrow>
          <h2 className="font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-none tracking-[-0.03em] text-white [text-shadow:0_2px_30px_rgba(21,14,34,0.55)]">
            {heading}
          </h2>
        </div>
      </div>

      {/* Transport flash — confirms the tap landed, then gets out of the way. */}
      {burst && (
        <div
          key={burst.id}
          aria-hidden
          onAnimationEnd={() => setBurst(null)}
          className="pointer-events-none absolute inset-0 z-2 flex items-center justify-center"
        >
          <span className="flex size-20 items-center justify-center rounded-full bg-ink/55 text-cream backdrop-blur-md animate-[tgva-transport-burst_620ms_var(--ease-out-soft)_forwards]">
            {burst.playing ? <PlayIcon className="size-8" /> : <PauseIcon className="size-8" />}
          </span>
        </div>
      )}

      <VideoControls videoRef={videoRef} onTogglePlay={togglePlayback} hovered={hovered} />
    </div>
  );
}
