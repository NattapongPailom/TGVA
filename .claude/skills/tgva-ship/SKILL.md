---
name: tgva-ship
description: Release a change to the TGVA site through the release path, from branch to live. Use when a change is ready to commit, push, open as a pull request, merge or deploy, or when asked to ship, publish or put something live.
---

# Shipping a TGVA change

Production changes only because `main` changed, and `main` changes only through
a pull request. The full design is `docs/AUTOMATION.md`.

## Steps

1. **Branch from `origin/main`.** `git fetch origin && git switch -c <kind>/<topic> origin/main`.
   Never commit on `main`.
2. **Make the change.** Content follows the `tgva-content` skill.
3. **Run `preflight`** (or `npm run verify`). Don't push until it passes.
4. **Commit.** A message that says what changed and why, in the repository's
   style: an imperative first line in plain words. End it with the attribution
   lines the session gives you.
5. **Push and open the pull request.**
   `git push -u origin <branch>`, then `gh pr create --base main`. Say in the
   body what changed, how it was checked, and anything not checked.
6. **Turn on auto-merge.** `gh pr merge <branch> --auto --rebase`.
7. **Watch it through** with `release_status`:
   - **Site paths only** (`app/`, `components/`, `content/`, `lib/`, `public/`,
     `docs/`): once `verify` and `rules` pass, GitHub merges by rebase, Vercel
     waits for `verify` on `main`, goes live, and the live check runs.
   - **Any rule path** (`.github/`, `.claude/`, `.mcp.json`, `CLAUDE.md`,
     `AGENTS.md`, `scripts/`, `tests/`, `package.json`, `package-lock.json`,
     `.nvmrc`, `next.config.ts`, `eslint.config.mjs`, `tsconfig.json`,
     `playwright.config.ts`): `rules` goes red on purpose. Tell the owner the
     pull request is waiting for them, with its link. Stop there.
8. **Confirm it is live.** `release_status` shows the live check passed on the
   new `main`. Only then say it is live.

## Never

- `gh pr merge --admin`, a force push, a push to `main`, or any other way past a
  red check. The command guard blocks these; when it does, stop and tell the
  owner.
- A Vercel deploy, promote or rollback, from the CLI or the Vercel MCP server.
- Merging a rule-path pull request. That is the owner's, always.

## If production breaks

Fix or revert through a pull request, the same way. If the site has to come back
at once, tell the owner: Vercel's Instant Rollback is their click.
