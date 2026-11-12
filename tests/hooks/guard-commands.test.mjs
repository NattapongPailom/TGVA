/**
 * Tests for .claude/hooks/guard-commands.mjs, run by `npm run test:hooks`.
 *
 * What must be blocked is listed with what must not be: a guard that stops
 * ordinary work gets switched off, which is worse than no guard.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";

import { inspect } from "../../.claude/hooks/guard-commands.mjs";

const hook = path.resolve(import.meta.dirname, "../../.claude/hooks/guard-commands.mjs");
let onMain;
let onFeature;
let upstreamMain;
let detached;

/** A scratch repository on the given branch, with one commit. */
function repo(branch, setup = []) {
  const dir = mkdtempSync(path.join(tmpdir(), "guard-"));
  const git = (...args) => execFileSync("git", ["-C", dir, ...args], { stdio: "ignore" });
  git("init", "--quiet", "--initial-branch", branch);
  git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "--quiet", "--allow-empty", "-m", "start");
  for (const args of setup) git(...args);
  return dir;
}

before(() => {
  onMain = repo("main");
  onFeature = repo("feature");
  upstreamMain = repo("feature", [["config", "push.default", "upstream"], ["config", "branch.feature.merge", "refs/heads/main"]]);
  detached = repo("main", [["checkout", "--quiet", "--detach"]]);
});

after(() => {
  for (const dir of [onMain, onFeature, upstreamMain, detached]) rmSync(dir, { recursive: true, force: true });
});

const blocked = (command, cwd = onFeature) => assert.equal(inspect(command, cwd).blocked, true, `should block: ${command}`);
const allowed = (command, cwd = onFeature) =>
  assert.equal(inspect(command, cwd).blocked, false, `should allow: ${command} (${inspect(command, cwd).reason})`);

describe("git push", () => {
  test("force in every spelling is blocked", () => {
    for (const command of [
      "git push --force",
      "git push origin feature --force",
      "git push -f origin feature",
      "git push -uf origin feature",
      "git push --force-with-lease origin feature",
      "git push --force-with-lease=feature:abc origin feature",
      "git push --force-if-includes origin feature",
      "git push origin +feature",
      "git push origin +HEAD:feature",
    ]) {
      blocked(command);
    }
  });

  test("pushes that reach main are blocked", () => {
    for (const command of [
      "git push origin main",
      "git push origin HEAD:main",
      "git push origin feature:main",
      "git push origin feature:refs/heads/main",
      "git push origin :main",
      "git push origin main:",
      "git push --all origin",
      "git push --mirror origin",
      "git push --delete origin feature",
      "git push -d origin feature",
      "git push --prune origin",
    ]) {
      blocked(command);
    }
    blocked("git push", onMain);
    blocked("git push origin", onMain);
    blocked("git push origin HEAD", onMain);
    blocked("git push -u origin HEAD", onMain);
    blocked("git push", upstreamMain);
    blocked("git push", detached);
  });

  test("branch pushes are allowed", () => {
    allowed("git push");
    allowed("git push -u origin feature");
    allowed("git push --set-upstream origin feature");
    allowed("git push -q -u origin automation/phase-2-wiring");
    allowed("git push origin HEAD");
    allowed("git push origin feature:feature");
    allowed("git push origin v1.0 --tags");
    allowed("git push origin feature 2>&1 | grep -v '^remote:'");
  });

  test("it is found however the line is built", () => {
    for (const command of [
      "cd /tmp && git push --force",
      "true; git push -f origin x",
      "echo ok || git push origin main",
      "(git push origin main)",
      "{ git push -f; }",
      "for b in a; do git push -f origin $b; done",
      "echo $(git push origin main)",
      'echo "$(git push origin main)"',
      "echo `git push origin main`",
      "bash -c 'git push origin main'",
      'sh -lc "cd x && git push --force"',
      "eval git push origin main",
      "env GIT_TRACE=1 git push origin main",
      "GIT_TRACE=1 git push origin main",
      "sudo -u me git push origin main",
      "timeout 30 git push origin main",
      "nohup git push origin main",
      "/usr/bin/git push origin main",
      "git -C . push origin main",
      "git -c push.default=simple push origin main",
      "git push origin $BRANCH",
      'git push origin "$(git branch --show-current)"',
      "git push origin main\n",
    ]) {
      blocked(command);
    }
  });

  test("a cd or -C changes which branch a bare push is from", () => {
    blocked(`cd ${JSON.stringify(onMain)} && git push`, onFeature);
    blocked(`git -C ${JSON.stringify(onMain)} push`, onFeature);
    allowed(`cd ${JSON.stringify(onFeature)} && git push`, onMain);
  });

  test("text that only mentions a blocked command is allowed", () => {
    allowed('git commit -m "Never git push --force to main"');
    allowed("echo 'git push origin main'");
    allowed("git log --grep='push --force'");
    allowed("grep -rn 'git push -f' docs # git push --force");
    allowed(
      [
        "git commit -q -F - <<'EOF'",
        "Explain why git push --force origin main is blocked",
        "",
        "gh pr merge --admin is blocked too.",
        "EOF",
        "git push -u origin feature",
      ].join("\n"),
    );
  });

  test("a heredoc does not hide the command after it", () => {
    blocked(["cat <<EOF > notes.txt", "harmless", "EOF", "git push --force"].join("\n"));
  });
});

