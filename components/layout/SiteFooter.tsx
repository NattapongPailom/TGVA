import Link from "next/link";
import { footerColumns, footerNote, social } from "@/content/site";
import { SocialIcon } from "@/components/ui/SocialIcon";

/**
 * The detail tier. It sticks to the foot of the viewport behind the Join Us
 * statement, which is opaque and sits a layer above: scrolling on slides that
 * statement up and uncovers this from the bottom edge, and scrolling back
 * draws it down over the top again.
 *
 * Only from `md`, where Join Us is reliably the taller of the two — below that
 * this could peek out from under it, so it stays an ordinary block.
 *
 * Each column is a real `<details>`, so the headings expand and collapse on
 * click with no script: the browser owns the state, keyboard and screen-reader
 * behaviour come for free, and a page with JavaScript off still opens them.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-0 bg-brand-abyss px-12 pt-16 pb-10 text-cream md:sticky md:bottom-0">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-x-12 sm:grid-cols-2 md:grid-cols-3">
          {footerColumns.map((column) => (
            <details key={column.title} className="tgva-fold" open>
              <summary>
                <h2>{column.title}</h2>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="m6 9.5 6 6 6-6" />
                </svg>
              </summary>

              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        {...(link.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span>{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        {/* The channels, as marks rather than words. A channel the team has not
            published a URL for yet is shown and said to be unavailable, rather
            than linked nowhere or quietly dropped. */}
        <div className="tgva-foot-channels">
          {social.map((channel) =>
            channel.href ? (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={channel.label}
                className="tgva-foot-channel"
              >
                <SocialIcon name={channel.icon} />
              </a>
            ) : (
              <span
                key={channel.label}
                aria-disabled="true"
                aria-label={`${channel.label} — no link published yet`}
                title={`${channel.label} — no link published yet`}
                className="tgva-foot-channel is-idle"
              >
                <SocialIcon name={channel.icon} />
              </span>
            ),
          )}
        </div>

        <div className="mt-12 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3 border-t border-cream/12 pt-7 text-[14px] leading-relaxed text-cream/45">
          <p className="max-w-[62ch] text-pretty">{footerNote}</p>
          <p>© {new Date().getFullYear()} Thai Airways Virtual</p>
        </div>
      </div>
    </footer>
  );
}
