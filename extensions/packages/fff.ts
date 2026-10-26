import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { loadConfig } from "@ff-labs/pi-fff/src/config.ts";
import registerFff from "@ff-labs/pi-fff/src/index.ts";

const PRESET_MODE = "override";

// FFF resolves its mode at session start as flag > env > pi-fff.json > fallback.
// The preset default fills only the fallback slot, so every explicit choice wins.
function withPresetModeDefault(pi: ExtensionAPI): void {
  const getFlag = pi.getFlag.bind(pi);
  pi.getFlag = ((name: string) => {
    const value = getFlag(name);
    if (name !== "fff-mode" || value !== undefined) return value;
    if (process.env.PI_FFF_MODE || loadConfig().mode) return value;
    return PRESET_MODE;
  }) as ExtensionAPI["getFlag"];
}

export default function fffAdapter(pi: ExtensionAPI): void {
  withPresetModeDefault(pi);
  registerFff(pi);
}
