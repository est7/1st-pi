import registerSubagents from "@tintinweb/pi-subagents/src/index.ts";
import { applyPresetDefault, subagentsWorkflowsDisabled } from "./preset-defaults.ts";

export default function subagentsAdapter(...args: Parameters<typeof registerSubagents>): ReturnType<typeof registerSubagents> {
  applyPresetDefault(subagentsWorkflowsDisabled, process.cwd());
  return registerSubagents(...args);
}
