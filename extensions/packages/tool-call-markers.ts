import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerToolCallMarkers from "@pi-kaush/pi-tool-call-markers";

export default async function toolCallMarkersAdapter(pi: ExtensionAPI): Promise<void> {
  // The package exports only its main entry; resolve its bundled second entry
  // relative to that public export so hoisted npm installs work too.
  const packageEntry = import.meta.resolve("@pi-kaush/pi-tool-call-markers");
  const thinkingEntry = new URL("./thinking-block-merger.ts", packageEntry);
  const { default: registerThinkingBlockMerger } = await import(thinkingEntry.href);
  registerToolCallMarkers(pi);
  registerThinkingBlockMerger(pi);
}
