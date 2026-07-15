# Oh My Pi adoption audit

Date: 2026-07-15

> **Post-audit update:** The current preset now uses Readseek for `read/edit/write` and FFF for `find/grep`; `pi-tool-display` was removed to maintain one built-in tool owner. The Oh My Pi package conclusions remain unchanged.

## Decision

Do not add any Oh My Pi package to `1st-pi` or `pi-everforest-tui` now.
There is no class A candidate in the reviewed set.

Three ideas are worth controlled, attributed class B experiments without
importing the fork runtime:

1. a Node-compatible, opt-in hash-anchored editing prototype derived from
   Hashline's complete safety model;
2. a read-only local observability adapter derived from `omp-stats`' metric and
   tolerant-ingestion design, but targeting upstream Pi session records;
3. a provider-aware context-retention evaluation harness derived from
   Snapcompact's research method, used to evaluate the already-selected
   `pi-observational-memory` and upstream compaction.

Monitor model-identity test cases, AST/syntax summaries, and copy-on-write task
isolation. They belong in upstream Pi or an existing domain owner if concrete
failures justify them; they do not justify a second model catalog, search
stack, task runtime, or TUI.

## Scope and evidence standard

This audit treats popularity only as discovery. Conclusions are based on:

- Oh My Pi source snapshot
  [`2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e`](https://github.com/can1357/oh-my-pi/commit/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e);
- official package manifests, source, docs, license, GitHub releases, npm
  registry metadata, and crates.io searches;
- upstream `@earendil-works/pi-*` v0.80.6 source snapshot
  [`2b3fda9921b5590f285165287bd442a25817f17b`](https://github.com/earendil-works/pi/tree/2b3fda9921b5590f285165287bd442a25817f17b);
- the current local [`package.json`](../package.json) and
  [`README.md`](../README.md), which are authoritative for `1st-pi`'s selected
  owners.

Oh My Pi's latest release at review time was
[`v16.5.2`](https://github.com/can1357/oh-my-pi/releases/tag/v16.5.2), published
on 2026-07-14. The repository was active on 2026-07-15. That is a positive
maintenance signal, but the coordinated high-frequency release cadence also
makes source copying and cross-runtime integration drift-prone.

### Classification

- **A — adopt now:** compatible dependency with a distinct owner and acceptable
  runtime/platform cost.
- **B — adapt pattern:** copy or reimplement a small MIT-licensed pattern with
  attribution, behind the current upstream Pi boundary.
- **C — monitor:** promising, but the need, API, evidence, or operational cost
  is not ready.
- **D — reject:** runtime fork, duplicate owner, unsupported runtime, native or
  platform burden, publication gap, or no useful standalone role.

Where a package is D but a narrow source seam is useful, the matrix separates
the package decision from the salvageable B or C idea.

## Current ownership baseline

| Domain | Existing owner | Consequence for this audit |
| --- | --- | --- |
| Runtime, providers, model registry, sessions, extension API | `@earendil-works/pi-*` v0.80.6 | Do not mix in OMP runtime types or a second provider/model registry. |
| Themes, editor chrome, working status, footer, command center, theme lab | `pi-everforest-tui` | Reject another TUI/editor/footer owner. |
| Tool and diff rendering | `pi-tool-display` | A new edit experiment must compose with this renderer; it must not become another general tool UI. |
| Session memory and compaction support | `pi-observational-memory` | Reject a second default memory database or competing compaction hook. |
| Subagents and task isolation | `@tintinweb/pi-subagents` | It already supports parallel agents and Git worktree isolation. |
| Workflow fan-out, pipelines, resume, cost reporting | `@quintinshaw/pi-dynamic-workflows` | Reject another DAG/swarm orchestration domain. |
| Local fuzzy file/content search and `@` completion | `@ff-labs/pi-fff` | Reject a second native grep/walker stack by default. |
| Web and MCP | `pi-web-access`, `pi-mcp-adapter` | OMP's built-in web/MCP paths are runtime-fork features, not preset additions. |
| Tasks, goals, side context, context inspection | `@tintinweb/pi-tasks`, `@narumitw/pi-goal`, `pi-btw`, `@mrclrchtr/supi-context` | Do not add overlapping task/state systems. |

The baseline is not merely conceptual. These packages are present in the
current preset manifest and their thin adapters are listed in its `pi`
extension array. `pi-everforest-tui` and `pi-tool-display` ownership is also
stated explicitly in the local README.

## Compatibility and publication gates

### Runtime mismatch

Every reviewed public OMP manifest at source version `16.5.2` declares
`bun >=1.3.14`. Most publish TypeScript source as their import target;
`pi-natives` is the notable JavaScript-loader/native-addon exception. Examples:

- [`packages/ai/package.json`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/ai/package.json)
- [`packages/catalog/package.json`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/catalog/package.json)
- [`packages/hashline/package.json`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/hashline/package.json)
- [`packages/stats/package.json`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/stats/package.json)

The target runtime declares `node >=22.19.0` and publishes compiled JavaScript:

- [`@earendil-works/pi-ai` v0.80.6 manifest](https://github.com/earendil-works/pi/blob/2b3fda9921b5590f285165287bd442a25817f17b/packages/ai/package.json)
- [`@earendil-works/pi-coding-agent` v0.80.6 manifest](https://github.com/earendil-works/pi/blob/2b3fda9921b5590f285165287bd442a25817f17b/packages/coding-agent/package.json)

A direct Node compatibility probe was also run against the published
`@oh-my-pi/hashline@16.5.2` package. Node v26.5.0 failed before module
initialization because Node does not strip types from `.ts` files under
`node_modules`:

```text
Error: Stripping types is currently unsupported for files under node_modules,
for .../node_modules/@oh-my-pi/hashline/src/index.ts
```

Even a custom transpilation path would not remove the runtime mismatch:
Hashline calls `Bun.hash.xxHash32` in
[`packages/hashline/src/format.ts`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/hashline/src/format.ts)
and its disk filesystem uses `Bun.file`/`Bun.write` in
[`packages/hashline/src/fs.ts`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/hashline/src/fs.ts).

### Publication status

At review time, npm reported `16.5.2` as latest for all named public packages
except `@oh-my-pi/swarm-extension`:

| Package group | Registry status on 2026-07-15 |
| --- | --- |
| [`pi-ai`](https://www.npmjs.com/package/@oh-my-pi/pi-ai), [`pi-catalog`](https://www.npmjs.com/package/@oh-my-pi/pi-catalog), [`pi-agent-core`](https://www.npmjs.com/package/@oh-my-pi/pi-agent-core), [`pi-coding-agent`](https://www.npmjs.com/package/@oh-my-pi/pi-coding-agent), [`pi-tui`](https://www.npmjs.com/package/@oh-my-pi/pi-tui), [`pi-natives`](https://www.npmjs.com/package/@oh-my-pi/pi-natives), [`omp-stats`](https://www.npmjs.com/package/@oh-my-pi/omp-stats), [`pi-utils`](https://www.npmjs.com/package/@oh-my-pi/pi-utils), [`pi-wire`](https://www.npmjs.com/package/@oh-my-pi/pi-wire), [`hashline`](https://www.npmjs.com/package/@oh-my-pi/hashline), [`pi-mnemopi`](https://www.npmjs.com/package/@oh-my-pi/pi-mnemopi), [`snapcompact`](https://www.npmjs.com/package/@oh-my-pi/snapcompact) | Published, latest `16.5.2`, updated 2026-07-14. |
| [`@oh-my-pi/swarm-extension`](https://www.npmjs.com/package/@oh-my-pi/swarm-extension) | Published latest is `13.17.0`, updated 2026-03-30, while source manifest is `16.5.2`. |

The source `swarm-extension` also uses a `workspace:*` dependency and peers on
`@oh-my-pi/pi-coding-agent ^16`; the published `13.17.0` peers on runtime `^13`.
It is not a consumable extension for upstream Pi.

The first-party Rust crates are workspace internals rather than independently
published crates in the reviewed release. Exact `cargo search`
queries returned no matching publication for `pi-natives`, `pi-shell`,
`pi-ast`, `pi-iso`, `pi-walker`, `pi_uu_grep`, `pi_uu_diff`, or
`pi-uutils-ctx`. Their authoritative manifests live under
[`crates/`](https://github.com/can1357/oh-my-pi/tree/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates).

### License

The repository and reviewed npm manifests are MIT licensed. The root
[`LICENSE`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/LICENSE)
names both Mario Zechner and Can Bölük. Any class B adaptation must preserve
that notice in a project `NOTICE` or equivalent attribution file and identify
the source path and pinned commit.

Do not copy the embedded shell/uutils layer under the root license alone.
It has additional notices and vendored licenses, including
[`crates/pi-shell/NOTICE`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates/pi-shell/NOTICE)
and the vendored Brush license. None of the recommendations require that code.

## Package-by-package classification

| Candidate | Class | Source-backed reason | Local-stack comparison |
| --- | --- | --- | --- |
| `@oh-my-pi/pi-ai` | D | It is the fork's provider client and depends on OMP catalog, utils, and wire packages. See [`packages/ai/package.json`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/ai/package.json). | Upstream `pi-ai` already owns providers, auth, streaming, and generated model definitions. Mixing message/model types would create two runtime universes. |
| `@oh-my-pi/pi-catalog` | D package; B test patterns | It bundles model data, discovery, identity, compatibility transforms, and provider priority. It is Bun-specific and depends on `pi-utils`, which pulls the native package. See [`packages/catalog/README.md`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/catalog/README.md). | Upstream already has runtime `Models`, generated provider catalogs, dynamic refresh, and `registerProvider`: [`packages/ai/src/models.ts`](https://github.com/earendil-works/pi/blob/2b3fda9921b5590f285165287bd442a25817f17b/packages/ai/src/models.ts), [`model-registry.ts`](https://github.com/earendil-works/pi/blob/2b3fda9921b5590f285165287bd442a25817f17b/packages/coding-agent/src/core/model-registry.ts). Do not create a second source of truth. |
| `@oh-my-pi/pi-agent-core` | D | It depends on the OMP AI/catalog/native/wire/compaction graph and owns the agent loop and state. See [`packages/agent/package.json`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/agent/package.json). | This would replace, not extend, upstream `pi-agent-core`. |
| `@oh-my-pi/pi-coding-agent` | D | It is the `omp` CLI/SDK and directly depends on nearly the entire monorepo. See [`packages/coding-agent/package.json`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/coding-agent/package.json) and the official [`SDK` docs](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/docs/sdk.md). | Adopting it violates the constraint that `1st-pi` remains a preset for upstream Pi. |
| `@oh-my-pi/pi-tui` | D | Bun-specific TUI with its own component identities, renderer, editor, Markdown, images, and terminal capabilities. See [`packages/tui/README.md`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/tui/README.md). | It conflicts with upstream `pi-tui` types and with `pi-everforest-tui`'s explicit chrome/editor/status/footer ownership. |
| `@oh-my-pi/pi-natives` | D package; C AST seam | A broad N-API aggregate covering grep/walking, AST, syntax highlighting, PTY/shell, isolation, text/image work, and more. See [`crates/pi-natives/src/lib.rs`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates/pi-natives/src/lib.rs) and [`docs/natives-architecture.md`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/docs/natives-architecture.md). | Native grep/walking overlaps FFF; syntax rendering overlaps upstream/TUI concerns; PTY/shell/isolation expands far beyond preset scope. Monitor AST summaries only if a real gap appears. |
| `@oh-my-pi/omp-stats` | B pattern; D dependency | It tolerantly parses OMP JSONL, deduplicates/aggregates into SQLite, and reports tokens, cache, cost, errors, latency, TTFT, model, and project metrics. It uses `bun:sqlite`, OMP paths/schema, and OMP AI/catalog/utils. See [`README`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/stats/README.md), [`parser.ts`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/stats/src/parser.ts), and [`db.ts`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/stats/src/db.ts). | `supi-context` covers current context and workflows cover their own run metrics, but there is no selected cross-session local observability owner. Adapt the metric vocabulary and tolerant-reader approach, not the package. |
| `@oh-my-pi/pi-utils` | D | An internal utility substrate with Bun environment, filesystem, process, worker, retry, logging, and native-process dependencies. See [`packages/utils/package.json`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/utils/package.json) and [`packages/utils/src`](https://github.com/can1357/oh-my-pi/tree/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/utils/src). | It has no distinct product capability and would import fork internals. |
| `@oh-my-pi/pi-wire` | D | Dependency-free types for OMP's collaboration/session wire protocol, not a generic Pi extension protocol. See [`packages/wire/src/index.ts`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/wire/src/index.ts). | `1st-pi` does not implement OMP collab clients. Importing these shapes would falsely couple it to fork-specific wire behavior. |
| `@oh-my-pi/hashline` | B | Its useful invariant is whole-file snapshot tags, stale-anchor rejection/recovery, pluggable filesystem and snapshot stores, and all-section preflight before writes. See [`README`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/hashline/README.md), [`patcher.ts`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/hashline/src/patcher.ts), [`recovery.ts`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/hashline/src/recovery.ts), and [`grammar.lark`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/hashline/src/grammar.lark). | This is a new edit contract, not a renderer. It may be prototyped under a distinct tool name, while `pi-tool-display` remains the only tool/diff UI owner. The published package is not Node-compatible. |
| `@oh-my-pi/pi-mnemopi` | D | A Bun/SQLite memory engine with banks, FTS/vector recall, optional remote LLMs, and `fastembed`/`onnxruntime-node` peers. See [`README`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/mnemopi/README.md) and [`package.json`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/mnemopi/package.json). | It duplicates the selected memory owner and adds a second persistent database, embedding lifecycle, model integration, and fork dependencies. |
| `@oh-my-pi/snapcompact` | C package; B evaluation method | It serializes discarded history into provider-tuned PNG frames and reinjects them as image content. It depends on OMP AI/native/utils/wire and vision-model billing/behavior. See [`README`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/snapcompact/README.md) and [`snapcompact.ts`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/snapcompact/src/snapcompact.ts). | Runtime adoption competes with upstream compaction and observational memory. Its provider-aware recall/cost evaluation approach is valuable independently. |
| `@oh-my-pi/swarm-extension` | D | YAML DAG/wave orchestration invokes OMP's internal `runSubprocess`, persists `.swarm_*` state, requires Bun, and peers on OMP coding-agent. See [`executor.ts`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/swarm-extension/src/swarm/executor.ts), [`schema.ts`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/swarm-extension/src/swarm/schema.ts), and its manifest. | `pi-dynamic-workflows` already owns fan-out, pipelines, resume journals, worktree isolation, budgets, and progress UI; `pi-subagents` already owns agent execution. This would be a duplicate domain system. |

## Valuable narrow patterns

### B1. Hash-anchored editing, not the published Hashline package

The valuable part is not the syntax alone. It is the invariant bundle:

- the read result mints a tag from normalized full-file content;
- an edit refers to the observed snapshot rather than trusting bare line
  numbers;
- stale state is rejected unless recovery can prove each anchor mapping;
- every section is parsed, read, validated, and applied in memory before any
  write, preventing a partially-applied multi-file patch;
- filesystem and snapshot storage are explicit interfaces.

A partial copy that keeps only four-character line labels but omits snapshot
ownership, full preflight, or recovery proofs would preserve the appearance
and lose the safety property. If this proceeds, port the complete invariant set
and attribute the source.

This belongs in an optional `1st-pi` edit experiment, not
`pi-everforest-tui`. The first version must register a distinct tool such as
`hashline_edit_probe`; it must not replace upstream `edit`, claim general tool
rendering, or change the default preset.

### B2. Local observability vocabulary and tolerant ingestion

`omp-stats` provides a useful product shape that the current stack does not
fully own: local, cross-session performance and cost visibility. Useful source
patterns include:

- tolerant parsing of older, malformed, or crash-truncated session entries;
- incremental ingestion;
- stable entry identity to avoid double-counting branched/forked sessions;
- explicit cache read/write, TTFT, latency, stop reason, error rate, throughput,
  and cost fields;
- project/model/time-series aggregation.

The implementation cannot be copied as a dependency because its session path,
message types, catalog costing, SQLite runtime, and web server are OMP-specific.
Build an upstream-Pi adapter against captured v0.80.6 fixtures. Prefer a
read-only CLI/JSON seam before adding a database or dashboard.

This is a separate optional package if it proves useful. It should not enter
`pi-everforest-tui`; the theme package may style a future view but must not own
session ingestion or metrics persistence.

### B3. Context-compression evaluation, not bitmap compaction

Snapcompact's strongest transferable idea is empirical, provider-aware
evaluation. Its research directory contains SQuAD-style question/answer and
provider experiments, including
[`research/squad.py`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/snapcompact/research/squad.py),
[`research/providers.py`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/snapcompact/research/providers.py),
and
[`research/final.py`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/snapcompact/research/final.py).

Adapt the method to real upstream Pi transcripts and current memory behavior:

- measure factual recall, latest-state selection, unresolved-task retention,
  path/identifier accuracy, and source-backed recovery;
- record input/output/cache/image cost and compaction latency;
- keep provider/model/version fixed per comparison;
- compare stock upstream compaction, current observational memory, and only
  then a bitmap-frame arm on vision-capable models;
- treat OMP's published claims as hypotheses until reproduced locally.

This gives `pi-observational-memory` a falsifiable acceptance gate without
installing a second compaction implementation.

### B/C. Model identity cases belong upstream or in current owners

OMP has useful normalization and priority examples under
[`packages/catalog/src/identity`](https://github.com/can1357/oh-my-pi/tree/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/packages/catalog/src/identity),
including bracket-affix stripping, model-family classification, equivalence,
and provider preference.

Do not copy its provider priority table or generated model catalog into
`1st-pi`. Upstream Pi already owns model/provider identity, and current
subagent/workflow packages already perform tolerant model selection. If a real
model-resolution bug is reproduced, port only the failing conformance cases to
the authoritative owner and propose the fix there.

## Rust and native crates

The official crate map is documented in
[`docs/native-crates.md`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/docs/native-crates.md),
but the source tree is the final authority; that document omits at least the
present `pi-uu-diff` crate.

| Crate | Class | Assessment |
| --- | --- | --- |
| [`pi-natives`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates/pi-natives/Cargo.toml) | D | N-API aggregation layer, not a narrow capability. It brings the other native domains together. |
| [`pi-shell`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates/pi-shell/Cargo.toml) | D | Embedded shell/PTY/process runtime with vendored Brush and uutils. This replaces core execution behavior and has extra attribution burden. |
| [`pi-ast`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates/pi-ast/Cargo.toml) | C | AST summaries over many tree-sitter grammars may be useful, but the crate is not independently published and would create a large native grammar/update surface. Revisit only after a concrete syntax-summary gap. |
| [`pi-iso`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates/pi-iso/Cargo.toml) | C | APFS, btrfs, ZFS, reflink, overlayfs, ProjFS, and copy/worktree fallback are a strong design, but current subagent/workflow owners already provide strict Git-worktree isolation. Measure worktree startup cost before adding a native backend. |
| [`pi-walker`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates/pi-walker/Cargo.toml) | D | Parallel filesystem walking overlaps FFF's selected native search/index path. |
| [`pi_uu_grep`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates/pi-uu-grep/Cargo.toml) | D | In-process ripgrep behavior overlaps FFF and upstream tools. |
| [`pi_uu_diff`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates/pi-uu-diff/Cargo.toml) | D | Internal shell builtin, not the UI diff renderer; it adds no missing preset domain. |
| [`pi-uutils-ctx`](https://github.com/can1357/oh-my-pi/blob/2134526b7d2822b8c8b72b0c57f92fa4b7ca7e4e/crates/pi-uutils-ctx/Cargo.toml) | D | Thread-local stdio/cwd shim for the embedded uutils implementation; no standalone user value. |
| Vendored Brush/uutils/jaq crates | D | Internal shell supply chain with multiple licenses/notices and no preset-level capability. |

The native package's release architecture generates optional platform leaf
packages for macOS x64/arm64, Linux x64/arm64, and Windows x64. npm reported
unpacked leaf sizes of approximately 136 MB for macOS arm64, 137 MB for macOS
x64, 138 MB for Linux arm64, 281 MB for Linux x64, and 140 MB for Windows x64.
That is disproportionate for obtaining only grep or syntax summaries, and it
does not cover Windows arm64 or Linux musl as a declared leaf.

## Prioritized recommendation

### P0 — keep the preset graph unchanged

- Add no OMP dependency.
- Add no OMP peer/runtime alias.
- Add nothing to `pi-everforest-tui` from this audit.
- Keep one owner per model registry, memory system, search stack, subagent
  runtime, workflow engine, tool renderer, and TUI surface.

### P1 — run three small experiments

#### Experiment 1: Node-native Hashline probe

Build a throwaway extension outside the default manifest.

Acceptance evidence:

1. **Stale rejection:** read, mutate the file externally, then apply the old
   edit; it must reject or prove a safe recovery.
2. **Batch atomicity:** make one section invalid in a multi-file patch; no file
   may change.
3. **Content fidelity:** BOM, CRLF/LF, empty files, Unicode, renames, and final
   newlines survive correctly.
4. **Benchmark:** compare first-attempt apply rate, retries, prompt tokens, and
   final patch correctness against upstream `edit` on a fixed task corpus.
5. **Composition:** `pi-tool-display` remains the sole renderer and upstream
   `edit` remains available; no editor/footer ownership changes.

Advance only if the safety invariants are durable and the measured editing
benefit outweighs a second edit protocol.

#### Experiment 2: read-only upstream Pi stats extractor

Start with copied session fixtures, not live mutation.

Acceptance evidence:

1. parse current and crash-truncated v0.80.6 JSONL without aborting the scan;
2. reconcile request counts and token/cache/cost totals against raw entries;
3. prove branch/fork records are not double-counted;
4. expose machine-readable JSON before adding SQLite or a web UI;
5. keep unknown fields for forward compatibility and surface skipped/malformed
   record counts.

If useful, publish it as an optional observability package. Do not put storage
or ingestion into the Everforest theme package.

#### Experiment 3: compaction/memory retention bake-off

Use fixed real-session fixtures and a scored question set. Compare stock
upstream compaction and `pi-observational-memory`; add Snapcompact only as an
experimental third arm on supported vision models.

Acceptance evidence:

1. latest decision/state is preferred over superseded history;
2. exact identifiers, paths, commands, failures, and open tasks remain
   recoverable;
3. source-backed recall points to the correct original evidence;
4. latency, tokens, cache use, and monetary cost are recorded;
5. the same fixtures and scoring can be replayed after package/model upgrades.

### P2 — monitor behind measured triggers

- **Model identity:** only act on a reproduced current-owner resolution bug.
- **`pi-ast`:** only act when FFF plus upstream read/search demonstrably lacks
  a needed structural summary.
- **`pi-iso`:** only act when worktree creation is a measured workflow
  bottleneck; the change belongs in the current subagent/workflow owner.
- **Snapcompact runtime:** monitor provider billing, vision recall, and upstream
  compaction APIs; do not make image frames a default memory format.

### P3 — reject duplicate domains

Do not revisit `pi-ai`, `pi-agent-core`, `pi-coding-agent`, `pi-tui`,
`pi-mnemopi`, `swarm-extension`, `pi-wire`, `pi-utils`, or the shell/walker/grep
native stack unless the product decision changes from "curated upstream Pi
preset" to "adopt or fork the OMP runtime." That would be a separate migration
decision, not a package addition.

## Final answer

Oh My Pi is valuable as a source of tested ideas, but its packages form a
tightly-coupled Bun/native runtime fork. For `1st-pi`, direct package adoption
would trade clear upstream ownership for duplicate domains and an unsupported
runtime graph.

The best near-term return is therefore:

1. preserve the existing package graph;
2. prototype Hashline's full safety invariants under Node and a distinct tool;
3. adapt `omp-stats`' observability semantics to upstream session fixtures;
4. import Snapcompact's evaluation discipline into the current memory decision;
5. send model identity, AST, and isolation improvements to their existing
   owners only when a measured failure justifies them.
