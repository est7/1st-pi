// Preset smoke test: loads 1st-pi through the Pi SDK in isolated agent dirs,
// without network or model calls.
//
//   npm run smoke                  run every scenario
//   npm run smoke -- --update      also rewrite scripts/smoke-surface.json
//
// Each scenario runs in its own child process because several packages cache
// config paths at module scope.
import { spawnSync, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const surfacePath = join(root, "scripts/smoke-surface.json");
const readseekOverride = { readseek: { overrideTools: ["read", "edit", "write"] } };

const writeJson = (path, value) => {
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const readJsonIfExists = (path) => (existsSync(path) ? readJson(path) : {});

async function openSession(cwd) {
  const sdk = await import(pathToFileURL(join(root, "node_modules/@earendil-works/pi-coding-agent/dist/index.js")).href);
  const agentDir = sdk.getAgentDir();
  const eventBus = sdk.createEventBus();
  const settingsManager = sdk.SettingsManager.create(cwd, agentDir);
  const resourceLoader = new sdk.DefaultResourceLoader({
    cwd, agentDir, settingsManager, eventBus, noExtensions: true, additionalExtensionPaths: [root],
  });
  await resourceLoader.reload();
  const { session } = await sdk.createAgentSession({
    cwd, agentDir, settingsManager, resourceLoader, sessionManager: sdk.SessionManager.inMemory(),
  });
  await session.bindExtensions({});
  return { session, eventBus, agentDir, extensions: resourceLoader.getExtensions() };
}

const text = (result) => result.content.filter((c) => c.type === "text").map((c) => c.text).join("\n");

/** Scenario bodies run inside the child process and return a list of failures. */
const scenarios = {
  async fresh({ cwd }) {
    const failures = [];
    const { session, eventBus, agentDir, extensions } = await openSession(cwd);
    const expectedExtensions = readJson(join(root, "package.json")).pi.extensions.map((p) => resolve(root, p));
    const loaded = extensions.extensions.map((e) => e.path);
    if (extensions.errors.length > 0) failures.push(`extension errors: ${JSON.stringify(extensions.errors)}`);
    if (JSON.stringify(loaded) !== JSON.stringify(expectedExtensions)) failures.push(`loaded extensions differ from package.json: ${JSON.stringify(loaded)}`);

    const tools = session.getAllTools();
    const names = tools.map((t) => t.name);
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    if (duplicates.length > 0) failures.push(`duplicate tool owners: ${duplicates.join(", ")}`);
    const owner = (name) => tools.find((t) => t.name === name)?.sourceInfo?.path?.replace(`${root}/`, "") ?? "missing";
    const expectedOwners = {
      read: "extensions/packages/readseek.ts", edit: "extensions/packages/readseek.ts", write: "extensions/packages/readseek.ts",
      grep: "extensions/packages/fff.ts", find: "extensions/packages/fff.ts", bash: "builtin:bash", ls: "builtin:ls",
    };
    for (const [name, expected] of Object.entries(expectedOwners)) {
      if (owner(name) !== expected) failures.push(`${name} owned by ${owner(name)}, expected ${expected}`);
    }

    const subagents = readJsonIfExists(join(agentDir, "subagents.json"));
    if (subagents.workflowsEnabled !== false) failures.push(`fresh subagents.json workflowsEnabled=${subagents.workflowsEnabled}, expected false`);
    const workflows = readJsonIfExists(join(agentDir, "workflows/settings.json"));
    if (workflows.keywordTriggerEnabled !== false) failures.push(`fresh workflow keywordTriggerEnabled=${workflows.keywordTriggerEnabled}, expected false`);

    const ping = await new Promise((done) => {
      const timer = setTimeout(() => done(undefined), 5000);
      eventBus.on("subagents:rpc:ping:reply:smoke", (reply) => { clearTimeout(timer); done(reply); });
      eventBus.emit("subagents:rpc:ping", { requestId: "smoke" });
    });
    if (ping?.data?.version !== 2) failures.push(`subagents RPC ping returned ${JSON.stringify(ping)}, pi-tasks expects protocol 2`);

    const commands = session.extensionRunner.getRegisteredCommands().map((c) => c.name).sort();
    return { failures, surface: { tools: [...names].sort(), activeTools: session.getActiveToolNames().sort(), commands } };
  },

  async preserve({ cwd }) {
    const { agentDir } = await openSession(cwd);
    const failures = [];
    const subagents = readJsonIfExists(join(agentDir, "subagents.json"));
    if (subagents.workflowsEnabled !== true || subagents.keep !== "me") failures.push(`explicit subagents.json changed: ${JSON.stringify(subagents)}`);
    const workflows = readJsonIfExists(join(agentDir, "workflows/settings.json"));
    if (workflows.keywordTriggerEnabled !== true) failures.push(`explicit workflow keywordTriggerEnabled changed: ${JSON.stringify(workflows)}`);
    return { failures };
  },

  async readseek({ cwd }) {
    const { readseekDylibWarning } = await import(pathToFileURL(join(root, "extensions/packages/readseek-dylibs.ts")).href);
    const warning = readseekDylibWarning();
    if (warning) return { failures: [warning] };
    const { session } = await openSession(cwd);
    const tool = (name) => session.state.tools.find((t) => t.name === name);
    const file = join(cwd, "sample.ts");
    writeFileSync(file, "export function greet(name: string) {\n  return `hello ${name}`;\n}\n");
    const shown = text(await tool("read").execute("r1", { path: file }));
    const anchor = shown.match(/(\d+:[0-9a-zA-Z]+)\s*\|\s*return/)?.[1];
    if (!anchor) return { failures: [`read returned no LINE:HASH anchor: ${shown.slice(0, 300)}`] };
    await tool("edit").execute("e1", { path: file, edits: [{ set_line: { anchor, new_text: "  return `hi ${name}`;" } }] });
    const failures = [];
    if (!readFileSync(file, "utf8").includes("return `hi ${name}`;")) failures.push(`anchored edit did not apply: ${readFileSync(file, "utf8")}`);
    const target = join(cwd, "written.txt");
    await tool("write").execute("w1", { path: target, content: "written\n" });
    if (readFileSync(target, "utf8") !== "written\n") failures.push("write did not create the expected file");
    return { failures };
  },

  async dylibs() {
    const failures = [];
    if (process.platform !== "darwin") return { failures, skipped: "not macOS" };
    const m = await import(pathToFileURL(join(root, "extensions/packages/readseek-dylibs.ts")).href);
    const otool = (path) => execFileSync("otool", ["-L", path], { encoding: "utf8" })
      .split("\n").slice(1).map((l) => l.trim().split(" (")[0]).filter((l) => l && !l.endsWith(":"));
    const hasOtool = spawnSync("otool", ["--version"]).error === undefined;
    const binary = m.resolveReadseekBinary();
    if (!binary || !existsSync(binary)) return { failures: [`readseek binary not resolved: ${binary}`] };
    const linked = m.machODylibs(m.readMachOLoadCommands(binary));
    if (linked.length === 0) failures.push("no dylibs parsed from readseek binary");
    if (hasOtool) {
      if (JSON.stringify(linked) !== JSON.stringify(otool(binary))) failures.push("readseek dylibs differ from otool -L");
      if (JSON.stringify(m.machODylibs(m.readMachOLoadCommands("/bin/ls"))) !== JSON.stringify(otool("/bin/ls"))) failures.push("universal /bin/ls dylibs differ from otool -L");
    }
    const gone = new Set(linked.filter((l) => l.startsWith("/opt/homebrew/opt/")).slice(0, 2));
    const missing = m.missingDylibs(linked, (p) => !gone.has(p));
    if (JSON.stringify([...new Set(missing)]) !== JSON.stringify([...gone])) failures.push(`missingDylibs returned ${JSON.stringify(missing)}`);
    const formulas = [...new Set([...gone].map((p) => p.split("/")[4]))].join(" ");
    if (!m.missingDylibsMessage(missing).includes(`brew install ${formulas}`)) failures.push("warning lacks the brew install command");
    if (m.missingDylibs(["/usr/lib/libSystem.B.dylib", "/System/Library/X", "@rpath/x.dylib"], () => false).length > 0) failures.push("system or @rpath dylibs reported missing");
    return { failures };
  },
};

const setups = {
  fresh: (agentDir) => writeJson(join(agentDir, "settings.json"), readseekOverride),
  preserve: (agentDir) => {
    writeJson(join(agentDir, "subagents.json"), { workflowsEnabled: true, keep: "me" });
    writeJson(join(agentDir, "workflows/settings.json"), { keywordTriggerEnabled: true });
  },
  readseek: (agentDir) => writeJson(join(agentDir, "settings.json"), readseekOverride),
  dylibs: () => {},
};

const child = process.argv.find((a) => a.startsWith("--scenario="))?.slice("--scenario=".length);
if (child) {
  const result = await scenarios[child]({ cwd: process.cwd() });
  process.stdout.write(`\n@@SMOKE@@${JSON.stringify(result)}\n`);
  process.exit(0);
}

const update = process.argv.includes("--update");
const scratch = mkdtempSync(join(tmpdir(), "1st-pi-smoke-"));
let failed = false;
try {
  for (const name of Object.keys(scenarios)) {
    const agentDir = join(scratch, name, "agent");
    const cwd = join(scratch, name, "project");
    mkdirSync(agentDir, { recursive: true });
    mkdirSync(cwd, { recursive: true });
    setups[name](agentDir);
    const run = spawnSync(process.execPath, [import.meta.filename, `--scenario=${name}`], {
      cwd,
      encoding: "utf8",
      env: { ...process.env, PI_CODING_AGENT_DIR: agentDir, PI_OFFLINE: "1" },
      timeout: 180_000,
    });
    const marker = run.stdout?.split("\n").find((l) => l.startsWith("@@SMOKE@@"));
    const result = marker ? JSON.parse(marker.slice("@@SMOKE@@".length)) : { failures: [`scenario crashed (exit ${run.status}): ${(run.stderr || run.error?.message || "").slice(-1500)}`] };

    if (result.surface) {
      if (update || !existsSync(surfacePath)) {
        writeJson(surfacePath, result.surface);
        console.log(`  updated ${surfacePath.replace(`${root}/`, "")}`);
      } else {
        const expected = readJson(surfacePath);
        for (const key of Object.keys(result.surface)) {
          const added = result.surface[key].filter((x) => !expected[key]?.includes(x));
          const removed = (expected[key] ?? []).filter((x) => !result.surface[key].includes(x));
          if (added.length || removed.length) result.failures.push(`${key} surface changed (+${added.join(",")} -${removed.join(",")}); review, then rerun with --update`);
        }
      }
    }

    const status = result.skipped ? `skip (${result.skipped})` : result.failures.length ? "FAIL" : "ok";
    console.log(`${status.padEnd(6)} ${name}`);
    for (const failure of result.failures) console.log(`       - ${failure}`);
    failed ||= result.failures.length > 0;
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
