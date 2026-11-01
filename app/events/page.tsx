import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { events } from "@/content/events";
import { EventsComingSoon } from "@/components/sections/EventsComingSoon";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Group flights, academy intakes and everything else on the Thai Airways Virtual calendar.",
};

/**
 * The calendar behind the arrival announcement and the EVENTS button.
 *
 * It lists whatever content/events.ts holds. Until that holds something, every
 * EVENTS link on the site lands on a "coming soon" state instead, so none of
 * them leads anywhere empty-handed.
 */
export default function EventsPage() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="tgva-gutter min-h-[62svh] bg-white">
        {events.length ? (
          <div className="mx-auto max-w-[1240px] pt-16 pb-24">
            <p className="font-display text-xs font-bold tracking-[0.26em] text-brand-light">
              THE CALENDAR
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold leading-none tracking-[-0.03em] text-brand">
              Events
            </h1>

            <ul className="mt-14 grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-8">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="overflow-hidden rounded-[14px] border border-brand/12 bg-white shadow-[0_18px_40px_rgba(30,6,64,0.08)]"
                >
                  <div className="relative aspect-4/3 bg-brand-deep">
                    <Image
                      src={event.poster}
                      alt=""
                      aria-hidden
                      fill
                      sizes="(max-width: 60rem) 100vw, 20rem"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-3 p-6">
                    <p className="font-mono text-[11px] tracking-[0.16em] text-gold-deep">
                      {event.date.toUpperCase()} · {event.time}
                    </p>
                    <h2 className="font-display text-[22px] font-extrabold tracking-[-0.015em] text-brand">
                      {event.title}
                    </h2>
                    <p className="text-[17px] leading-[1.75] text-ink-mute text-pretty">
                      {event.blurb}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12px] text-ink-soft">
                      <span>{event.route}</span>
                      <span>{event.aircraft}</span>
                      <span>{event.gate}</span>
                    </p>
                    <a
                      href={event.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 self-start rounded-full bg-gold px-6 py-3 font-display text-[13px] font-bold tracking-[0.1em] text-ink transition-colors duration-300 hover:bg-brand hover:text-cream"
                    >
                      JOIN THIS EVENT
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EventsComingSoon />
        )}
      </main>

      {/* No Join Us above it here, so nothing for the footer to stick behind. */}
      <SiteFooter sticky={false} />
    </>
  );
}
