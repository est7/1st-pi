---
name: add-extension-to-1st-agent
description: Add, update, trial, or remove a community Pi extension in the 1st-pi preset without creating duplicate owners, bloating the tarball, breaking hoisted npm installs, or drifting the README. Use whenever changing 1st-pi package dependencies or extension inventory.
---

# Add an extension to 1st-pi

Follow this SOP; do not add a package from its README alone.

## 1. Gate the candidate

Check the published package and primary source:

- npm version, license, repository, engines, peer dependencies, install scripts
- upstream Pi/Node compatibility and native platform coverage
- maintenance and release recency
- tool, command, editor, footer, renderer, persistence, and domain ownership overlap

Reject duplicate owners unless the user explicitly chooses which existing owner to remove or disable.

## 2. Install as a normal dependency

```bash
npm install <package>@<version>
```

Do **not** add `bundledDependencies`. npm installs runtime dependencies; bundling their transitive graph bloats the preset.

## 3. Add a thin adapter

Create `extensions/packages/<name>.ts`:

```ts
export { default } from "<package-or-exported-subpath>";
```

Reference that local adapter explicitly in `package.json#pi.extensions`. Keep owner-sensitive ordering explicit. If package exports block its extension subpath, resolve its public entry and use the smallest documented dynamic adapter; do not copy the package implementation.

Static skills/themes needed by Pi must live inside this package. Add them to `scripts/sync-package-resources.mjs` so `npm run check:resources` prevents dependency drift.

## 4. Resolve ownership before testing

For every built-in or shared surface, record one owner only:

- tool names such as `read`, `edit`, `write`, `find`, `grep`
- tool/diff renderers
- editor factory, footer, status, and overlays
- memory, tasks, subagents, workflows, goals, and context analysis

Never rely on load order to hide a registration conflict. Remove, disable, or configure the losing owner deliberately.

## 5. Keep documentation synchronized

Update `README.md` in the same change:

- dependency inventory and purpose
- defaults and commands/tools
- ownership and overlap decisions
- native, license, fuzzy/stale, telemetry, or external-process caveats
- removal instructions when configuration persists outside the package

Update relevant audits when a prior recommendation or ownership baseline changed.

## 6. Verify both layouts

Run:

```bash
npm run check:resources
npm audit --omit=dev
npm pack --dry-run --json
git diff --check
```

Then verify:

1. local source: `pi --no-extensions -e .`
2. packed tarball installed into a fresh npm project with dependencies hoisted beside `1st-pi`
3. Pi loading the installed `node_modules/1st-pi`
4. no extension/tool/command conflicts
5. native binary availability on the current platform
6. package size remains within the small preset budget
7. `/reload` and the candidate's primary command/tool path

A startup-only test is insufficient for mutating, native, persistence, or network behavior; exercise its risky path in a disposable fixture.

## 7. Finish or revert

If verification passes, commit dependency, lockfile, adapter, resources, tests, and README together. If it fails, remove the package and adapter completely; do not leave disabled or undocumented inventory behind.
