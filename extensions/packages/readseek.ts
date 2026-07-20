import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerReadseek from "pi-readseek";
import { registerWithToolTransform } from "./tool-registration-transform.ts";

const READSEEK_GREP_PREFERENCE = "Prefer readSeek_grep over grep when both are available;";

export default function readseekAdapter(pi: ExtensionAPI): void {
  registerWithToolTransform(pi, registerReadseek, (tool) => {
    if (tool.name !== "readSeek_grep") return tool;
    return {
      ...tool,
      promptGuidelines: tool.promptGuidelines?.filter(
        (guideline) => !guideline.startsWith(READSEEK_GREP_PREFERENCE),
      ),
    };
  });
}
