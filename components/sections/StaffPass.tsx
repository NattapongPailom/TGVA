"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { membershipFormUrl, type StaffLinks } from "@/content/site";
import { OrchidMark } from "@/components/motion/OrchidMark";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { barcode } from "@/lib/barcode";
import { initials } from "@/lib/initials";

export type StaffMember = {
  role: string;
  name: string | null;
  blurb: string;
  photo?: string;
  links?: StaffLinks;
};

/* No personal Discord or Instagram: see StaffLinks in content/site.ts. */
const CHANNELS = [{ key: "infiniteflight", label: "Infinite Flight Community" }] as const;

/**
 * One member of staff as a boarding pass: the orchid strip, a passport photo,
 * the fields, a perforation and a stub. A post with no name is a standby pass
 * whose stub is an APPLY link to the membership form.
 *
 * The tilt follows a mouse only — a finger has no hover to follow — and is
 * written straight to the element's custom properties rather than through
 * React state, so a pointer crossing the card re-renders nothing. The
 * stylesheet's reduced-motion block turns it off.
 */
export function StaffPass({ member, index }: { member: StaffMember; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const open = !member.name;
  const bars = barcode(member.name ?? member.role, 30);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const element = ref.current;
    if (!element) return;
    const box = element.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    element.style.setProperty("--rx", `${((0.5 - y) * 7).toFixed(2)}deg`);
    element.style.setProperty("--ry", `${((x - 0.5) * 8).toFixed(2)}deg`);
    element.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    element.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    element.dataset.live = "";
  };

  const onLeave = () => {
    const element = ref.current;
    if (!element) return;
    for (const name of ["--rx", "--ry", "--mx", "--my"]) element.style.removeProperty(name);
    delete element.dataset.live;
  };

  return (
    <div className="tgva-staff-print" style={{ "--i": index } as CSSProperties}>
      <div ref={ref} className="tgva-staff-tilt" onPointerMove={onMove} onPointerLeave={onLeave}>
        <article
          className={`tgva-crewpass ${open ? "is-open" : "is-exec"}`}
          aria-label={`${member.name ?? "Position open"}, ${member.role}`}
        >
          <span aria-hidden className="tgva-crewpass-light" />
          <div className="tgva-crewpass-head">
            <OrchidMark className="size-5.5" />
            <span>TGVA</span>
          </div>

          <div className="tgva-crewpass-body">
            <div className="tgva-crewpass-photo" aria-hidden>
              {member.photo ? (
                <Image src={member.photo} alt="" fill sizes="78px" className="object-cover" />
              ) : open ? (
                <SeatIcon />
              ) : (
                <>
                  <OrchidMark className="tgva-crewpass-photo-mark" />
                  <span>{initials(member.name!)}</span>
                  <small>PHOTO</small>
                </>
              )}
            </div>

            <div className="tgva-crewpass-fields">
              <div>
                <span className="tgva-crewpass-label">{open ? "Status" : "Name"}</span>
                <span className="tgva-crewpass-name">{member.name ?? "POSITION OPEN"}</span>
              </div>
              <div>
                <span className="tgva-crewpass-label">Position</span>
                <span className="tgva-crewpass-role">{member.role}</span>
              </div>
              <div className="tgva-crewpass-meta">
                <div>
                  <span className="tgva-crewpass-label">Base</span>
                  <span className="tgva-crewpass-mono">BKK</span>
                </div>
                <div>
                  <span className="tgva-crewpass-label">Class</span>
                  <span>
                    {open ? (
                      <span className="tgva-crewpass-chip">STANDBY</span>
                    ) : (
                      <span className="tgva-crewpass-foil">EXECUTIVE</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="tgva-crewpass-blurb">{member.blurb}</p>
          <div aria-hidden className="tgva-crewpass-perf" />

          <div className="tgva-crewpass-stub">
            {open ? (
              <a className="tgva-crewpass-apply" href={membershipFormUrl} target="_blank" rel="noopener noreferrer">
                APPLY <ArrowIcon />
              </a>
            ) : (
              <StaffChannels links={member.links} name={member.name!} />
            )}
            <span aria-hidden className="tgva-crewpass-bars">
              {bars.map((bar, i) => (
                <i key={i} style={{ height: `${bar.height}%`, width: `${bar.width}px` }} />
              ))}
            </span>
          </div>
        </article>
      </div>
    </div>
  );
}

/**
 * A member's channels. One with a URL is a link; one without is shown as not
 * yet linked, the way the footer shows a channel the team has not published.
 */
export function StaffChannels({ links, name }: { links?: StaffLinks; name: string }) {
  return (
    <span className="tgva-staff-channels">
      {CHANNELS.map(({ key, label }) => {
        const href = links?.[key];
        return href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} on ${label}`}
            className="tgva-staff-channel"
          >
            <SocialIcon name={key} />
          </a>
        ) : (
          <span
            key={key}
            aria-disabled="true"
            aria-label={`${name} on ${label} — no link yet`}
            title={`${label} — link coming soon`}
            className="tgva-staff-channel is-idle"
          >
            <SocialIcon name={key} />
          </span>
        );
      })}
    </span>
  );
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="size-2.5 fill-none stroke-current stroke-[1.6]">
      <path d="M3 9l6-6M4 3h5v5" />
    </svg>
  );
}

function SeatIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="tgva-crewpass-seat">
      <path d="M9 5v13a3 3 0 0 0 3 3h9" />
      <path d="M12 21l-2 6M21 21l3 6" />
      <path d="M9 14h9a3 3 0 0 1 3 3v4" />
    </svg>
  );
}
