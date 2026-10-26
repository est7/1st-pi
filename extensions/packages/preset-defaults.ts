import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { loadWorkflowSettings, saveWorkflowSettings } from "@quintinshaw/pi-dynamic-workflows";
import { loadSettings as loadSubagentsSettings } from "@tintinweb/pi-subagents/src/settings.ts";

/**
 * A preset default persisted into a package's own global settings file.
 *
 * Invariant: the default is written only while the merged (global + project)
 * setting is unset; any explicit user value, including one in a project file,
 * wins and is never overwritten.
 */
export interface PersistedPresetDefault {
  /** `<package>.<key>`, used by smoke tests and diagnostics. */
  id: string;
  value: boolean;
  /** Merged effective value, or undefined when the user has not chosen. */
  read(cwd: string): boolean | undefined;
  /** Persist `value` globally; return false to leave the user's files untouched. */
  write(value: boolean): boolean;
}

type RawSettings = Record<string, unknown>;

function readJsonObject(path: string): RawSettings | undefined {
  if (!existsSync(path)) return {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf-8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    return parsed as RawSettings;
  } catch {
    return undefined;
  }
}

/**
 * 1st-pi ships `@quintinshaw/pi-dynamic-workflows` as the sole `workflow`
 * owner. When unset, pi-subagents auto-detects that tool, stands down, and
 * warns on every startup (tintinweb/pi-subagents#283).
 */
export const subagentsWorkflowsDisabled: PersistedPresetDefault = {
  id: "subagents.workflowsEnabled",
  value: false,
  read: (cwd) => {
    const value = loadSubagentsSettings(cwd).workflowsEnabled;
    return typeof value === "boolean" ? value : undefined;
  },
  write: (value) => {
    const path = join(getAgentDir(), "subagents.json");
    // Malformed user files stay untouched; pi-subagents reports them itself.
    const settings = readJsonObject(path);
    if (!settings) return false;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify({ ...settings, workflowsEnabled: value }, null, 2)}\n`, "utf-8");
    return true;
  },
};

/** Workflow keyword auto-triggering is opt-in; slash commands stay available. */
export const workflowKeywordTriggerDisabled: PersistedPresetDefault = {
  id: "workflows.keywordTriggerEnabled",
  value: false,
  read: (cwd) => loadWorkflowSettings({ cwd }).keywordTriggerEnabled,
  write: (value) => {
    saveWorkflowSettings({ keywordTriggerEnabled: value });
    return true;
  },
};

export const PERSISTED_PRESET_DEFAULTS: readonly PersistedPresetDefault[] = [
  subagentsWorkflowsDisabled,
  workflowKeywordTriggerDisabled,
];

/** Applies `preset` unless the user already chose. Write failures are non-fatal. */
export function applyPresetDefault(preset: PersistedPresetDefault, cwd: string): void {
  if (preset.read(cwd) !== undefined) return;
  try {
    preset.write(preset.value);
  } catch {
    // The owning package falls back to its own default; the preset never blocks startup.
  }
}
