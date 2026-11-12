---
name: tgva-verify
description: Check the TGVA site, before or after a change. Use when asked whether something works, before pushing, after a merge or deploy, when CI or the live check failed, or when the owner asks if the site is healthy.
---

# Checking TGVA

Every check is an npm script; the `tgva` MCP server runs the same scripts as
tools. Use the tool when it is connected, the script when it is not. The
results are identical.

| Question | Tool | Script | Time |
|---|---|---|---|
| Does `content/` follow its own rules? | `content_check` | `npm run check:content` | seconds |
| Do the outside links still work? | `links_check` | `npm run check:links` | seconds, network |
| Will CI pass? | `preflight` | `npm run verify` | minutes |
| Does the live site work? | `verify_deployment` | `npm run verify:deployment` | about a minute |
| Where does every change stand? | `release_status` | `npm run release:status` | seconds |

## When to run what

- **Before every push:** `preflight`. It is exactly what CI runs: lint,
  typecheck, `check:content`, the hook and server tests, the build and the smoke
  tests.
- **After a merge:** `release_status`, until `main` shows `verify` passed, Vercel
  says the deployment completed, and the last live check tested that commit.
- **When the owner asks if the site is fine:** `verify_deployment` with no
  address tests production; `links_check` covers the Discord invite and the form.
- Previews sit behind Vercel Authentication, so `verify_deployment` cannot test
  them. Test the change locally with `preflight` instead.

## Reading a failure

- Read the first failure, not the last; later ones often follow from it.
- A smoke test failure in CI leaves a Playwright report on the run for 7 days.
  `gh run download <id> -n playwright-report`, then read the trace or
  `error-context.md`.
- In Linux WebKit (CI and the live check) the tests deliberately skip the two
  videos; GStreamer freezes the page otherwise (`docs/AUTOMATION.md`). That is
  not a failure to fix.
- A live check failure opens an issue titled "Live check failed on …".

## What not to do

- Never edit a test, a check or a workflow to make a failure go away. Find the
  cause. If the check itself is wrong, say so and change it in its own pull
  request, which waits for the owner.
- Never report a check as passed without having run it in this session.
  Report a failure with its output.
