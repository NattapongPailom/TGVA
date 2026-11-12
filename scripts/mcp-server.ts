/**
 * The `tgva` MCP server: the repository's checks as tools, so Claude Code and
 * the Claude desktop app run exactly what the owner and CI run.
 *
 * It only wraps npm scripts (docs/AUTOMATION.md, principle 3). Each tool runs
 * one script in this repository and returns its output; a check that fails
 * comes back as an error result. Nothing here changes the repository, GitHub
 * or Vercel.
 *
 *   content_check      npm run check:content       offline, seconds
 *   links_check        npm run check:links         needs the network
 *   preflight          npm run verify              what CI runs; minutes
 *   verify_deployment  npm run verify:deployment   smoke tests on a deployment
 *   release_status     npm run release:status      needs gh logged in
 *
 * Started over stdio: by Claude Code from .mcp.json, and by the desktop app
 * from its own config.
 */
import { spawn } from "node:child_process";
import path from "node:path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/** The repository root: this file is in scripts/. */
const root = path.resolve(__dirname, "..");

/** The most output a tool hands back; the end of a log is where failures are. */
const maxOutput = 30_000;

type Run = { code: number | null; output: string };

function npmRun(script: string, args: string[], timeoutMs: number): Promise<Run> {
  return new Promise((resolve) => {
    const child = spawn("npm", ["run", "--silent", script, ...(args.length ? ["--", ...args] : [])], {
      cwd: root,
      env: {
        ...process.env,
        // The desktop app starts this server without a login shell's PATH;
        // npm sits next to the node that runs it.
        PATH: [path.dirname(process.execPath), process.env.PATH].filter(Boolean).join(path.delimiter),
        FORCE_COLOR: "0",
        NO_COLOR: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    const timer = setTimeout(() => {
      output += `\n[stopped after ${Math.round(timeoutMs / 60_000)} minutes]`;
      child.kill("SIGTERM");
    }, timeoutMs);
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ code: null, output: `${output}\n[could not start npm: ${error.message}]` });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
  });
}

function result(name: string, run: Run) {
  const clean = run.output.replace(/\x1b\[[0-9;]*m/g, "").trim();
  const shown = clean.length > maxOutput ? `[…the first ${clean.length - maxOutput} characters are cut]\n${clean.slice(-maxOutput)}` : clean;
  const passed = run.code === 0;
  return {
    content: [{ type: "text" as const, text: `${name}: ${passed ? "passed" : `failed (exit ${run.code ?? "none"})`}\n\n${shown}` }],
    isError: !passed,
  };
}

const server = new McpServer({ name: "tgva", version: "1.0.0" });

server.registerTool(
  "content_check",
  {
    title: "Check content/",
    description:
      "Runs `npm run check:content`: the rules content/ states about itself (image sizes match the files, files exist in public/, timetable aircraft codes name fleet types, coordinates, unique IATA codes, event dates, the membership QR code, https links, no placeholders). Offline, a few seconds. It cannot check that a fact is true.",
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async () => result("content_check", await npmRun("check:content", [], 2 * 60_000)),
);

server.registerTool(
  "links_check",
  {
    title: "Check outside links",
    description:
      "Runs `npm run check:links`: asks every outside address in content/ whether it still works. A Discord invite is checked for expiry; the membership Google Form fails if it no longer takes responses. Needs the network.",
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async () => result("links_check", await npmRun("check:links", [], 2 * 60_000)),
);

server.registerTool(
  "preflight",
  {
    title: "Run verify",
    description:
      "Runs `npm run verify`, the check CI runs on every pull request: lint, typecheck, check:content, the hook and server tests, a production build and the Playwright smoke tests. Run it before every push. Takes a few minutes.",
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async () => result("preflight", await npmRun("verify", [], 15 * 60_000)),
);

server.registerTool(
  "verify_deployment",
  {
    title: "Smoke-test a deployment",
    description:
      "Runs `npm run verify:deployment`: the smoke tests against a deployed copy of the site. With no url it tests production, https://tgva.vercel.app. Accepts only this site's own addresses; previews sit behind Vercel Authentication and are reported as such.",
    inputSchema: {
      url: z.string().url().optional().describe("The deployment to test. Leave out for production."),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ url }) => result("verify_deployment", await npmRun("verify:deployment", url ? [url] : [], 10 * 60_000)),
);

server.registerTool(
  "release_status",
  {
    title: "Release status",
    description:
      "Runs `npm run release:status`: this checkout's branch, open pull requests and whether each waits for the owner, whether main passed verify and went live on Vercel, and the last live check. Read-only; needs gh logged in.",
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async () => result("release_status", await npmRun("release:status", [], 2 * 60_000)),
);

// tsx runs this file as CommonJS, which has no top-level await.
async function main() {
  await server.connect(new StdioServerTransport());
}

void main();
