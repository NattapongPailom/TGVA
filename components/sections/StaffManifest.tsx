"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { manifest, membershipFormUrl } from "@/content/site";
import { OrchidMark } from "@/components/motion/OrchidMark";
import { CloseMark } from "@/components/ui/CloseMark";
import { ArrowIcon, StaffChannels, type StaffMember } from "@/components/sections/StaffPass";
import { barcode } from "@/lib/barcode";
import { initials } from "@/lib/initials";
import { membershipQr } from "@/lib/membership-qr";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";

const TYPE_MS = 28;
const CLOSE_MS = 380;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * "View all staff", and the General Declaration it opens: the whole roster on
 * one crew manifest — seal, numbered fields, a ruled crew list with stamps,
 * a certification foot.
 *
 * The sheet unfolds on opening, the names type themselves in, the stamps land
 * and the foil and security strip catch the pointer; all of it is skipped for
 * a reader who asks for reduced motion. It is portalled to <body> so no
 * transformed ancestor can turn its fixed scrim into a positioned box.
 */
export function StaffManifest({ members, edition }: { members: StaffMember[]; edition: number }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [typed, setTyped] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);

  useScrollLock(open);
  useFocusTrap(sheetRef, open);

  const clearTimers = () => {
    for (const id of timers.current) {
      window.clearTimeout(id);
      window.clearInterval(id);
    }
    timers.current = [];
  };

  const show = () => {
    clearTimers();
    setClosing(false);
    setOpen(true);
    if (reduced()) {
      setTyped(Number.MAX_SAFE_INTEGER);
      return;
    }
    setTyped(0);
    const start = window.setTimeout(() => {
      const interval = window.setInterval(() => setTyped((t) => t + 1), TYPE_MS);
      timers.current.push(interval);
    }, 700);
    timers.current.push(start);
  };

  const hide = () => {
    clearTimers();
    if (reduced()) {
      setOpen(false);
      return;
    }
    setClosing(true);
    timers.current.push(
      window.setTimeout(() => {
        setOpen(false);
        setClosing(false);
      }, CLOSE_MS),
    );
  };

  /* Focus goes to the close button without scrolling: mid-unfold the sheet is
     squashed, and a scrolling focus would read the button as out of view and
     scroll the sheet away from its header. */
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => clearTimers, []);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const box = sheet.getBoundingClientRect();
    sheet.style.setProperty("--mx", `${Math.round(((event.clientX - box.left) / box.width) * 100)}%`);
    sheet.style.setProperty("--my", `${Math.round(((event.clientY - box.top) / box.height) * 100)}%`);
  };

  const onDuty = members.filter((member) => member.name).length;
  const pad = (n: number) => String(n).padStart(2, "0");
  const showQr = membershipQr.url === membershipFormUrl;
  const docBars = [...barcode(manifest.reference, 30), ...barcode(manifest.title, 30)];

  /* Names type in one after another: each row spends the budget its name
     needs, plus a short pause before the next one starts. */
  const names = members.map((member) => member.name ?? "— VACANT —");
  const starts = names.map((_, i) => names.slice(0, i).reduce((sum, name) => sum + name.length + 4, 0));
  const rows = members.map((member, i) => {
    const full = names[i];
    const take = Math.max(0, Math.min(full.length, typed - starts[i]));
    return { member, full, shown: full.slice(0, take), typing: take > 0 && take < full.length, i };
  });

  const qr = showQr ? (
    <svg
      viewBox={`-2 -2 ${membershipQr.size + 4} ${membershipQr.size + 4}`}
      role="img"
      aria-label="QR code for the TGVA membership form"
      shapeRendering="crispEdges"
      className="tgva-gd-qr"
    >
      <rect x={-2} y={-2} width={membershipQr.size + 4} height={membershipQr.size + 4} fill="#fbf8f2" />
      <path d={membershipQr.path} fill="var(--color-brand-deep)" />
    </svg>
  ) : null;

  return (
    <>
      <button type="button" className="tgva-staff-viewall" onClick={show} aria-haspopup="dialog">
        <GridIcon />
        VIEW ALL STAFF
        <span className="tgva-staff-count">{members.length}</span>
      </button>

      {open
        ? createPortal(
            <div
              className={`tgva-gd-scrim${closing ? " is-closing" : ""}`}
              onClick={(event) => {
                if (event.target === event.currentTarget) hide();
              }}
            >
              <div
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="gd-title"
                className="tgva-gd-sheet"
                onPointerMove={onMove}
              >
                <button
                  ref={closeRef}
                  type="button"
                  className="tgva-gd-close"
                  aria-label="Close crew manifest"
                  onClick={hide}
                >
                  <CloseMark />
                </button>

                <div className="tgva-gd-paper">
                  <PaperGrain />
                  <span aria-hidden className="tgva-gd-holo" />
                  <Guilloche />

                  <div className="tgva-gd-inner">
                    <header className="tgva-gd-head">
                      <Seal />
                      <div>
                        <p className="tgva-gd-kicker">{manifest.kicker}</p>
                        <h4 id="gd-title" className="tgva-gd-title">
                          {manifest.title}
                        </h4>
                        <p className="tgva-gd-subtitle">{manifest.subtitle}</p>
                      </div>
                      {qr ? (
                        <div className="tgva-gd-qrbox">
                          {qr}
                          <span className="tgva-gd-ref">{manifest.reference}</span>
                          <span className="tgva-gd-qrnote">SCAN TO JOIN</span>
                        </div>
                      ) : null}
                    </header>

                    <div className="tgva-gd-fields">
                      <Field n={1} label="OPERATOR" value="Thai Airways Virtual" />
                      <Field n={2} label="HOME BASE" value="BKK · Suvarnabhumi" />
                      <Field n={3} label="PLATFORM" value="Infinite Flight" />
                      <Field n={4} label="EDITION" value={String(edition)} />
                      <div className="tgva-gd-field">
                        <span className="tgva-gd-label">5. TOTALS</span>
                        <span className="tgva-gd-value">
                          <span className="whitespace-nowrap">
                            Crew listed <b>{pad(members.length)}</b>
                          </span>{" "}
                          · <span className="whitespace-nowrap">
                            On duty <b>{pad(onDuty)}</b>
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="tgva-gd-crewlab">
                      <h5>CREW</h5>
                      <span>REF {manifest.reference}</span>
                    </div>

                    <table className="tgva-gd-ledger">
                      <thead>
                        <tr>
                          <th scope="col">NO.</th>
                          <th scope="col">PHOTO</th>
                          <th scope="col">NAME</th>
                          <th scope="col">POSITION</th>
                          <th scope="col">BASE</th>
                          <th scope="col">STATUS</th>
                          <th scope="col">CONTACT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(({ member, full, shown, typing, i }) => (
                          <tr key={member.role}>
                            <td className="is-idx">{pad(i + 1)}</td>
                            <td className="is-photo">
                              <span aria-hidden className={`tgva-gd-photo${member.name ? "" : " is-open"}`}>
                                {member.name ? initials(member.name) : null}
                              </span>
                            </td>
                            <td className="is-name">
                              <span className={`tgva-gd-typed${member.name ? "" : " is-open"}`} aria-label={full}>
                                <span aria-hidden>{shown}</span>
                                {typing ? <span aria-hidden className="tgva-gd-caret" /> : null}
                              </span>
                            </td>
                            <td className="is-role">{member.role}</td>
                            <td className="is-base">BKK</td>
                            <td className="is-status">
                              <span
                                className={`tgva-gd-stamp ${member.name ? "is-on" : "is-standby"}`}
                                style={{ "--i": i } as CSSProperties}
                              >
                                {member.name ? (
                                  <>
                                    ON
                                    <br />
                                    DUTY
                                  </>
                                ) : (
                                  "STANDBY"
                                )}
                              </span>
                            </td>
                            <td className="is-contact">
                              {member.name ? (
                                <StaffChannels links={member.links} name={member.name} />
                              ) : (
                                <a
                                  className="tgva-crewpass-apply"
                                  href={membershipFormUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Apply for ${member.role}`}
                                >
                                  APPLY <ArrowIcon />
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <footer className="tgva-gd-foot">
                      <FoilSeal />
                      <div className="tgva-gd-cert">
                        <strong>{manifest.certification}</strong>
                        <p>{manifest.note}</p>
                      </div>
                      <span aria-hidden className="tgva-gd-bars">
                        {docBars.map((bar, i) => (
                          <i key={i} style={{ height: `${bar.height}%`, width: `${bar.width}px` }} />
                        ))}
                      </span>
                      {qr ? (
                        <div className="tgva-gd-qr-mobile">
                          {qr}
                          <div>
                            <span className="tgva-gd-ref">{manifest.reference}</span>
                            <span className="tgva-gd-qrnote">SCAN TO JOIN</span>
                          </div>
                        </div>
                      ) : null}
                    </footer>

                    <p aria-hidden className="tgva-gd-micro">
                      {`THAI AIRWAYS VIRTUAL · SMOOTH AS SILK · ${manifest.reference} · `.repeat(8)}
                    </p>
                  </div>

                  <Guilloche />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function Field({ n, label, value }: { n: number; label: string; value: string }) {
  return (
    <div className="tgva-gd-field">
      <span className="tgva-gd-label">
        {n}. {label}
      </span>
      <span className="tgva-gd-value">{value}</span>
    </div>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-4 fill-none stroke-current stroke-[1.7]">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}

/** Seven interfering sine waves across the sheet's top and foot, as security print. */
const GUILLOCHE = Array.from({ length: 7 }, (_, k) => {
  const f1 = 22 + k * 1.7;
  const f2 = 9 + k * 0.6;
  const phase = k * 0.55;
  const points: string[] = [];
  for (let x = 0; x <= 1000; x += 4) {
    const y = 14 + 6 * Math.sin(x / f1 + phase) + 2.7 * Math.sin(x / f2 - phase * 1.7);
    points.push(`${x} ${y.toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
});

function Guilloche() {
  return (
    <svg aria-hidden viewBox="0 0 1000 28" preserveAspectRatio="none" className="tgva-gd-guilloche">
      <g fill="none" stroke="var(--color-brand-light)" strokeWidth=".6">
        {GUILLOCHE.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

const ROSETTES = Array.from({ length: 3 }, (_, k) => {
  const points: string[] = [];
  for (let t = 0; t <= 360; t += 3) {
    const a = (t * Math.PI) / 180;
    const r = 44 + 3.2 * Math.sin(a * 18 + k * 1.1);
    points.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${points.join(" L")}Z`;
});

function Seal() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="tgva-gd-seal">
      <defs>
        <path id="tgva-gd-ring" d="M50 50 m-35 0 a35 35 0 1 1 70 0 a35 35 0 1 1 -70 0" />
      </defs>
      <g fill="none" stroke="var(--color-brand)" strokeWidth=".35" opacity=".55">
        {ROSETTES.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <circle cx="50" cy="50" r="40.5" fill="none" stroke="var(--color-brand)" strokeWidth=".8" />
      <circle cx="50" cy="50" r="29" fill="none" stroke="var(--color-brand)" strokeWidth=".5" />
      <text className="tgva-gd-seal-text">
        <textPath href="#tgva-gd-ring">THAI AIRWAYS VIRTUAL · SMOOTH AS SILK · </textPath>
      </text>
      <foreignObject x="31" y="31" width="38" height="38">
        <OrchidMark className="size-full" />
      </foreignObject>
    </svg>
  );
}

const STAR = Array.from({ length: 60 }, (_, i) => {
  const a = (i * 6 * Math.PI) / 180;
  const r = i % 2 === 0 ? 46 : 40;
  return `${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
}).join(" L");

function FoilSeal() {
  return (
    <span className="tgva-gd-foil" aria-hidden>
      <svg viewBox="0 0 100 100">
        <defs>
          <linearGradient id="tgva-gd-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8f6213" />
            <stop offset=".45" stopColor="#e9c27a" />
            <stop offset=".55" stopColor="#fff1cc" />
            <stop offset="1" stopColor="#a8741f" />
          </linearGradient>
        </defs>
        <path d={`M${STAR}Z`} fill="url(#tgva-gd-gold)" />
        <circle cx="50" cy="50" r="31" fill="none" stroke="#7a520f" strokeWidth="1" opacity=".55" />
        <foreignObject x="29" y="29" width="42" height="42" opacity=".9">
          <OrchidMark className="size-full" />
        </foreignObject>
      </svg>
    </span>
  );
}

function PaperGrain() {
  return (
    <svg aria-hidden className="tgva-gd-grain">
      <filter id="tgva-gd-paper">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 .21  0 0 0 0 .04  0 0 0 0 .43  0 0 0 .07 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#tgva-gd-paper)" />
    </svg>
  );
}
