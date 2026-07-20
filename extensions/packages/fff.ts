import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerFff from "@ff-labs/pi-fff/src/index.ts";
import { registerWithToolTransform } from "./tool-registration-transform.ts";

export default function fffAdapter(pi: ExtensionAPI): void {
  const configuredMode = process.env.PI_FFF_MODE;
  if (!configuredMode) process.env.PI_FFF_MODE = "override";
  try {
    registerWithToolTransform(pi, registerFff, (tool) => ({
      ...tool,
      promptGuidelines: tool.promptGuidelines?.map(
        (guideline) => `${tool.name}: ${guideline}`,
      ),
    }));
  } finally {
    if (!configuredMode) delete process.env.PI_FFF_MODE;
  }
}
