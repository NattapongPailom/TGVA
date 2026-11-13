# Automation

How changes to the TGVA site are checked, merged and released, and how Claude
works inside that. Agreed with the owner on 11 Nov 2026. This file is the source
of truth for every Claude surface (Claude Code in VS Code, the Claude desktop
app); `CLAUDE.md` points here.

Status: **Phases 1, 2 and 3 done on 12 Nov 2026** (pull requests #1 to #8).

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
(Phase 2, `.claude/hooks/guard-commands.mjs`) that blocks bypass commands such
as `gh pr merge --admin` and pushes to `main`.

The hook is a guard, not a wall. It reads each Bash command the way the shell
would split it, but a program Claude writes and then runs, which calls GitHub
itself, is not a command it can see. What holds regardless: the ruleset blocks
every direct push to `main`, for the owner too. What rests on the hook and on
`CLAUDE.md`: an admin's bypass merge, and admin writes through the API.

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
skips previews. A production deploy sends two events within a second,
`vercel.deployment.success` and `vercel.deployment.promoted`. Both runs share
the workflow's concurrency group, so GitHub cancels one of them, and which one
varies. One live check runs and one cancelled run is listed per deploy.

### Done when

A one-line change under `app/` goes from pull request to live with no clicks, and
a change to `tests/` stops and waits.

Met on 12 Nov 2026. #3, a comment in `app/robots.ts`, auto-merged by rebase,
waited for `verify`, went live, and started the live check, which passed. #4, a
comment in `tests/smoke/meta.spec.ts`, passed `verify`, failed `rules`, and
waited until the owner merged it with the bypass.

## Phase 2: wiring for Claude

The plan:

- `.mcp.json`: `next-devtools` (local errors and console), `playwright`
  (isolated profile), `vercel` (official, OAuth).
- `.claude/settings.json`: allow the read-only Vercel tools and the repo scripts;
  deny env files, force pushes, bypass merges, `vercel` deploy commands.
  PreToolUse hook that inspects full Git and `gh` commands.
- `CLAUDE.md`: always-on rules written in the file itself (the desktop app does
  not expand `@AGENTS.md`), keeping the import line for Claude Code.
- Scripts: `check:content`, `check:links`, `release:status`.
- Dependency updates are done in a session, not by Dependabot pull requests.

As built:

- `.mcp.json` pins `next-devtools-mcp@0.4.0` and `@playwright/mcp@0.0.85`
  (`--isolated`: the browser profile lives in memory and is thrown away). Vercel
  is the project-scoped endpoint, `https://mcp.vercel.com/nattapongpailom/tgva`,
  so the connection reaches this project only and does not offer
  `deploy_to_vercel` at all.
- `.claude/settings.json` allows the repository scripts, three read-only
  `next-devtools` tools and nine read-only Vercel tools by name. Every other
  Vercel tool asks first; the deploy tools are denied. `.env` files are denied
  to Read and Edit. The project-scoped connection does not offer
  `get_deployment_build_logs` (checked 13 Nov 2026), so it is not on the list;
  `list_deployment_events` returns a deployment's build output instead.
- `.claude/hooks/guard-commands.mjs` blocks, for Git: force pushes in every
  form, `--mirror`, `--all`, `--delete`, `--prune`, any push that reaches
  `main`, and a bare push from `main`. For `gh`: `pr merge --admin`, `api`
  writes (a method other than GET, fields, a GraphQL mutation), `repo edit`,
  `delete`, `rename` and `archive`, `workflow disable`, secret and variable
  writes, and `auth token`. For Vercel: everything except `ls`, `inspect`,
  `logs`, `whoami`, `help` and the version. It sees through `&&`, `;`, pipes,
  subshells, `$( )`, backticks, `bash -c`, `eval`, `env`, `sudo`, `npx` and a
  preceding `cd` or `git -C`, and skips heredoc bodies so a commit message may
  mention a blocked command. What it cannot parse, it blocks if Git, `gh` or
  Vercel is involved; if it fails, it does the same.
- `tests/hooks/guard-commands.test.mjs` holds the cases that must be blocked
  and those that must not, which matter as much: a guard that blocks ordinary
  work gets switched off. `npm run test:hooks` runs it, inside `verify`.
- `npm run check:content` checks the rules `content/` states in its own
  comments: each image's width and height are its real size, every file the
  content names is in `public/`, every timetable aircraft code names a fleet
  type, coordinates are in range, IATA codes are unique, an emphasis is part of
  its title, an event's printed date is the day it starts, the membership QR
  code encodes the current form, links are https, and nothing reads like a
  placeholder. Offline, so it runs inside `verify`.
- `npm run check:links` asks every outside address in `content/`. A Discord
  invite is checked with Discord's invite lookup, which reports an expired one;
  the Google Form fails if it stops taking responses. It needs the network, so
  it is not part of `verify`.
- `npm run release:status` prints the checkout's branch, the open pull requests
  and their checks, `verify` and Vercel's status on `main`, and the last live
  check. Read-only.
- The scripts run with `tsx`, a dev dependency, because `content/` imports
  through the `@/` path alias that plain Node does not resolve.

### Owner's steps after the merge

- In Claude Code, run `/mcp` and sign in to `vercel` with the Vercel account
  that owns `tgva`. Approve the three servers when Claude Code first asks.
- The hook, the permissions and the MCP servers are Claude Code settings. A
  Claude surface that does not load `.claude/settings.json` has `CLAUDE.md`
  only, and no hook to stop it.

## Phase 3: `tgva` server and skills

The plan:

- Local MCP server with five tools wrapping the scripts: `content_check`,
  `links_check`, `preflight`, `verify_deployment`, `release_status`. Registered
  in `.mcp.json` and in the desktop app, so both surfaces run the same checks.
- Skills `tgva-content`, `tgva-verify`, `tgva-ship`. Open decision: the repo is
  now public, so skills in `.claude/skills/` would be public too. If they should
  stay private, they go in `~/.claude/skills/` or the owner's Claude account.

Decided on 12 Nov 2026: the skills live in `.claude/skills/`. They hold only
process steps already public in `CLAUDE.md` and this file, and there they are
versioned, and every change to them waits for the owner.

As built:

- `scripts/mcp-server.ts`, started with `tsx` over stdio, on the official MCP
  SDK. Each tool runs one npm script and returns its output; a failing check is
  an error result. All five are marked read-only.

  | Tool | Script |
  |---|---|
  | `content_check` | `npm run check:content` |
  | `links_check` | `npm run check:links` |
  | `preflight` | `npm run verify` |
  | `verify_deployment` | `npm run verify:deployment [url]` |
  | `release_status` | `npm run release:status` |

- `npm run verify:deployment` is new: the smoke tests against a deployed copy,
  production by default. It accepts only this site's addresses (production,
  `NEXT_PUBLIC_SITE_URL`, `tgva-…-nattapongpailom.vercel.app` previews).
  Previews sit behind Vercel Authentication, which redirects to a login; it
  says so and stops rather than run every test against a login page.
