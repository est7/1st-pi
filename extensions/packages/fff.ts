import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerFff from "@ff-labs/pi-fff/src/index.ts";
import { applyPresetDefault, fffOverrideMode } from "./preset-defaults.ts";

export default function fffAdapter(pi: ExtensionAPI): void {
  // FFF reads pi-fff.json when its extension function runs, so persist first.
  applyPresetDefault(fffOverrideMode, process.cwd());
  registerFff(pi);
}
