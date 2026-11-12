/**
 * `npm run check:links`: does every outside address the site links to still
 * work?
 *
 * It collects every https address in content/ (and the one the membership QR
 * code encodes) and asks each one. Two get a sharper question than "does it
 * answer": a Discord invite is checked with Discord's own invite lookup, which
 * says when an invite has expired, and a Google Form fails if it has stopped
 * taking responses.
 *
 * It needs the network, so it is not part of `npm run verify`.
 *
 * Exit 1: at least one link is broken. Exit 0: all work, though some sites
 * (Instagram, for one) turn automated requests away; those are listed as
 * "could not check" rather than counted as broken.
 */
import * as eventsModule from "@/content/events";
import * as fleetModule from "@/content/fleet";
import * as partnersModule from "@/content/partners";
import * as regionsModule from "@/content/regions";
import * as siteModule from "@/content/site";
import { membershipQr } from "@/lib/membership-qr";

type Result = { url: string; state: "ok" | "broken" | "unchecked"; detail: string };

/** Every https address in the content modules. */
function collect(): string[] {
  const urls = new Set<string>([membershipQr.url]);
  const seen = new Set<unknown>();
  const go = (value: unknown) => {
    if (typeof value === "string") {
      if (value.startsWith("https://")) urls.add(value);
      return;
    }
    if (value === null || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    Object.values(value).forEach(go);
  };
  for (const contentModule of [siteModule, eventsModule, fleetModule, partnersModule, regionsModule]) {
    Object.values(contentModule).forEach(go);
  }
  return [...urls].sort();
}

const userAgent = "TGVA link check (+https://github.com/NattapongPailom/TGVA)";

async function ask(url: string, method: "HEAD" | "GET") {
  return fetch(url, {
    method,
    redirect: "follow",
    headers: { "user-agent": userAgent },
    signal: AbortSignal.timeout(15_000),
  });
}

async function check(url: string): Promise<Result> {
  try {
    const invite = url.match(/^https:\/\/(?:discord\.gg|discord\.com\/invite)\/([\w-]+)/);
    if (invite) {
      const response = await ask(`https://discord.com/api/v10/invites/${invite[1]}`, "GET");
      if (response.ok) return { url, state: "ok", detail: "Discord invite is valid" };
      if (response.status === 404) return { url, state: "broken", detail: "Discord invite has expired or does not exist" };
      return { url, state: "unchecked", detail: `Discord answered ${response.status}` };
    }

    if (/^https:\/\/(docs\.google\.com\/forms|forms\.gle)\//.test(url)) {
      const response = await ask(url, "GET");
      if (!response.ok) return { url, state: "broken", detail: `Google Forms answered ${response.status}` };
      // A closed form redirects to .../closedform.
      if (response.url.includes("closedform")) return { url, state: "broken", detail: "the form no longer accepts responses" };
      return { url, state: "ok", detail: "form is open" };
    }

    let response = await ask(url, "HEAD");
    // Some servers refuse HEAD but answer GET.
    if (response.status === 405 || response.status === 403 || response.status === 404) response = await ask(url, "GET");
    if (response.ok) return { url, state: "ok", detail: `${response.status}` };
    if (response.status === 401 || response.status === 403 || response.status === 429) {
      return { url, state: "unchecked", detail: `${response.status}: the site turns automated requests away` };
    }
    return { url, state: "broken", detail: `${response.status}` };
  } catch (error) {
    const reason = error instanceof Error ? (error.cause instanceof Error ? error.cause.message : error.message) : String(error);
    return { url, state: "broken", detail: `no answer: ${reason}` };
  }
}

// tsx runs this file as CommonJS, which has no top-level await.
async function main() {
  const results = await Promise.all(collect().map(check));
  const mark = { ok: "ok        ", broken: "BROKEN    ", unchecked: "unchecked " } as const;
  for (const result of results) console.log(`${mark[result.state]} ${result.url}\n           ${result.detail}`);

  const broken = results.filter((result) => result.state === "broken").length;
  const unchecked = results.filter((result) => result.state === "unchecked").length;
  console.log(`\n${results.length} links: ${results.length - broken - unchecked} ok, ${broken} broken, ${unchecked} could not check.`);
  if (broken) process.exit(1);
}

void main();
