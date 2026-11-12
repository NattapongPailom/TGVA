#!/usr/bin/env node
/**
 * PreToolUse hook for Bash: blocks the commands that would let Claude act with
 * the owner's powers rather than go through the release path.
 *
 * GitHub cannot tell Claude from the owner (docs/AUTOMATION.md, "Known
 * limit"): in Claude Code, Claude uses the owner's Git and `gh` login, and the
 * owner is a repository admin. This hook is the second of the two places that
 * keep "waits for the owner" true; the red `rules` check is the first.
 *
 * Blocked:
 *   git     push with --force (any form), --mirror, --all, --delete, --prune, a
 *           "+" refspec, or a destination of main; a bare push from main
 *   gh      pr merge --admin; api calls that write (a method other than GET,
 *           or fields, which make it a POST; a GraphQL mutation); repo edit,
 *           delete, rename, archive; workflow disable; secret and variable
 *           writes; auth token (it prints the owner's credential)
 *   vercel  everything except ls, list, inspect, logs, whoami, help, version:
 *           a deploy only ever happens because Git changed
 *
 * The command is parsed as the shell would split it: `&&`, `||`, `;`, pipes,
 * subshells, `$( )`, backticks, `bash -c`, `eval`, wrappers such as `env` and
 * `npx`, and a preceding `cd`. Heredoc bodies are skipped, so a commit message
 * that mentions a blocked command is not mistaken for one. Anything about Git,
 * gh or Vercel it cannot parse is blocked rather than guessed at.
 *
 * Input: the hook JSON on stdin. Blocked: exit 2, with the reason on stderr,
 * which Claude sees. Allowed: exit 0, and the normal permission rules decide.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";

/* ------------------------------------------------------------------ parsing */

class ParseError extends Error {}

/**
 * Splits shell text into simple commands, each an array of words with quotes
 * removed. Nested command text ($( ), backticks, subshells) is parsed too and
 * its commands added to the list. A word that held an expansion the guard
 * cannot evaluate ($VAR, $( ), backticks) is marked by a leading "\0".
 */
