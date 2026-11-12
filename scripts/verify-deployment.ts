/**
 * `npm run verify:deployment [url]`: the smoke tests, run against a deployed
 * copy of the site rather than a local build. The same tests the live check
 * runs after every production deploy, on demand.
 *
 * With no address it tests production, https://tgva.vercel.app. It accepts
 * only this project's own addresses: production, NEXT_PUBLIC_SITE_URL once
 * the site has its own domain, and Vercel previews of `tgva`. Previews sit
 * behind Vercel Authentication, which redirects to a login; the script says
 * so and stops rather than run every test against a login page.
 *
 * Exit status is Playwright's: 0 when every test passed.
 */
import { spawnSync } from "node:child_process";

const production = "https://tgva.vercel.app";
const arg = process.argv[2];

let url: URL;
try {
  url = new URL(arg ?? production);
} catch {
  console.error(`verify:deployment: not an address: ${arg}`);
  process.exit(2);
}

const ownDomain = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname : null;
const ours =
  url.protocol === "https:" &&
  (url.hostname === "tgva.vercel.app" ||
    url.hostname === ownDomain ||
    // A preview, such as tgva-git-<branch>-nattapongpailom.vercel.app.
    /^tgva-[a-z0-9-]+-nattapongpailom\.vercel\.app$/.test(url.hostname));

if (!ours) {
  console.error(`verify:deployment: ${url.origin} is not a deployment of this site; it tests tgva only.`);
  process.exit(2);
}

// tsx runs this file as CommonJS, which has no top-level await.
async function main() {
  const first = await fetch(url.origin, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
  const location = first.headers.get("location") ?? "";
  if (first.status >= 300 && first.status < 400 && /vercel\.com\/(login|sso)/.test(location)) {
    console.error(`verify:deployment: ${url.origin} is behind Vercel Authentication (it redirects to a login), so it cannot be tested from here.`);
    process.exit(2);
  }

  console.log(`Smoke tests against ${url.origin}\n`);
  const result = spawnSync("npx", ["playwright", "test"], {
    stdio: "inherit",
    env: { ...process.env, BASE_URL: url.origin },
  });
  process.exit(result.status ?? 1);
}

void main();
