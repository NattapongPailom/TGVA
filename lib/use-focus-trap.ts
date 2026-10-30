"use client";

import { useEffect, type RefObject } from "react";

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

/**
 * What Tab can actually land on inside `root`, in document order. A control
 * that is laid out but invisible — a closed menu, a row a breakpoint has
 * dropped — is skipped, because the browser skips it too and a trap that
 * aimed at it would hand focus to nothing.
 */
function tabbables(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.closest("[inert]") &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== "hidden",
  );
}

/**
 * Keeps Tab and Shift+Tab inside `container` while `active`, and gives focus
 * back when it ends.
 *
 * A scroll lock alone does not make a surface modal. Tab walked straight out of
 * the ticket and the nav sheet into the page behind them, and the browser
 * scrolled whatever it reached into view — which is how a "locked" page moved
 * 1,600px under the ticket's scrim. Only the edges are handled here: inside the
 * container the browser's own order is left alone, and focus is only steered
 * when the next stop would fall outside it.
 *
 * On the way out focus returns to `returnTo` if given, otherwise to whatever
 * held it when the trap began — the control that opened the surface. Left to
 * itself it falls to `<body>`, and the next Tab starts again from the top of
 * the page.
 */
export function useFocusTrap(
  container: RefObject<HTMLElement | null>,
  active: boolean,
  {
    initialFocus,
    returnTo,
  }: {
    initialFocus?: RefObject<HTMLElement | null>;
    returnTo?: RefObject<HTMLElement | null>;
  } = {},
) {
  useEffect(() => {
    if (!active) return;

    const back = returnTo?.current ?? (document.activeElement as HTMLElement | null);
    initialFocus?.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      const root = container.current;
      if (event.key !== "Tab" || !root) return;

      const stops = tabbables(root);
      if (!stops.length) {
        event.preventDefault();
        return;
      }

      const first = stops[0];
      const last = stops[stops.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const inside = current !== null && root.contains(current);

      if (!inside || (event.shiftKey ? current === first : current === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // The page was held still the whole time, so there is nothing to scroll to.
      if (back?.isConnected) back.focus({ preventScroll: true });
    };
    // The refs are stable; only the trap's on/off decides when this runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
