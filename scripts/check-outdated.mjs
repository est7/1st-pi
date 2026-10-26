// Fails when a dependency has a newer release than package.json allows, or when
// the lockfile lags behind its declared range. A caret range on a 0.x version
// (for example ^0.20.0) never admits 0.21.0, so npm install alone stays silent.
//
//   npm run check:outdated
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const declared = { ...manifest.dependencies, ...manifest.peerDependencies };

// npm outdated exits 1 whenever something is outdated; only its JSON matters.
const run = spawnSync("npm", ["outdated", "--json"], { cwd: root, encoding: "utf8" });
if (run.error || (run.status !== 0 && run.status !== 1)) {
  console.error(run.error?.message ?? run.stderr);
  process.exit(2);
}
const outdated = JSON.parse(run.stdout || "{}");

const blocked = [];
const stale = [];
for (const [name, info] of Object.entries(outdated)) {
  if (!(name in declared)) continue;
  if (info.wanted !== info.latest) blocked.push(`${name}: ${declared[name]} excludes latest ${info.latest} (installed ${info.current ?? "none"})`);
  else if (info.current !== info.wanted) stale.push(`${name}: lockfile has ${info.current ?? "none"}, range allows ${info.wanted}`);
}

if (blocked.length === 0 && stale.length === 0) {
  console.log("All dependencies are at their latest release.");
  process.exit(0);
}
if (blocked.length > 0) {
  console.log("Range excludes the latest release (raise the range, then verify):");
  for (const line of blocked) console.log(`  ${line}`);
}
if (stale.length > 0) {
  console.log("Lockfile behind the declared range (npm update):");
  for (const line of stale) console.log(`  ${line}`);
}
process.exit(1);
