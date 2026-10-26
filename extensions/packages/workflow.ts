import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { applyPresetDefault, workflowKeywordTriggerDisabled } from "./preset-defaults.ts";

export default async function workflowAdapter(pi: ExtensionAPI): Promise<void> {
  applyPresetDefault(workflowKeywordTriggerDisabled, process.cwd());

  const packageEntry = import.meta.resolve("@quintinshaw/pi-dynamic-workflows");
  const extensionUrl = new URL("../extensions/workflow.ts", packageEntry);
  const { default: registerWorkflow } = await import(extensionUrl.href);
  registerWorkflow(pi);
}
