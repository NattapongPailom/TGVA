"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type RefObject,
} from "react";
import {
  CaptionsIcon,
  PauseIcon,
  PlayIcon,
  SoundOffIcon,
  SoundOnIcon,
} from "@/components/media/TransportIcons";

/** Arrow-key seek step, matching the convention most players use. */
const SEEK_STEP_SECONDS = 5;

const HOVER_QUERY = "(hover: hover)";

/** Re-reads when a pointing device is plugged in or removed mid-session. */
function subscribeToHover(onChange: () => void) {
  const query = window.matchMedia(HOVER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Owned by the parent so a manual pause can outrank scroll-triggered playback. */
  onTogglePlay: () => void;
  /** True while the pointer is over the frame. */
  hovered: boolean;
};

/**
 * Transport bar for a video element: play/pause, a draggable scrubber, elapsed
 * time and a mute toggle. State is read from the element's own events rather
 * than tracked separately, so the bar stays correct no matter what else
 * starts, stops or seeks the video.
 */
export function VideoControls({ videoRef, onTogglePlay, hovered }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [focused, setFocused] = useState(false);
  /** Only drawn when the video actually carries a track to turn on. */
  const [hasCaptions, setHasCaptions] = useState(false);
  const [captioned, setCaptioned] = useState(false);
  /** A touch screen never hovers, so there the bar has to stay put. */
  const pointerCanHover = useSyncExternalStore(
    subscribeToHover,
    () => window.matchMedia(HOVER_QUERY).matches,
    // Server render assumes a mouse, matching the markup the client hydrates.
    () => true,
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlayState = () => setPlaying(!video.paused);
    const syncTime = () => setCurrentTime(video.currentTime);
    const syncDuration = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const syncMuted = () => setMuted(video.muted);
    const syncBuffered = () => {
      const { buffered: ranges } = video;
      setBuffered(ranges.length ? ranges.end(ranges.length - 1) : 0);
    };

    // The element can already be loaded and playing by the time this mounts.
    syncPlayState();
    syncTime();
    syncDuration();
    syncMuted();
    syncBuffered();

    video.addEventListener("play", syncPlayState);
    video.addEventListener("pause", syncPlayState);
    video.addEventListener("timeupdate", syncTime);
    video.addEventListener("seeking", syncTime);
    video.addEventListener("loadedmetadata", syncDuration);
    video.addEventListener("durationchange", syncDuration);
    video.addEventListener("volumechange", syncMuted);
    video.addEventListener("progress", syncBuffered);

    return () => {
      video.removeEventListener("play", syncPlayState);
      video.removeEventListener("pause", syncPlayState);
      video.removeEventListener("timeupdate", syncTime);
      video.removeEventListener("seeking", syncTime);
      video.removeEventListener("loadedmetadata", syncDuration);
      video.removeEventListener("durationchange", syncDuration);
      video.removeEventListener("volumechange", syncMuted);
      video.removeEventListener("progress", syncBuffered);
    };
  }, [videoRef]);

  const seekToClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      const video = videoRef.current;
      if (!track || !video || !Number.isFinite(video.duration) || video.duration === 0) return;

      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      video.currentTime = ratio * video.duration;
      setCurrentTime(video.currentTime);
    },
    [videoRef],
  );

  const seekTo = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(video.duration, Math.max(0, seconds));
    setCurrentTime(video.currentTime);
  };

  const handleSliderKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
        seekTo(currentTime + SEEK_STEP_SECONDS);
        break;
      case "ArrowLeft":
        seekTo(currentTime - SEEK_STEP_SECONDS);
        break;
      case "Home":
        seekTo(0);
        break;
      case "End":
        seekTo(duration);
        break;
      case " ":
      case "Enter":
        onTogglePlay();
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  /* Captions are drawn here, not by the browser. Native cues render inside
     the video element, so they always paint beneath this bar and its gradient
     — on touch screens, where the bar never hides, they were all but lost.
     The track is kept `hidden` while captions are on: the browser still loads
     and times the cues, and this component lays the text out above the bar. */
  const [cueText, setCueText] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;

    const syncCue = () => {
      const active = Array.from(tracks)
        .filter((track) => track.mode !== "disabled")
        .flatMap((track) => Array.from(track.activeCues ?? []));
      // Cue text can carry WebVTT voice and styling tags; only the words show.
      setCueText(
        active
          .map((cue) => (cue instanceof VTTCue ? cue.text.replace(/<[^>]+>/g, "") : ""))
          .filter(Boolean)
          .join("\n"),
      );
    };

    const sync = () => {
      setHasCaptions(tracks.length > 0);
      setCaptioned(Array.from(tracks).some((track) => track.mode !== "disabled"));
      for (const track of Array.from(tracks)) {
        // Anything that asks the browser to draw would double the text.
        if (track.mode === "showing") track.mode = "hidden";
        track.oncuechange = syncCue;
      }
      syncCue();
    };

    sync();
    tracks.addEventListener("change", sync);
    tracks.addEventListener("addtrack", sync);
    return () => {
      tracks.removeEventListener("change", sync);
      tracks.removeEventListener("addtrack", sync);
      for (const track of Array.from(tracks)) track.oncuechange = null;
    };
  }, [videoRef]);

  const toggleCaptions = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !captioned;
    for (const track of Array.from(video.textTracks)) {
      track.mode = next ? "hidden" : "disabled";
    }
    setCaptioned(next);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    // Unmuting is a deliberate act — make sure there is something to hear.
    if (!video.muted && video.paused) onTogglePlay();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const loaded = duration > 0 ? (buffered / duration) * 100 : 0;

  // Hover drives the reveal, but a drag or a keyboard focus must never be
  // yanked out from under the viewer mid-gesture.
  const shown = !pointerCanHover || hovered || scrubbing || focused;

  return (
    <>
      {captioned && cueText ? (
        /* Sits above the bar while it is up and drops to the frame's foot when
           it fades, so the words never share space with the controls. */
        <div
          className={`pointer-events-none absolute inset-x-0 z-4 flex justify-center tgva-gutter transition-[bottom] duration-300 ease-out-soft ${
            shown ? "bottom-[5.25rem] md:bottom-[6.25rem]" : "bottom-5 md:bottom-7"
          }`}
        >
          <p className="max-w-[min(90%,48rem)] whitespace-pre-line rounded-md bg-ink/80 px-3 py-1 text-center text-[clamp(0.875rem,1.6vw,1.375rem)] leading-snug text-cream">
            {cueText}
          </p>
        </div>
      ) : null}

      <div
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        /* Faded out rather than unmounted, so keyboard users can still tab in.
           Transition `translate`, not `transform`: Tailwind v4 moves elements with
           the standalone property, so a transform transition would never fire. */
        className={`absolute inset-x-0 bottom-0 z-3 transition-[opacity,translate] duration-300 ease-out-soft ${
          shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-ink/85 via-ink/35 to-transparent"
        />

        <div className="relative mx-auto flex w-full max-w-[1240px] tgva-gutter items-center gap-4 pb-5 md:pb-7">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cream/12 text-cream backdrop-blur-md transition-colors duration-200 hover:bg-gold hover:text-ink"
          >
            {/* Keyed so React remounts the glyph and the swap animation replays. */}
            <span key={playing ? "pause" : "play"} className="flex animate-[tgva-icon-swap_260ms_var(--ease-out-soft)]">
              {playing ? <PauseIcon /> : <PlayIcon />}
            </span>
          </button>

          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.floor(duration)}
            aria-valuenow={Math.floor(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            onKeyDown={handleSliderKeyDown}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setScrubbing(true);
              seekToClientX(event.clientX);
            }}
            onPointerMove={(event) => {
              if (scrubbing) seekToClientX(event.clientX);
            }}
            onPointerUp={() => setScrubbing(false)}
            onPointerCancel={() => setScrubbing(false)}
            className="group/track relative flex h-9 flex-1 cursor-pointer touch-none items-center rounded-full"
          >
            <div
              className={`relative w-full overflow-hidden rounded-full bg-cream/25 transition-[height] duration-150 ${
                scrubbing ? "h-1.5" : "h-1 group-hover/track:h-1.5"
              }`}
            >
              <div className="absolute inset-y-0 left-0 bg-cream/30" style={{ width: `${loaded}%` }} />
              <div className="absolute inset-y-0 left-0 bg-gold" style={{ width: `${progress}%` }} />
            </div>
            <span
              aria-hidden
              style={{ left: `${progress}%` }}
              /* A ring, not a shadow. `0 0 0 4px` is a zero-offset halo — the
                 decoration the system calls a drift signal — and what the thumb
                 actually needs is a hard edge so it separates from the track. */
              className={`pointer-events-none absolute size-3.5 -translate-x-1/2 rounded-full bg-gold ring-[3px] ring-ink/45 transition-transform duration-150 ${
                scrubbing ? "scale-100" : "scale-0 group-hover/track:scale-100"
              }`}
            />
          </div>

          <p className="shrink-0 font-display text-[12.5px] font-semibold tabular-nums tracking-[0.06em] text-cream/85">
            {formatTime(currentTime)} <span className="text-cream/45">/ {formatTime(duration)}</span>
          </p>

          {hasCaptions ? (
            <button
              type="button"
              onClick={toggleCaptions}
              aria-label="Captions"
              aria-pressed={captioned}
              title="Captions"
              className={`flex size-11 shrink-0 items-center justify-center rounded-full backdrop-blur-md transition-colors duration-200 hover:bg-gold hover:text-ink ${
                captioned ? "bg-gold text-ink" : "bg-cream/12 text-cream"
              }`}
            >
              <CaptionsIcon on={captioned} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={toggleMute}
            aria-label="Mute"
            aria-pressed={muted}
            title="Mute"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cream/12 text-cream backdrop-blur-md transition-colors duration-200 hover:bg-gold hover:text-ink"
          >
            <span key={muted ? "muted" : "unmuted"} className="flex animate-[tgva-icon-swap_260ms_var(--ease-out-soft)]">
              {muted ? <SoundOffIcon /> : <SoundOnIcon />}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