- `tests/mcp/tgva-server.test.mjs` starts the server as a client would, checks
  the five tools, runs `content_check`, and checks that `verify_deployment`
  refuses another site. `npm run test:mcp`, inside `verify`. It never calls
  `preflight`, which would run `verify` from inside `verify`.
- The skills: `tgva-content` (where each kind of content lives, the truth rule,
  the checks), `tgva-verify` (which check answers which question, reading a
  failure) and `tgva-ship` (the release path step by step, and where it stops
  for the owner).
- Registration: `.mcp.json` has a `tgva` entry and `.claude/settings.json`
  allows its tools. Claude Code's auto mode would not let Claude change its own
  permissions, so the owner made those two edits (#8).
- The desktop app starts the same server from
  `~/Library/Application Support/Claude/claude_desktop_config.json` on the
  owner's Mac. The app does not pass a shell's environment, so the entry names
  Node by its full path (`~/.nvm/versions/node/v24.13.0/bin/node`), runs
  `node_modules/tsx/dist/cli.mjs`, and sets `PATH` to Node's folder plus
  Homebrew's, for `gh`. After a Node upgrade, the entry's two Node paths change
  with it. Tested on 12 Nov 2026 by starting it from `/` with only that
  environment: five tools listed, `content_check` and `release_status` passed.

## Subagents

Added on 13 Nov 2026 at the owner's request: three subagents in
`.claude/agents/`, one per model, each with `effort: high`.

| Agent | Model | Job | Tools |
|---|---|---|---|
| `tgva-reviewer` | Opus | Security and correctness review of a diff or the whole site. Changes nothing. | Read, Grep, Glob, Bash |
| `tgva-builder` | Sonnet | One scoped change, then lint, typecheck and the content checks. Never commits. | Read, Edit, Write, Grep, Glob, Bash |
| `tgva-scout` | Haiku | Fast lookups with file:line citations. Changes nothing. | Read, Grep, Glob |

How they fit the release path:

- The main session decides, commits, pushes and opens the pull request. A
  subagent never does: the builder stops at a checked working tree.
- `.claude/hooks/guard-commands.mjs` and the deny list in
  `.claude/settings.json` apply to subagents as well, so none of them can
  merge past a check, force push or deploy.
- A typical change: the scout finds the files, the builder makes the change,
  the reviewer reads the diff, the main session runs `npm run verify` and ships.
- They are in a rule path, so a change to any of them waits for the owner.

## Later

Analytics for membership-form clicks, a link watch for the Discord invite and
form, Discord events into `content/events.ts`, Infinite Flight Live API.
