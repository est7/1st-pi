import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default async function workflowAdapter(pi: ExtensionAPI): Promise<void> {
  const packageEntry = import.meta.resolve("@quintinshaw/pi-dynamic-workflows");
  const extensionUrl = new URL("../extensions/workflow.ts", packageEntry);
  const { default: registerWorkflow } = await import(extensionUrl.href);
  registerWorkflow(pi);
}
