import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const resources = [
  ["node_modules/pi-everforest-tui/themes/everforest-tui-dark.json", "themes/everforest-tui-dark.json"],
  ["node_modules/pi-everforest-tui/themes/everforest-tui-light.json", "themes/everforest-tui-light.json"],
  ["node_modules/pi-init/skills/init/SKILL.md", "skills/init/SKILL.md"],
];

const check = process.argv.includes("--check");
const drifted = [];
for (const [sourceName, targetName] of resources) {
  const source = await readFile(resolve(root, sourceName));
  const targetPath = resolve(root, targetName);
  if (check) {
    const target = await readFile(targetPath).catch(() => undefined);
    if (!target?.equals(source)) drifted.push(targetName);
    continue;
  }
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, source);
  console.log(`synced ${targetName}`);
}

if (drifted.length > 0) {
  console.error(`Vendored Pi resources are stale: ${drifted.join(", ")}`);
  console.error("Run npm run sync:resources after updating dependencies.");
  process.exit(1);
}
