import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { loadConfig as loadFffConfig } from "@ff-labs/pi-fff/src/config.ts";
import { loadWorkflowSettings, saveWorkflowSettings } from "@quintinshaw/pi-dynamic-workflows";
import { loadSettings as loadSubagentsSettings } from "@tintinweb/pi-subagents/src/settings.ts";

/**
 * A preset default persisted into the owning package's own global settings.
 *
 * Invariant: the default is written only while the user's effective setting is
 * unset; any explicit value (global, project, or environment) wins and is never
 * overwritten. Persisting, rather than patching package internals at runtime,
 * keeps every package's own precedence rules and diagnostics truthful.
 */
export interface PersistedPresetDefault<T = unknown> {
  /** `<package>.<key>`, used by smoke tests and diagnostics. */
  id: string;
  value: T;
  /** The user's explicit effective value, or undefined when unset. May throw on unreadable user files. */
  read(cwd: string): T | undefined;
  /** Persists `value` globally; returns false to leave the user's files untouched. */
  write(value: T): boolean;
}

type JsonObject = Record<string, unknown>;

/** Returns {} for a missing file and undefined for an unreadable or non-object file. */
function readJsonObject(path: string): JsonObject | undefined {
  if (!existsSync(path)) return {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf-8").replace(/^\uFEFF/, ""));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    return parsed as JsonObject;
  } catch {
    return undefined;
  }
}

/** Shallow-merges `patch` into a JSON object file; malformed files stay untouched. */
function mergeJsonObject(path: string, patch: (current: JsonObject) => JsonObject): boolean {
  const current = readJsonObject(path);
  if (!current) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(patch(current), null, 2)}\n`, "utf-8");
  return true;
}

/**
 * 1st-pi ships `@quintinshaw/pi-dynamic-workflows` as the sole `workflow`
 * owner. When unset, pi-subagents auto-detects that tool, stands down, and
 * warns on every startup (tintinweb/pi-subagents#283).
 */
export const subagentsWorkflowsDisabled: PersistedPresetDefault<boolean> = {
  id: "subagents.workflowsEnabled",
  value: false,
  read: (cwd) => {
    const value = loadSubagentsSettings(cwd).workflowsEnabled;
    return typeof value === "boolean" ? value : undefined;
  },
  write: (value) =>
    mergeJsonObject(join(getAgentDir(), "subagents.json"), (current) => ({ ...current, workflowsEnabled: value })),
};

/** Workflow keyword auto-triggering is opt-in; slash commands stay available. */
export const workflowKeywordTriggerDisabled: PersistedPresetDefault<boolean> = {
  id: "workflows.keywordTriggerEnabled",
  value: false,
  read: (cwd) => loadWorkflowSettings({ cwd }).keywordTriggerEnabled,
  write: (value) => {
    saveWorkflowSettings({ keywordTriggerEnabled: value });
    return true;
  },
};

/**
 * FFF takes over `find`/`grep` and `@` autocomplete. FFF resolves its mode as
 * `--fff-mode` > `PI_FFF_MODE` > `pi-fff.json`, so persisting into pi-fff.json
 * keeps the flag and environment variable above the preset default.
 */
export const fffOverrideMode: PersistedPresetDefault<string> = {
  id: "fff.mode",
  value: "override",
  // loadFffConfig throws on an invalid pi-fff.json; the preset then leaves it alone.
  read: () => process.env.PI_FFF_MODE || loadFffConfig().mode,
  write: (value) => mergeJsonObject(join(getAgentDir(), "pi-fff.json"), (current) => ({ ...current, mode: value })),
};

const READSEEK_TOOLS = ["read", "edit", "write"];

/**
 * pi-readseek reads `readseek.overrideTools` from `~/.pi/agent/settings.json`
 * (fixed to the home directory, independent of PI_CODING_AGENT_DIR) and the
 * project's `.pi/settings.json`. An explicit array, including `[]`, is a choice.
 */
function readseekOverrideTools(settingsPath: string): string[] | undefined {
  const section = readJsonObject(settingsPath)?.readseek;
  if (!section || typeof section !== "object" || Array.isArray(section)) return undefined;
  const tools = (section as JsonObject).overrideTools;
  return Array.isArray(tools) ? (tools as string[]) : undefined;
}

export const readseekOverrideToolsDefault: PersistedPresetDefault<string[]> = {
  id: "readseek.overrideTools",
  value: READSEEK_TOOLS,
  read: (cwd) =>
    readseekOverrideTools(join(cwd, ".pi", "settings.json")) ??
    readseekOverrideTools(join(homedir(), ".pi", "agent", "settings.json")),
  write: (value) =>
    mergeJsonObject(join(homedir(), ".pi", "agent", "settings.json"), (current) => {
      const section = current.readseek && typeof current.readseek === "object" && !Array.isArray(current.readseek)
        ? (current.readseek as JsonObject)
        : {};
      return { ...current, readseek: { ...section, overrideTools: value } };
    }),
};

/** Every persisted preset default; smoke derives its fresh and preserve cases from this list. */
export const PERSISTED_PRESET_DEFAULTS: readonly PersistedPresetDefault[] = [
  subagentsWorkflowsDisabled,
  workflowKeywordTriggerDisabled,
  fffOverrideMode,
  readseekOverrideToolsDefault,
];

/** Applies `preset` unless the user already chose. Read and write failures are non-fatal. */
export function applyPresetDefault<T>(preset: PersistedPresetDefault<T>, cwd: string): void {
  try {
    if (preset.read(cwd) !== undefined) return;
    preset.write(preset.value);
  } catch {
    // The owning package keeps its own default and reports its own config errors;
    // the preset never blocks startup.
  }
}
