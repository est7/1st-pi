# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-15

## PRIMARY MISSION

This repository is the source of the distributable **1st-pi preset**. Work performed here must improve the preset for its users.

- **Do not treat a local runtime setting as the implementation.** Editing `~/.pi/agent/settings.json`, `~/.pi/workflows/settings.json`, session state, or another machine-local file can be used to reproduce or verify behavior, but it does not complete a repository task.
- When a requested behavior should be a 1st-pi default, implement it in tracked preset source such as `package.json`, `extensions/`, `skills/`, `prompts/`, `themes/`, scripts, or documentation.
- Preset defaults should normally apply only when the user has not made an explicit choice. Preserve explicit user configuration unless the product requirement says otherwise.
- Verify both fresh-install behavior and preservation of existing user preferences where defaults or migrations are involved.

## OVERVIEW

Project: **1st-pi**

A Pi Package that bundles and distributes a curated coding-agent preset: TypeScript extensions, community-extension adapters, skills, prompt templates, and themes.

Stack:

- Node.js with ESM (`"type": "module"`)
- TypeScript Pi extensions loaded directly by Pi
- JavaScript resource-sync tooling
- npm package manifest and lockfile
- Markdown skills and documentation
- JSON Pi themes

There is currently no repository-level compiler, linter, formatter, or automated test suite. Validation is primarily syntax checks, resource drift checks, isolated Pi smoke tests, npm audit, and package dry-runs.

## STRUCTURE

- `package.json`: npm metadata, dependencies, and the authoritative `pi.extensions`, `pi.skills`, `pi.prompts`, and `pi.themes` inventory.
- `extensions/`: preset-owned Pi extensions and behavior defaults.
- `extensions/packages/`: thin adapters around community packages. Keep adapters small; do not copy upstream implementations.
- `skills/<name>/SKILL.md`: bundled skills. Some are synchronized from dependencies.
- `prompts/`: slash-command prompt templates.
- `themes/`: publishable theme resources synchronized from `pi-everforest-tui`.
- `scripts/sync-package-resources.mjs`: copies/checks dependency-owned static resources required in the tarball.
- `docs/`: audits and package-selection research.
- `README.md`: user-facing installation, defaults, ownership, commands, and release documentation.

## COMMANDS

| Action | Command |
|---|---|
| Install dependencies | `npm install` |
| Trial local preset | `pi --no-extensions -e .` |
| Trial a single extension | `pi --no-extensions -e ./extensions/path.ts` |
| Reload during interactive development | `/reload` |
| Synchronize vendored resources | `npm run sync:resources` |
| Check resource drift | `npm run check:resources` |
| Audit production dependencies | `npm audit --omit=dev` |
| Inspect package contents | `npm run pack:dry-run` |
| Check patch whitespace | `git diff --check` |
| Install local preset | `pi install .` |

No generic `npm test` or `npm run build` command currently exists. For behavioral changes, create a focused smoke test that exercises the observable path; startup-only validation is insufficient for persistence, UI, mutation, native, or network behavior.

## CODING STANDARDS

- Use ESM imports and explicit TypeScript types at Pi API boundaries.
- Prefer small functions and early returns.
- Preserve the style of the file being edited; existing preset-owned UI files commonly use tabs, while thin adapters commonly use two-space indentation.
- Keep community-package adapters thin and use public package exports where possible.
- Do not create duplicate owners for tools, renderers, editor surfaces, tasks, subagents, workflows, goals, context, or memory. Resolve ownership explicitly rather than relying on extension load order.
- Defaults must distinguish an unset preference from an explicit user choice. Do not overwrite persisted `true`/`false` values merely to enforce a fresh-install default.
- Update `README.md` whenever extension inventory, commands, defaults, ownership, persistence, or removal behavior changes.
- Never hand-edit synchronized resources without also updating their source/dependency workflow. Run `npm run check:resources` after dependency changes.
- Do not commit runtime artifacts such as `.pi/tasks/`, `.pi/npm/`, `.agents/`, `.orch/`, logs, tarballs, or `node_modules/`.

## CHANGE WORKFLOW

1. Identify whether the problem belongs to the preset, an upstream dependency, Pi core, or local runtime state.
2. If it belongs to the preset, change tracked repository files. A runtime-only workaround is not completion.
3. Preserve explicit user settings when introducing defaults.
4. Update README and relevant audits when public behavior or ownership changes.
5. Run the narrow behavioral smoke test plus the standard verification commands.
6. Inspect `git status` and the package dry-run to ensure the intended files—not local state—are shipped.

When changing extension dependencies or inventory, follow `skills/add-extension-to-1st-agent/SKILL.md`. Its release gate includes resource checks, audit, tarball inspection, local-source loading, hoisted-install validation, ownership checks, native coverage, and exercising the extension's risky path.

## WHERE TO LOOK

- Preset manifest and load order: `package.json`
- Preset-owned extension behavior: `extensions/`
- Community adapters: `extensions/packages/`
- Resource synchronization: `scripts/sync-package-resources.mjs`
- User-facing behavior and commands: `README.md`
- Dependency/inventory maintenance SOP: `skills/add-extension-to-1st-agent/SKILL.md`
- Package research and audits: `docs/`

## IMPORTANT CURRENT DEFAULTS

- FFF owns `find`, `grep`, and `@` autocomplete in `override` mode.
- Readseek can own `read`, `edit`, and `write`; `grep` remains with FFF.
- Pi built-ins retain `bash`, `ls`, and native rendering.
- Tasks, Subagents, Workflows, Goal, BTW, Context, and Memory retain their package-owned domain surfaces.
- The preset defaults Workflow keyword auto-triggering to **off** when unset. Slash commands remain available, and explicit user `on`/`off` choices must be preserved.
- Themes and the `pi-init`/`pi-web-access` skills are synchronized publishable resources; normal npm dependencies are not bundled into the preset tarball.
