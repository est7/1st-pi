import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  loadWorkflowSettings,
  saveWorkflowSettingsForCwd,
} from "@quintinshaw/pi-dynamic-workflows";

export function applyWorkflowPresetDefaults(cwd: string): void {
  const settings = loadWorkflowSettings({ cwd });
  if (settings.keywordTriggerEnabled === undefined) {
    saveWorkflowSettingsForCwd({ keywordTriggerEnabled: false }, cwd);
  }
}

export default async function workflowAdapter(pi: ExtensionAPI): Promise<void> {
  applyWorkflowPresetDefaults(process.cwd());

  const packageEntry = import.meta.resolve("@quintinshaw/pi-dynamic-workflows");
  const extensionUrl = new URL("../extensions/workflow.ts", packageEntry);
  const { default: registerWorkflow } = await import(extensionUrl.href);
  registerWorkflow(pi);
}
