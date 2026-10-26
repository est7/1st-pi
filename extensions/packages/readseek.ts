import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerReadseek from "pi-readseek";
import { readseekDylibWarning } from "./readseek-dylibs.ts";
import { registerWithToolTransform } from "./tool-registration-transform.ts";

const READSEEK_GREP_PREFERENCE = "Prefer readSeek_grep over grep when both are available;";

export default function readseekAdapter(pi: ExtensionAPI): void {
  // The macOS binary links Homebrew dylibs it does not ship; surface the exact
  // brew command up front instead of a dyld crash on the first read.
  const dylibWarning = readseekDylibWarning();
  if (dylibWarning) {
    pi.on("session_start", async (_event, ctx) => {
      if (ctx.hasUI) ctx.ui.notify(dylibWarning, "warning");
      else console.warn(dylibWarning);
    });
  }

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
