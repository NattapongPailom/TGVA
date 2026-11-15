"use client";

import type { MouseEvent } from "react";
import { OrchidMark } from "@/components/motion/OrchidMark";
import { scrollToHash } from "@/lib/hash-scroll";
import { hiringSeatId } from "@/lib/hiring";

/**
 * The Staff block's panel while a post is hiring. It says three things and
 * nothing else — the status, the post, the way down to its pass — so the look
 * carries the rest: it is drawn as a boarding-pass stub, the same Orchid Deep
 * strip, perforation and punched notches as the passes it points at.
 *
 * The link is an ordinary anchor, so it still lands without the script. With
 * it, the pass is marked `is-arriving` once it is reached, for one gold pulse;
 * the class is taken off and put back so a second press pulses again.
 */
export function StaffHiringNote({ role, label, jump }: { role: string; label: string; jump: string }) {
  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (!scrollToHash(`#${hiringSeatId}`)) return;
    event.preventDefault();

    const seat = document.getElementById(hiringSeatId);
    if (!seat) return;
    /* Jumped to before the grid was on screen, the passes are still printing
       in when the scroll lands: hold the pulse until this one is out. */
    const printing = seat.closest(".tgva-staff-grid.is-armed:not(.is-in)");
    seat.style.animationDelay = printing ? "1.6s" : "";
    seat.classList.remove("is-arriving");
    void seat.offsetWidth;
    seat.classList.add("is-arriving");
    seat.addEventListener("animationend", () => seat.classList.remove("is-arriving"), { once: true });
  };

  return (
    <aside className="tgva-staff-hiring" aria-labelledby="staff-hiring-title">
      <OrchidMark className="tgva-staff-hiring-mark" />
      <div className="tgva-staff-hiring-head">
        <p className="tgva-staff-hiring-label">
          <i aria-hidden className="tgva-beacon-dot" />
          {label}
        </p>
        <h4 id="staff-hiring-title" className="tgva-staff-hiring-title">
          {role}
        </h4>
      </div>
      <div aria-hidden className="tgva-staff-hiring-perf" />
      <div className="tgva-staff-hiring-stub">
        <a href={`#${hiringSeatId}`} onClick={go} className="tgva-staff-hiring-jump">
          {jump} <span aria-hidden>→</span>
        </a>
      </div>
    </aside>
  );
}
