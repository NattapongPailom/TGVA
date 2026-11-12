/**
 * Tests for scripts/mcp-server.ts, run by `npm run test:mcp`.
 *
 * The server is started the way an MCP client starts it, over stdio, and
 * spoken to with the SDK's own client. `preflight` is not called: it runs
 * `npm run verify`, which runs these tests.
 */
import assert from "node:assert/strict";
import path from "node:path";
import { after, before, test } from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = path.resolve(import.meta.dirname, "../..");
let client;

before(async () => {
  client = new Client({ name: "tgva-test", version: "1.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [path.join(root, "node_modules/tsx/dist/cli.mjs"), path.join(root, "scripts/mcp-server.ts")],
      cwd: root,
      stderr: "pipe",
    }),
  );
});

after(async () => {
  await client?.close();
});

test("it offers the five tools, all read-only", async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((tool) => tool.name).sort(), [
    "content_check",
    "links_check",
    "preflight",
    "release_status",
    "verify_deployment",
  ]);
  for (const tool of tools) assert.equal(tool.annotations?.readOnlyHint, true, `${tool.name} is read-only`);
});

test("content_check runs check:content and passes on this repository", async () => {
  const response = await client.callTool({ name: "content_check", arguments: {} });
  assert.equal(response.isError, false, response.content[0].text);
  assert.match(response.content[0].text, /^content_check: passed/);
  assert.match(response.content[0].text, /content\/ follows its own rules/);
});

test("verify_deployment refuses an address that is not this site", async () => {
  const response = await client.callTool({ name: "verify_deployment", arguments: { url: "https://example.com" } });
  assert.equal(response.isError, true);
  assert.match(response.content[0].text, /failed \(exit 2\)/);
  assert.match(response.content[0].text, /is not a deployment of this site/);
});