export function parseCommands(text) {
  const commands = [];
  let argv = [];
  let word = "";
  let inWord = false;
  let dynamic = false;
  let i = 0;
  const pendingHeredocs = [];

  const endWord = () => {
    if (inWord) argv.push(dynamic ? `\0${word}` : word);
    word = "";
    inWord = false;
    dynamic = false;
  };
  const endCommand = () => {
    endWord();
    if (argv.length) commands.push(argv);
    argv = [];
  };
  /** Index just past the `close` that matches the opener before `from`. */
  const matching = (from, open, close) => {
    let depth = 1;
    let j = from;
    let quote = null;
    while (j < text.length) {
      const c = text[j];
      if (quote) {
        if (c === "\\" && quote === '"') j++;
        else if (c === quote) quote = null;
      } else if (c === "\\") j++;
      else if (c === "'" || c === '"') quote = c;
      else if (c === open) depth++;
      else if (c === close && --depth === 0) return j + 1;
      j++;
    }
    throw new ParseError(`unbalanced ${open}`);
  };
  const nested = (inner) => commands.push(...parseCommands(inner));

  while (i < text.length) {
    const c = text[i];

    if (c === "\\") {
      if (text[i + 1] === "\n") i += 2;
      else {
        word += text[i + 1] ?? "";
        inWord = true;
        i += 2;
      }
      continue;
    }

    if (c === "'") {
      const end = text.indexOf("'", i + 1);
      if (end < 0) throw new ParseError("unbalanced '");
      word += text.slice(i + 1, end);
      inWord = true;
      i = end + 1;
      continue;
    }

    if (c === '"') {
      i++;
      inWord = true;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "\\" && i + 1 < text.length) {
          word += text[i + 1];
          i += 2;
        } else if (text[i] === "$" && text[i + 1] === "(") {
          const end = matching(i + 2, "(", ")");
          nested(text.slice(i + 2, end - 1));
          dynamic = true;
          i = end;
        } else if (text[i] === "`") {
          const end = text.indexOf("`", i + 1);
          if (end < 0) throw new ParseError("unbalanced `");
          nested(text.slice(i + 1, end));
          dynamic = true;
          i = end + 1;
        } else {
          if (text[i] === "$" && /[A-Za-z_{]/.test(text[i + 1] ?? "")) dynamic = true;
          word += text[i++];
        }
      }
      if (i >= text.length) throw new ParseError('unbalanced "');
      i++;
      continue;
    }

    if (c === "$" && text[i + 1] === "(") {
      const end = matching(i + 2, "(", ")");
      nested(text.slice(i + 2, end - 1));
      word += text.slice(i, end);
      inWord = true;
      dynamic = true;
      i = end;
      continue;
    }

    if (c === "`") {
      const end = text.indexOf("`", i + 1);
      if (end < 0) throw new ParseError("unbalanced `");
      nested(text.slice(i + 1, end));
      inWord = true;
      dynamic = true;
      i = end + 1;
      continue;
    }

    if (c === "$" && /[A-Za-z_{]/.test(text[i + 1] ?? "")) {
      word += c;
      inWord = true;
      dynamic = true;
      i++;
      continue;
    }

    if (c === "(" && !inWord) {
      // A subshell or a group: its commands stand on their own.
      endCommand();
      const end = matching(i + 1, "(", ")");
      nested(text.slice(i + 1, end - 1));
      i = end;
      continue;
    }

    if (c === "#" && !inWord) {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }

    if (c === "<" && text[i + 1] === "<" && text[i + 2] !== "<") {
      // A heredoc: note its delimiter; the body starts on the next line.
      endWord();
      i += 2;
      const strip = text[i] === "-";
      if (strip) i++;
      while (text[i] === " " || text[i] === "\t") i++;
      const match = /^(['"]?)([A-Za-z0-9_.-]+)\1/.exec(text.slice(i));
      if (!match) throw new ParseError("heredoc without a delimiter");
      pendingHeredocs.push({ delimiter: match[2], strip });
      i += match[0].length;
      continue;
    }

    if (c === ">" || c === "<") {
      // A redirection, with any target: not an argument to the command.
      if (inWord && /^\d+$/.test(word)) {
        word = "";
        inWord = false;
      }
      endWord();
      i++;
      if (text[i] === ">" || text[i] === "&" || text[i] === "|" || (c === "<" && text[i] === "<")) i++;
      while (text[i] === " " || text[i] === "\t") i++;
      // Skip the target word.
      while (i < text.length && !/[\s;&|()<>]/.test(text[i])) i++;
      continue;
    }

    if (c === "\n") {
      endCommand();
      i++;
      // Skip the bodies of any heredocs that began on the line just ended.
      while (pendingHeredocs.length) {
        const { delimiter, strip } = pendingHeredocs.shift();
        for (;;) {
          if (i >= text.length) throw new ParseError(`heredoc ${delimiter} never ends`);
          const lineEnd = text.indexOf("\n", i);
          const line = text.slice(i, lineEnd < 0 ? text.length : lineEnd);
          i = lineEnd < 0 ? text.length : lineEnd + 1;
          if ((strip ? line.replace(/^\t+/, "") : line) === delimiter) break;
        }
      }
      continue;
    }

    if (c === ";" || c === "&" || c === "|") {
      endCommand();
      i++;
      if ((c === "&" || c === "|") && (text[i] === c || (c === "|" && text[i] === "&"))) i++;
      continue;
    }

    if (c === ")") throw new ParseError("unbalanced )");

    if (c === " " || c === "\t") {
      endWord();
      i++;
      continue;
    }

    word += c;
    inWord = true;
    i++;
  }
  if (pendingHeredocs.length) throw new ParseError("heredoc without a body");
  endCommand();
  return commands;
}

/* ---------------------------------------------------------- the commands */

const isDynamic = (arg) => arg.startsWith("\0");
const plain = (arg) => (isDynamic(arg) ? arg.slice(1) : arg);

/** Removes leading `VAR=value`s and wrappers; returns the program and its args. */
const keywords = new Set(["{", "}", "!", "if", "then", "else", "elif", "do", "while", "until", "fi", "done"]);

function unwrap(argv) {
  let args = [...argv];
  for (;;) {
    while (args.length && (keywords.has(plain(args[0])) || /^[A-Za-z_][A-Za-z0-9_]*=/.test(plain(args[0])))) args.shift();
    if (!args.length) return { program: "", args: [] };
    const name = path.basename(plain(args[0]));
    const rest = args.slice(1);
    if (["command", "builtin", "exec", "nohup", "time", "sudo", "doas", "caffeinate"].includes(name)) {
      while (rest.length && /^-/.test(plain(rest[0]))) {
        const flag = plain(rest.shift());
        if (flag === "--") break;
        if ((name === "sudo" || name === "doas") && ["-u", "-g", "-C", "-D", "-h", "-p", "-U"].includes(flag)) rest.shift();
      }
      args = rest;
      continue;
    }
    if (name === "env") {
      while (rest.length && (/^-/.test(plain(rest[0])) || /^[A-Za-z_][A-Za-z0-9_]*=/.test(plain(rest[0])))) {
        const flag = plain(rest.shift());
        if (["-u", "--unset", "-C", "--chdir", "-S", "--split-string"].includes(flag)) rest.shift();
      }
      args = rest;
      continue;
    }
    if (name === "nice" || name === "ionice") {
      while (rest.length && /^-/.test(plain(rest[0]))) {
        const flag = plain(rest.shift());
        if (flag === "-n" || flag === "-c") rest.shift();
      }
      args = rest;
      continue;
    }
    if (name === "timeout") {
      while (rest.length && /^-/.test(plain(rest[0]))) {
        const flag = plain(rest.shift());
        if (flag === "-s" || flag === "-k" || flag === "--signal" || flag === "--kill-after") rest.shift();
      }
      rest.shift(); // the duration
      args = rest;
      continue;
    }
    if (name === "xargs") {
      while (rest.length && /^-/.test(plain(rest[0]))) {
        const flag = plain(rest.shift());
        if (/^-[ILnPsdE]$/.test(flag)) rest.shift();
      }
      args = rest;
      continue;
    }
    // Package runners: `npx vercel`, `npm exec vercel`, `pnpm dlx vercel`, `bunx vercel`.
    if (["npx", "bunx", "pnpx"].includes(name) || (["npm", "pnpm", "yarn", "bun"].includes(name) && ["exec", "x", "dlx"].includes(plain(rest[0] ?? "")))) {
      const after = ["npx", "bunx", "pnpx"].includes(name) ? rest : rest.slice(1);
      while (after.length && /^-/.test(plain(after[0]))) {
        const flag = plain(after.shift());
        if (["-p", "--package", "-c", "--call"].includes(flag)) after.shift();
        if (flag === "--") break;
      }
      const target = after[0] ? plain(after[0]).replace(/@[^/]*$/, "") : "";
      if (["vercel", "gh", "git"].includes(target)) {
        args = [target, ...after.slice(1)];
        continue;
      }
      return { program: name, args: rest };
    }
    return { program: name, args: rest };
  }
}

const block = (reason) => ({ blocked: true, reason });

function currentBranch(cwd) {
  try {
    return execFileSync("git", ["-C", cwd, "symbolic-ref", "--quiet", "--short", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function gitConfig(cwd, key) {
  try {
    return execFileSync("git", ["-C", cwd, "config", "--get", key], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const isMain = (ref) => ["main", "refs/heads/main", "heads/main"].includes(ref);

function checkGit(args, cwd) {
  let dir = cwd;
  let k = 0;
  // Git's own options come before the subcommand.
  while (k < args.length && /^-/.test(plain(args[k]))) {
    const flag = plain(args[k]);
    if (flag === "-C") dir = path.resolve(dir, plain(args[++k] ?? ""));
    else if (["-c", "--git-dir", "--work-tree", "--namespace", "--config-env"].includes(flag)) k++;
    k++;
  }
  const sub = plain(args[k] ?? "");
  if (sub !== "push") return { blocked: false };

  const rest = args.slice(k + 1);
  if (rest.some(isDynamic)) return block("git push with an argument built from a variable or command; the destination cannot be checked");

  const positional = [];
  for (let j = 0; j < rest.length; j++) {
    const arg = rest[j];
    if (arg === "--") {
      positional.push(...rest.slice(j + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const flag = arg.split("=")[0];
      if (["--force", "--force-with-lease", "--force-if-includes"].includes(flag)) return block(`git push ${flag} rewrites published history`);
      if (["--mirror", "--all", "--branches"].includes(flag)) return block(`git push ${flag} can push main`);
      if (["--delete", "--prune"].includes(flag)) return block(`git push ${flag} deletes branches on GitHub`);
      if (["--repo", "--push-option", "--receive-pack", "--exec"].includes(flag) && !arg.includes("=")) j++;
      continue;
    }
    if (arg.startsWith("-") && arg.length > 1) {
      const letters = arg.slice(1);
      if (letters.includes("f")) return block("git push -f rewrites published history");
      if (letters.includes("d")) return block("git push -d deletes branches on GitHub");
      if (letters.endsWith("o")) j++;
      continue;
    }
    positional.push(arg);
  }

  const refspecs = positional.slice(1);
  if (!refspecs.length) {
    const branch = currentBranch(dir);
    if (branch === null) return block("git push from a detached HEAD or outside a repository; name the branch to push");
    if (branch === "main") return block("git push from main; main only changes through a pull request");
    const mode = gitConfig(dir, "push.default") || "simple";
    if (mode === "matching") return block("git push with push.default=matching can push main; name the branch to push");
    if (["upstream", "tracking"].includes(mode) && isMain(gitConfig(dir, `branch.${branch}.merge`))) {
      return block(`git push from ${branch}, whose upstream is main; name the branch to push`);
    }
    return { blocked: false };
  }

  for (const spec of refspecs) {
    if (spec.startsWith("+")) return block(`git push ${spec}: a "+" refspec force-pushes`);
    const [source, destination] = spec.includes(":") ? spec.split(/:(.*)/s) : [spec, undefined];
    // "src:" with nothing after the colon pushes to the source's own name.
    let target = destination === undefined || destination === "" ? source : destination;
    if (target === "HEAD" || (destination === undefined && source === "HEAD")) target = currentBranch(dir) ?? "";
    if (target === "" && destination === undefined) return block("git push HEAD from a detached HEAD; name the branch to push");
    if (isMain(target)) return block(`git push ${spec} pushes to main; main only changes through a pull request`);
  }
  return { blocked: false };
}

function checkGh(args) {
  const rest = [...args];
  // gh's own flags can come first.
  const words = [];
  for (let j = 0; j < rest.length; j++) {
    const arg = plain(rest[j]);
    if (["-R", "--repo", "--hostname"].includes(arg)) {
      j++;
      continue;
    }
    words.push(arg);
  }
  const [group, action] = words;
  const has = (...flags) => words.some((word) => flags.some((flag) => word === flag || word.startsWith(`${flag}=`)));

  if (group === "pr" && action === "merge" && has("--admin")) {
    return block("gh pr merge --admin bypasses the required checks; a pull request that waits for the owner is merged by the owner");
  }

  if (group === "api") {
    const text = words.join(" ");
    let method = null;
    for (let j = 1; j < words.length; j++) {
      const word = words[j];
      if (word === "-X" || word === "--method") method = words[j + 1]?.toUpperCase() ?? null;
      else if (word.startsWith("--method=")) method = word.slice(9).toUpperCase();
      else if (/^-X[A-Za-z]+$/.test(word)) method = word.slice(2).toUpperCase();
    }
    const endpoint = words.slice(1).find((word, j, list) => !word.startsWith("-") && !/^(-X|--method|-f|-F|--field|--raw-field|-H|--header|--input|-q|--jq|-t|--template|--cache|--hostname|-p|--preview)$/.test(list[j - 1] ?? ""));
    const hasFields = has("-f", "-F", "--field", "--raw-field", "--input");
    if (endpoint === "graphql") {
      if (/\bmutation\b/.test(text) || has("--input")) return block("gh api graphql with a mutation changes GitHub; it needs the owner");
      return { blocked: false };
    }
    const effective = method ?? (hasFields ? "POST" : "GET");
    if (effective !== "GET") return block(`gh api ${effective} ${endpoint ?? ""} changes GitHub; it needs the owner`.trim());
    return { blocked: false };
  }

  if (group === "repo" && ["edit", "delete", "rename", "archive", "unarchive"].includes(action)) {
    return block(`gh repo ${action} changes the repository's settings; it needs the owner`);
  }
  if (group === "workflow" && action === "disable") return block("gh workflow disable turns a check off; it needs the owner");
  if ((group === "secret" || group === "variable") && ["set", "delete", "remove"].includes(action)) {
    return block(`gh ${group} ${action} changes what the workflows run with; it needs the owner`);
  }
  if (group === "auth" && action === "token") return block("gh auth token prints the owner's GitHub credential");
  return { blocked: false };
}

const vercelReadOnly = new Set(["ls", "list", "inspect", "logs", "whoami", "help", "--help", "-h", "--version", "-v"]);

function checkVercel(args) {
  const words = args.map(plain);
  let k = 0;
  while (k < words.length && words[k].startsWith("-") && !vercelReadOnly.has(words[k])) {
    const flag = words[k].split("=")[0];
    if (["--cwd", "--scope", "-S", "--token", "-t", "--global-config", "-Q", "--local-config", "-A", "--team", "-T"].includes(flag) && !words[k].includes("=")) k++;
    k++;
  }
  const sub = words[k];
  if (sub && vercelReadOnly.has(sub)) return { blocked: false };
  return block(
    sub
      ? `vercel ${sub} acts on the Vercel project; deployments only ever happen because Git changed`
      : "vercel with no subcommand deploys; deployments only ever happen because Git changed",
  );
}

/** The verdict for one Bash command line. */
export function inspect(command, cwd) {
  let commands;
  try {
    commands = parseCommands(command);
  } catch (error) {
    if (/\b(git|gh|vercel)\b/.test(command)) {
      return block(`the command could not be parsed (${error.message}), and it involves git, gh or vercel`);
    }
    return { blocked: false };
  }

  let dir = cwd;
  for (const argv of commands) {
    const { program, args } = unwrap(argv);
    // A `cd` moves every command after it in the same line.
    if (program === "cd" || program === "pushd") {
      const target = args.find((arg) => !plain(arg).startsWith("-"));
      if (target && !isDynamic(target)) dir = path.resolve(dir, plain(target).replace(/^~(?=\/|$)/, process.env.HOME ?? "~"));
      continue;
    }
    // `bash -c "…"`, `sh -c`, `zsh -c`, `eval …`: the text is a command too.
    if (["bash", "sh", "zsh", "dash"].includes(program)) {
      const at = args.findIndex((arg) => /^-[a-z]*c[a-z]*$/.test(plain(arg)));
      if (at >= 0 && args[at + 1] !== undefined) {
        const inner = inspect(plain(args[at + 1]), dir);
        if (inner.blocked) return inner;
      }
      continue;
    }
    if (program === "eval") {
      const inner = inspect(args.map(plain).join(" "), dir);
      if (inner.blocked) return inner;
      continue;
    }
    const verdict =
      program === "git" ? checkGit(args, dir) : program === "gh" ? checkGh(args) : program === "vercel" ? checkVercel(args) : { blocked: false };
    if (verdict.blocked) return verdict;
  }
  return { blocked: false };
}

/* --------------------------------------------------------------- the hook */

async function main() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  let event;
  try {
    event = JSON.parse(input);
  } catch {
    process.exit(0);
  }
  if (event.tool_name !== "Bash" || typeof event.tool_input?.command !== "string") process.exit(0);

  const command = event.tool_input.command;
  let verdict;
  try {
    verdict = inspect(command, event.cwd || process.cwd());
  } catch (error) {
    // A bug in this file must not open the door it guards.
    verdict = /\b(git|gh|vercel)\b/.test(command)
      ? block(`the guard failed (${error.message}) on a command that involves git, gh or vercel`)
      : { blocked: false };
  }
  if (verdict.blocked) {
    process.stderr.write(
      `Blocked by .claude/hooks/guard-commands.mjs: ${verdict.reason}.\n` +
        "This is the owner's to run (docs/AUTOMATION.md, \"Known limit\"). Ask them, or go through a pull request.\n",
    );
    process.exit(2);
  }
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("guard-commands.mjs")) {
  await main();
}
