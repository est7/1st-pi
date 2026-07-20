import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type RegisteredTool = Parameters<ExtensionAPI["registerTool"]>[0];

export function registerWithToolTransform(
  pi: ExtensionAPI,
  register: (api: ExtensionAPI) => void,
  transform: (tool: RegisteredTool) => RegisteredTool,
): void {
  const originalRegisterTool = pi.registerTool;
  pi.registerTool = ((tool: RegisteredTool) => {
    originalRegisterTool.call(pi, transform(tool));
  }) as ExtensionAPI["registerTool"];

  try {
    register(pi);
  } finally {
    pi.registerTool = originalRegisterTool;
  }
}
