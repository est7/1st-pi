import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { loadSettings } from "@tintinweb/pi-subagents/src/settings.ts";
import registerSubagents from "@tintinweb/pi-subagents/src/index.ts";

type RawSettings = Record<string, unknown>;

function readGlobalSettings(path: string): RawSettings | undefined {
  if (!existsSync(path)) return {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf-8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    return parsed as RawSettings;
  } catch {
    // Leave malformed user files untouched; pi-subagents reports them itself.
    return undefined;
  }
}

/**
 * 1st-pi ships `@quintinshaw/pi-dynamic-workflows` as the sole `workflow`
 * owner. When `workflowsEnabled` is unset, pi-subagents auto-detects that tool,
 * stands down, and warns on every startup (tintinweb/pi-subagents#283). Pin the
 * same outcome globally so the warning disappears, but only when neither the
 * global nor the project settings already contain an explicit choice.
 */
export function applySubagentsPresetDefaults(cwd: string): void {
  if (typeof loadSettings(cwd).workflowsEnabled === "boolean") return;

  const path = join(getAgentDir(), "subagents.json");
  const settings = readGlobalSettings(path);
  if (!settings) return;

  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify({ ...settings, workflowsEnabled: false }, null, 2)}\n`, "utf-8");
  } catch {
    // Non-fatal: pi-subagents still stands down automatically, just with a warning.
  }
}

export default function subagentsAdapter(...args: Parameters<typeof registerSubagents>): ReturnType<typeof registerSubagents> {
  applySubagentsPresetDefaults(process.cwd());
  return registerSubagents(...args);
}
