# Automation

How changes to the TGVA site are checked, merged and released, and how Claude
works inside that. Agreed with the owner on 11 Nov 2026. This file is the source
of truth for every Claude surface (Claude Code in VS Code, the Claude desktop
app); `CLAUDE.md` points here.

Status: **Phase 1 done on 12 Nov 2026** (pull requests #1 to #4). Phase 2 is
next.

## Principles

1. **Reuse, don't rebuild.** Browser, file, Git and Vercel work use maintained
   tools. Custom code is limited to what only TGVA needs.
2. **Safety is enforced outside the model.** Skills and `CLAUDE.md` are advice.
   The gate is GitHub branch protection plus Vercel Deployment Checks.
3. **Scripts first.** Every check is a script in this repo that the owner, CI and
   Claude run identically. The `tgva` MCP server (Phase 3) only wraps them.
4. **No stored secrets.** CI tests its own build; the live check hits the public
   URL. Claude never needs a Vercel token. Deploys happen only because Git changed.
5. **Say only what is true** (see `docs/PRODUCT.md`). No check can verify a fact,
   so content comes from the owner, never from Claude's invention.

## Facts this design rests on

- Static Next.js 16 site, no server code, database, auth or secrets.
- Repository: `NattapongPailom/TGVA`, **public** since 11 Nov 2026, GitHub Free.
  Public means branch protection, native auto-merge and free Actions minutes.
  It also means everything committed is world-readable, including `.claude/`.
- Hosting: Vercel Hobby, production at `tgva.vercel.app`, deployed from `main`.
- History was scanned before the switch: no secret-looking files or strings.
- Member features and Infinite Flight data are out of scope until revisited.

## Release path

1. Claude works on a branch, never on `main`.
2. `npm run verify` locally (lint, typecheck, build, smoke tests).
3. Push the branch, open a pull request with `gh`, enable auto-merge.
4. CI runs the required check `verify`. A second required check, `rules`, fails
   when the pull request touches a rule path (below).
5. Both green: GitHub merges by **rebase** (linear history, commits keep their
   author and message). Rule change: the pull request waits for the owner.
6. Vercel builds production from `main`. Deployment Checks hold the domain until
   `verify` passes on that commit.
7. `live-check` runs the smoke tests against `tgva.vercel.app`. A failure opens
   an issue. The fix or revert goes through the same path. Emergency exit:
   Vercel Instant Rollback (Hobby: previous deployment only), owner's click.

### Site paths (merge on green)

`app/`, `components/`, `content/`, `lib/`, `public/`, `docs/`

### Rule paths (wait for the owner)

`.github/`, `.claude/`, `.mcp.json`, `CLAUDE.md`, `AGENTS.md`, `scripts/`,
`tests/`, `package.json`, `package-lock.json`, `.nvmrc`, `next.config.ts`,
`eslint.config.mjs`, `tsconfig.json`, `playwright.config.ts`

`.nvmrc` was added while building Phase 1: it sets the Node version CI runs, as
`engines` in `package.json` does for Vercel.

The `rules` check runs on `pull_request_target`, so it always uses the copy of
the workflow on `main` and never checks out pull-request code.

### Known limit

GitHub cannot tell Claude from the owner: in Claude Code, Claude uses the owner's
Git login. "Waits for the owner" is therefore enforced in two places: the red
`rules` check, which only a ruleset bypass can override, and a Claude Code hook
(Phase 2) that blocks bypass commands such as `gh pr merge --admin` and pushes to
`main`. Until Phase 2, Claude simply must not use them.

## Phase 1: the net

One bootstrap pull request, merged by the owner by hand.

- `package.json`: scripts `typecheck` (`next typegen && tsc --noEmit`; the route
  types such as `LayoutProps` only exist once generated), `test:smoke`, `verify`;
  dev dependency `@playwright/test`; `engines` and `.nvmrc` pinned to the Node
  major that Vercel builds with (check Project Settings first).
- `playwright.config.ts`: phone and desktop projects (Chromium, plus WebKit on
  phone); starts `next start` locally, or targets `BASE_URL` when set.
- `tests/smoke/` (about ten tests, role and text locators, no app changes):
  - no console errors, CSP violations or failed requests
  - loading screen clears; every image loads
  - skip link, desktop nav, mobile sheet (focus trap, Escape)
  - a route opens its detail dialog and returns focus
  - every join link equals `membershipFormUrl`
  - non-affiliation notice on `/` and `/events`
  - events state matches `content/events.ts`
  - reduced motion; no horizontal overflow at 360px
  - security headers, `robots.txt`, `sitemap.xml`, Open Graph image
- `.github/workflows/ci.yml`: job `verify` on pull requests and pushes to `main`.
  Least-privilege `permissions`, actions pinned, report kept 7 days on failure.
- `.github/workflows/rules.yml`: job `rules` as described above.
- `.github/workflows/live-check.yml`: on Vercel's `repository_dispatch`
  production events and weekly; opens an issue on failure.
- `README.md`: deployment section updated to this path.

Found while building it:
- Locally, WebKit applies the CSP's `upgrade-insecure-requests` to
  `http://localhost` and every asset fails. The tests drop that one directive
  for local WebKit runs only; the live check runs the full policy over HTTPS.
- WebKit follows Safari's default, where Tab skips links, so the keyboard tests
  press Option+Tab there. Under that default the mobile sheet's focus trap lets
  focus leave the header, because the trap counts links Safari will not stop on.

Found after the bootstrap merge:
- On the Ubuntu 26.04 runner that `ubuntu-latest` moved to in November 2026,
  `playwright install --with-deps` hung until the 20-minute timeout: the runner
  could not resolve Ubuntu's package mirrors, and each of 185 packages waited
  on DNS. `verify` and `live-check` now run inside Playwright's own image
  (`mcr.microsoft.com/playwright`, pinned by digest), which already holds the
  browsers and their libraries, so CI installs nothing from Ubuntu. Upgrading
  `@playwright/test` means changing the image tag and digest in both workflows
  in the same pull request. The live check's issue step runs in a job of its
  own on the plain runner, because the image has no `gh`.
- Linux WebKit plays video through GStreamer, and on a runner with no screen or
  GPU the home page stopped answering as soon as a video began to decode.
  Blocking the two videos stopped it, with or without reduced motion; turning
  off GStreamer's hardware decoder or its audio output did not. So on Linux,
  and in WebKit only, the smoke tests do not fetch the videos and the posters
  stand in. WebKit on a Mac still runs them with the videos, and Chromium
  fetches them, though Playwright's Chromium cannot decode H.264, so no CI
  browser plays them.

Fork pull requests get no secrets (there are none), never auto-merge, and need
the owner's approval to run workflows.

### Owner's clicks after the bootstrap merge

Done on 12 Nov 2026. The ruleset was read back through the GitHub API: it
targets the default branch and requires `verify` and `rules`, and the bypass is
repository admin, for pull requests only.

GitHub, Settings:
- General: allow auto-merge; allow rebase merging only; delete head branches.
- Rules: ruleset on `main` requiring a pull request, required checks `verify`
  and `rules`, linear history, no force pushes or deletions. Bypass: repository
  admin, for pull requests only.
- Actions: require approval for all outside contributors.

Vercel, Settings, Build and Deployment, Deployment Checks:
- Add native Lint and Typecheck, and the GitHub check `verify`.
- Watch one deploy and confirm `tgva.vercel.app` waits for the checks. If it does
  not on Hobby, record that here; branch protection still gates `main`.

It does on Hobby. For `b08d00a` and `fa087bf`, Vercel reported "Waiting for
checks to complete" until `verify` passed on `main`, then went live about three
seconds later.

Vercel sends a `repository_dispatch` event for every deployment. The live check
skips previews. A production deploy sends two events a second apart,
`vercel.deployment.success` and `vercel.deployment.promoted`. The workflow's
concurrency group cancels the first, so one live check runs and one cancelled
run is listed per deploy.

### Done when

A one-line change under `app/` goes from pull request to live with no clicks, and
a change to `tests/` stops and waits.

Met on 12 Nov 2026. #3, a comment in `app/robots.ts`, auto-merged by rebase,
waited for `verify`, went live, and started the live check, which passed. #4, a
comment in `tests/smoke/meta.spec.ts`, passed `verify`, failed `rules`, and
waited until the owner merged it with the bypass.

## Phase 2: wiring for Claude

- `.mcp.json`: `next-devtools` (local errors and console), `playwright`
  (isolated profile), `vercel` (official, OAuth).
- `.claude/settings.json`: allow the read-only Vercel tools and the repo scripts;
  deny env files, force pushes, bypass merges, `vercel` deploy commands.
  PreToolUse hook that inspects full Git and `gh` commands.
- `CLAUDE.md`: always-on rules written in the file itself (the desktop app does
  not expand `@AGENTS.md`), keeping the import line for Claude Code.
- Scripts: `check:content`, `check:links`, `release:status`.
- Dependency updates are done in a session, not by Dependabot pull requests.

## Phase 3: `tgva` server and skills

- Local MCP server with five tools wrapping the scripts: `content_check`,
  `links_check`, `preflight`, `verify_deployment`, `release_status`. Registered
  in `.mcp.json` and in the desktop app, so both surfaces run the same checks.
- Skills `tgva-content`, `tgva-verify`, `tgva-ship`. Open decision: the repo is
  now public, so skills in `.claude/skills/` would be public too. If they should
  stay private, they go in `~/.claude/skills/` or the owner's Claude account.

## Later

Analytics for membership-form clicks, a link watch for the Discord invite and
form, Discord events into `content/events.ts`, Infinite Flight Live API.
