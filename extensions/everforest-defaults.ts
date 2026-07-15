/**
 * 1st-pi defaults for the bundled pi-everforest-tui package.
 *
 * Standalone installs stay opt-in. Fresh 1st-pi sessions start with the full
 * Everforest TUI experience, while session-persisted user choices still win.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function everforestDefaults(pi: ExtensionAPI) {
	pi.events.emit("everforest-tui:defaults", {
		indicator: true,
		status: true,
		footer: true,
		rainbow: true,
	});
}
