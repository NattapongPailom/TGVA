import Link from "next/link";
import { photoCredits } from "@/content/fleet";
import { footerColumns, footerNote, photoCreditsCopy, social } from "@/content/site";
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
 * And only beneath Join Us. The stick is a pairing with that statement, so a
 * page without it passes `sticky={false}` and gets a footer in normal flow —
 * on /events a stuck footer sat over the short page's own copy.
 *
 * Each column is a real `<details>`, so the headings expand and collapse on
 * click with no script: the browser owns the state, keyboard and screen-reader
 * behaviour come for free, and a page with JavaScript off still opens them.
 */
export function SiteFooter({ sticky = true }: { sticky?: boolean }) {
  return (
    <footer
      className={`tgva-gutter relative z-0 bg-brand-abyss pt-16 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-cream${sticky ? " md:sticky md:bottom-0" : ""}`}
    >
      <div className="mx-auto max-w-[1240px]">
        {/* Intrinsic, not breakpoint-keyed: a fourth column has to be possible
            by adding it to the content file, not by editing a media query. */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-x-12">
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

        {/* The non-affiliation notice is a standing commitment, not fine print.
            It was the dimmest required text on the site at 4.12:1; this is
            8.81:1 and still quieter than everything above it. */}
        <div className="mt-12 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3 border-t border-cream/12 pt-7 text-[14px] leading-relaxed text-cream/70">
          <p className="max-w-[62ch] text-pretty">{footerNote}</p>
          <p>© {new Date().getFullYear()} Thai Airways Virtual</p>
        </div>

        {/* Closed by default: the credits are owed, not the point of the page,
            and a closed fold keeps the stuck footer its usual height. */}
        {photoCredits.length > 0 && (
          <details className="tgva-credits mt-5 text-[14px] leading-relaxed text-cream/70">
            <summary>{photoCreditsCopy.title}</summary>
            <p className="mt-3 max-w-[62ch] text-pretty">{photoCreditsCopy.intro}</p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {photoCredits.map(({ name, credit }) => (
                <li key={name}>
                  {name}:{" "}
                  <a href={credit.source} target="_blank" rel="noopener noreferrer">
                    photograph
                  </a>{" "}
                  by {credit.author},{" "}
                  <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">
                    {credit.license}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </footer>
  );
}
