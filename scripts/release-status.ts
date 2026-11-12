/**
 * `npm run release:status`: where every change stands on the release path in
 * docs/AUTOMATION.md, in one read.
 *
 * - this checkout: branch, how far it is from main, uncommitted files
 * - open pull requests: their checks, and whether one waits for the owner
 * - main: whether `verify` passed and whether Vercel put it live
 * - the live site: the last live check, and any open live-check issue
 *
 * Read-only: it runs `git` and `gh` queries and changes nothing. It needs `gh`
 * logged in to an account that can read the repository.
 */
import { execFileSync } from "node:child_process";

const repo = "NattapongPailom/TGVA";

const run = (command: string, args: string[]) =>
  execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const gh = <T>(args: string[]): T => JSON.parse(run("gh", args)) as T;
const short = (sha: string) => sha.slice(0, 7);
const ago = (iso: string) => {
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 48 * 60) return `${Math.round(minutes / 60)} h ago`;
  return `${Math.round(minutes / 1440)} days ago`;
};

type Check = { name?: string; context?: string; status?: string; conclusion?: string; state?: string };
type PullRequest = {
  number: number;
  title: string;
  headRefName: string;
  isDraft: boolean;
  autoMergeRequest: unknown;
  statusCheckRollup: Check[];
};
type Run = { databaseId: number; displayTitle: string; headSha: string; conclusion: string; status: string; createdAt: string };

/** "pass", "fail", "pending" or "skipped", the way `gh pr checks` words it. */
function outcome(check: Check) {
  const value = (check.conclusion || check.state || check.status || "").toLowerCase();
  if (["success", "neutral"].includes(value)) return "pass";
  if (["failure", "error", "timed_out", "cancelled", "action_required", "startup_failure"].includes(value)) return "fail";
  if (value === "skipped") return "skipped";
  return "pending";
}

function section(title: string) {
  console.log(`\n${title}`);
}

/* ------------------------------------------------------------ this checkout */

run("git", ["fetch", "--quiet", "origin", "main"]);
const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
const [behind, ahead] = run("git", ["rev-list", "--left-right", "--count", "origin/main...HEAD"]).split(/\s+/);
const dirty = run("git", ["status", "--porcelain"]).split("\n").filter(Boolean).length;

section("This checkout");
console.log(`  branch ${branch}: ${ahead} ahead of main, ${behind} behind; ${dirty} uncommitted file${dirty === 1 ? "" : "s"}`);
if (branch === "main" && Number(ahead) > 0) console.log("  ! commits on local main: main only changes through pull requests");

/* ---------------------------------------------------------- pull requests */

const pulls = gh<PullRequest[]>([
  "pr", "list", "--repo", repo, "--state", "open",
  "--json", "number,title,headRefName,isDraft,autoMergeRequest,statusCheckRollup",
]);

section(`Open pull requests (${pulls.length})`);
for (const pull of pulls) {
  const checks = Object.fromEntries(pull.statusCheckRollup.map((check) => [check.name ?? check.context, outcome(check)]));
  const verify = checks.verify ?? "not run";
  const rules = checks.rules ?? "not run";
  let state = "in progress";
  if (verify === "fail") state = "verify failed: needs a fix";
  else if (rules === "fail") state = "rule paths touched: waits for the owner";
  else if (verify === "pass" && rules === "pass") state = pull.autoMergeRequest ? "green: auto-merging" : "green: auto-merge not enabled";
  console.log(`  #${pull.number} ${pull.title}${pull.isDraft ? " (draft)" : ""}`);
  console.log(`      ${pull.headRefName} · verify ${verify} · rules ${rules} · ${state}`);
}

/* ------------------------------------------------------------------- main */

const head = gh<{ sha: string; commit: { message: string; committer: { date: string } } }>([
  "api", `repos/${repo}/commits/main`,
]);
const checkRuns = gh<{ check_runs: Check[] }>(["api", `repos/${repo}/commits/${head.sha}/check-runs`]).check_runs;
const verifyOnMain = checkRuns.find((check) => check.name === "verify");
const vercel = gh<{ context: string; state: string; description: string }[]>([
  "api", `repos/${repo}/commits/${head.sha}/statuses`,
]).find((status) => status.context === "Vercel");

section("main");
console.log(`  ${short(head.sha)} ${head.commit.message.split("\n")[0]} (${ago(head.commit.committer.date)})`);
console.log(`  verify: ${verifyOnMain ? outcome(verifyOnMain) : "not run"}`);
console.log(`  Vercel: ${vercel ? `${vercel.state}, ${vercel.description}` : "no status yet"}`);

/* --------------------------------------------------------- the live site */

const liveRuns = gh<Run[]>([
  "run", "list", "--repo", repo, "--workflow", "live-check.yml", "--limit", "10",
  "--json", "databaseId,displayTitle,headSha,conclusion,status,createdAt",
]).filter((liveRun) => !["cancelled", "skipped"].includes(liveRun.conclusion));
const last = liveRuns[0];
const issues = gh<{ number: number; title: string }[]>([
  "issue", "list", "--repo", repo, "--state", "open", "--search", "Live check failed in:title", "--json", "number,title",
]);

section("Live site (tgva.vercel.app)");
if (last) {
  const result = last.status === "completed" ? last.conclusion : last.status;
  const current = last.headSha === head.sha ? "main as it is now" : `${short(last.headSha)}, not main's ${short(head.sha)}`;
  console.log(`  last live check: ${result}, ${ago(last.createdAt)}, tested ${current}`);
} else {
  console.log("  no live check has run yet");
}
for (const issue of issues) console.log(`  ! open issue #${issue.number}: ${issue.title}`);
if (!issues.length) console.log("  no open live-check issues");
