"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Intro = {
  /** True once nothing is covering the page any more. */
  done: boolean;
  /** Called by whatever is covering the page, to say that it is. */
  claim: () => void;
  /** Called by the same component when it has finished and gone. */
  finish: () => void;
};

/**
 * The signal between the thing that covers the page on arrival and everything
 * that wants to animate in behind it.
 *
 * It exists because the alternative — giving the second animation a delay long
 * enough to clear the first — is a guess about the visitor's connection.
 * `LoadingScreen` waits on `window.load`, so that duration is not a constant
 * and no delay can be the right one. The two are linked by cause here, not by
 * time.
 *
 * The default is `done: true`: with no provider above it, nothing is gating the
 * page, so a subscriber should animate immediately rather than wait for a
 * signal that will never arrive.
 */
const IntroContext = createContext<Intro>({
  done: true,
  claim: () => {},
  finish: () => {},
});

export function IntroProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  const claimed = useRef(false);

  const claim = useCallback(() => {
    claimed.current = true;
  }, []);

  const finish = useCallback(() => setDone(true), []);

  /**
   * A route carrying no loader at all — /events, say — has to resolve by
   * itself, or its subscribers wait forever for a signal nobody will send.
   *
   * The check is deferred to the next frame rather than run in this effect
   * directly. React does run child effects before a parent's, so claiming in
   * an effect would be enough today; but if that ever stopped holding, the
   * failure would be silent and the wrong way round — the page would resolve
   * as uncovered while the scrim was still up. A frame lands strictly after
   * the whole commit, whatever order the effects inside it ran in.
   */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!claimed.current) setDone(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return <IntroContext value={{ done, claim, finish }}>{children}</IntroContext>;
}

export function useIntro() {
  return useContext(IntroContext);
}
