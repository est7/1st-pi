import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerReadseek from "pi-readseek";
import { diagnoseReadseekDylibs } from "./readseek-dylibs.ts";

type RegisteredTool = Parameters<ExtensionAPI["registerTool"]>[0];

// FFF owns `grep`; readseek's "Prefer readSeek_grep over grep" guideline would
// contradict that. smoke asserts the guideline stays absent.
const GREP_PREFERENCE = /^Prefer readSeek_grep over grep\b/;

function withoutGrepPreference(tool: RegisteredTool): RegisteredTool {
  if (tool.name !== "readSeek_grep" || !tool.promptGuidelines) return tool;
  return { ...tool, promptGuidelines: tool.promptGuidelines.filter((g) => !GREP_PREFERENCE.test(g)) };
}

export default function readseekAdapter(pi: ExtensionAPI): void {
  // The macOS binary links Homebrew dylibs it does not ship; surface the exact
  // brew command up front instead of a dyld crash on the first read.
  const warning = diagnoseReadseekDylibs()?.warning;
  if (warning) {
    pi.on("session_start", async (_event, ctx) => {
      if (ctx.hasUI) ctx.ui.notify(warning, "warning");
      else console.warn(warning);
    });
  }

  // A proxy (not a temporary pi.registerTool swap) also intercepts tools registered later.
  registerReadseek(
    new Proxy(pi, {
      get: (target, key, receiver) =>
        key === "registerTool"
          ? (tool: RegisteredTool) => target.registerTool(withoutGrepPreference(tool))
          : Reflect.get(target, key, receiver),
    }),
  );
}