describe("gh", () => {
  test("bypasses and writes are blocked", () => {
    for (const command of [
      "gh pr merge 5 --admin",
      "gh pr merge --admin --rebase 5",
      "gh -R NattapongPailom/TGVA pr merge 5 --admin",
      "gh api -X PUT repos/o/r/pulls/5/merge",
      "gh api --method DELETE repos/o/r/rulesets/1",
      "gh api --method=PATCH repos/o/r",
      "gh api -XPOST repos/o/r/issues",
      "gh api repos/o/r/rulesets -f name=x",
      "gh api repos/o/r/rulesets/1 --input rules.json",
      `gh api graphql -f query='mutation { mergePullRequest(input: {}) { clientMutationId } }'`,
      "gh repo edit --enable-auto-merge=false",
      "gh repo delete NattapongPailom/TGVA --yes",
      "gh workflow disable ci.yml",
      "gh secret set TOKEN",
      "gh variable delete X",
      "gh auth token",
    ]) {
      blocked(command);
    }
  });

  test("reads and the release path are allowed", () => {
    for (const command of [
      "gh pr create --base main --title t --body b",
      "gh pr merge 5 --auto --rebase",
      "gh pr merge chore/x --auto --rebase",
      "gh pr view 5 --json state",
      "gh pr checks 5",
      "gh run list --limit 5",
      "gh run view 123 --log",
      "gh run watch 123",
      "gh workflow run live-check.yml --ref main",
      "gh api repos/o/r/rulesets/1 --jq .rules",
      "gh api -X GET search/issues -f q=repo:o/r",
      "gh api graphql -f query='{ viewer { login } }'",
      "gh issue list --state open",
      "gh auth status",
      "gh ruleset view 1",
    ]) {
      allowed(command);
    }
  });
});

describe("vercel", () => {
  test("anything that deploys or changes the project is blocked", () => {
    for (const command of [
      "vercel",
      "vercel --prod",
      "vercel deploy",
      "vercel deploy --prod",
      "vercel --cwd . deploy",
      "vercel promote dpl_123",
      "vercel rollback",
      "vercel redeploy https://x.vercel.app",
      "vercel env pull",
      "vercel domains add x.com",
      "vercel alias set a b",
      "vercel rm tgva",
      "npx vercel --prod",
      "npx -y vercel@latest deploy",
      "npm exec vercel deploy",
      "pnpm dlx vercel deploy",
      "bunx vercel",
    ]) {
      blocked(command);
    }
  });

  test("reading is allowed", () => {
    for (const command of ["vercel ls", "vercel list tgva", "vercel inspect x.vercel.app", "vercel logs x.vercel.app", "vercel whoami", "vercel --version", "npx vercel ls"]) {
      allowed(command);
    }
  });
});

describe("everything else", () => {
  test("ordinary commands are allowed", () => {
    for (const command of [
      "npm run verify",
      "npm run check:content && npm run build",
      "ls -la && cat package.json | head",
      "node -e 'console.log(1)'",
      "git status --short && git log --oneline -3",
      "git switch -c docs/x origin/main",
      "git commit -q -m 'x'",
      "npx playwright test --project=desktop",
      "git diff > /tmp/out.patch",
    ]) {
      allowed(command);
    }
  });

  test("unparseable text is blocked only when it involves git, gh or vercel", () => {
    blocked("git push origin 'main");
    blocked('gh pr merge "5 --admin');
    allowed("echo 'unbalanced");
  });
});

describe("as a hook", () => {
  const run = (command, cwd = onFeature) =>
    spawnSync("node", [hook], {
      input: JSON.stringify({ hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command }, cwd }),
      encoding: "utf8",
    });

  test("a blocked command exits 2 with the reason on stderr", () => {
    const result = run("git push --force");
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Blocked by \.claude\/hooks\/guard-commands\.mjs: git push --force/);
  });

  test("an allowed command exits 0 and says nothing", () => {
    const result = run("npm run verify");
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
  });

  test("another tool, or input it cannot read, passes through", () => {
    const other = spawnSync("node", [hook], { input: JSON.stringify({ tool_name: "Read", tool_input: {} }), encoding: "utf8" });
    assert.equal(other.status, 0);
    const garbage = spawnSync("node", [hook], { input: "not json", encoding: "utf8" });
    assert.equal(garbage.status, 0);
  });
});
