# Working on TGVA

These rules are written out here because the Claude desktop app does not follow
the `@AGENTS.md` import at the end of this file; Claude Code reads both. The
full design is `docs/AUTOMATION.md`, the source of truth if this file and it
ever disagree.

## Releasing a change

- Never commit on `main`. Branch from `origin/main`.
- Run `npm run verify` before every push: lint, typecheck, `check:content`, the
  hook tests, build and the smoke tests, the same as CI.
- Push the branch, open a pull request with `gh pr create`, then turn on
  auto-merge with `gh pr merge <branch> --auto --rebase`.
- Site paths (`app/`, `components/`, `content/`, `lib/`, `public/`, `docs/`)
  merge on their own once `verify` and `rules` pass.
- Rule paths wait for the owner: `.github/`, `.claude/`, `.mcp.json`,
  `CLAUDE.md`, `AGENTS.md`, `scripts/`, `tests/`, `package.json`,
  `package-lock.json`, `.nvmrc`, `next.config.ts`, `eslint.config.mjs`,
  `tsconfig.json`, `playwright.config.ts`. The `rules` check goes red and stays
  red; say so, and leave the merge to the owner.
- After a merge, `npm run release:status` shows whether `verify` passed on
  `main`, whether Vercel put it live, and what the last live check found.
- Production breaks: fix or revert through a pull request. Vercel's Instant
  Rollback is the owner's click, not Claude's.

## What Claude never does

Claude uses the owner's GitHub login, so GitHub cannot tell the two apart. These
are the owner's alone, and `.claude/hooks/guard-commands.mjs` blocks them:

- `gh pr merge --admin`, or any other way past a required check
- a force push in any form, a push to `main`, deleting a branch on GitHub
- `gh api` calls that write, and changes to the repository's settings,
  rulesets, workflows, secrets or variables
- deploying, promoting or rolling back on Vercel, from the CLI or the Vercel
  MCP server: production changes only because `main` changed

When the hook blocks a command, stop and tell the owner what was blocked and
why. Do not look for another way to do the same thing.

## Content

- Say only what is true (`docs/PRODUCT.md`). Every name, number, date, route,
  event and quote comes from the owner. A missing fact stays missing: a vacant
  role reads as open, an empty events list says so. Never fill a gap with
  something plausible.
- Content lives in `content/*.ts`. After changing it, run
  `npm run check:content`; after changing an outside link, `npm run check:links`.

## Dependencies and secrets

- Dependencies are updated in a session, not by Dependabot: one pull request,
  `npm run verify`, and the owner merges it, since `package.json` is a rule
  path. Upgrading `@playwright/test` also means changing the Playwright image
  tag and digest in both workflows.
- The repository is public: everything committed is world-readable, `.claude/`
  included. There are no secrets in it, and none are added. `.env` files are
  never read.

## Tools

- The `tgva` MCP server runs the repository's checks as tools:
  `content_check`, `links_check`, `preflight` (`npm run verify`),
  `verify_deployment` and `release_status`. Same scripts, same results.
- The skills in `.claude/skills/`: `tgva-content` for changing what the site
  says, `tgva-verify` for checking it, `tgva-ship` for releasing a change.
- The subagents in `.claude/agents/`, each at `effort: high`: `tgva-reviewer`
  (Opus, read-only security and correctness review), `tgva-builder` (Sonnet,
  one scoped change, never commits) and `tgva-scout` (Haiku, read-only
  lookups). The main session commits and ships. See `docs/AUTOMATION.md`.
- `.mcp.json` also sets up `next-devtools` (the dev server's errors and logs),
  `playwright` (a browser with a throwaway profile) and `vercel` (this project
  only, read-only tools allowed, deploy tools denied).
- `.claude/settings.json` allows the repository scripts and the read-only
  Vercel tools, and denies `.env` files, force pushes, bypass merges and deploys.

@AGENTS.md
