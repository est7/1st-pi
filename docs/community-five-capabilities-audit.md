# Community Package Audit: Five Extension Capabilities

Date: 2026-07-15  
Target: `@earendil-works/pi-coding-agent@0.80.6` on Node.js  
Decision vocabulary: **Adopt**, **Trial**, **Monitor**, **Reject**

> **Post-audit update:** The user subsequently selected `pi-readseek`. The current preset assigns `read/edit/write` to Readseek and `find/grep` to FFF, and removed `pi-tool-display` to avoid duplicate built-in tool owners. The candidate evidence below remains the historical decision record.

## Executive verdict

No community package satisfies all five capability contracts, and three of the
five capabilities have no credible complete package at all. The useful outcome
is a small, isolated trial queue rather than additions to the preset manifest.
**Adopt: none.**

| Capability | Verdict | Best candidate | Boundary that remains unmet |
|---|---|---|---|
| Stale-safe, hash-anchored editing | **Trial** | [`pi-hashline-edit-pro@0.16.11`](https://www.npmjs.com/package/pi-hashline-edit-pro) | Strict stale rejection and same-file batch atomicity, but no whole-snapshot request token, general cross-file transaction, or anchor recovery beyond re-read. |
| Cross-session stats / observability | **Trial** | [`@firstpick/pi-extension-stats@0.2.8`](https://www.npmjs.com/package/@firstpick/pi-extension-stats) | Good current-workspace token/cache/cost/session/model aggregation; no latency, error, or cross-project aggregation. |
| Memory / compaction evaluation harness | **Monitor** | No credible published harness | `pi-smart-compact` has useful implementation-coupled tests, but it is another compactor, uses Bun, and does not publish its eval corpus as a reusable harness. |
| Model diagnostics / doctor | **Monitor** | No credible published package | Available scripts inspect a product-specific environment or one provider; none validates identity, credentials, context, thinking compatibility, and routing together. |
| AST / outline / symbol tools | **Trial** | [`@mrclrchtr/supi-code-intelligence@2.4.0`](https://www.npmjs.com/package/@mrclrchtr/supi-code-intelligence) | Strong structural and semantic contract, but a 51.9 MB unpacked package, bundled WASM, external LSP processes, and a broad nine-tool surface require an allowlisted read-only trial. |

Do not add any candidate to `package.json` from this audit. Run the trials in a
separate Pi config directory and promote only after the adversarial smoke tests
below pass.

## Scope and evidence

The audit used npm registry metadata and npm's download API for discovery, then
checked the published manifests and source repositories for the actual
invariant. Source links are pinned to the inspected commits. Popularity is not a
correctness or maintenance signal; the 2026-06-15 through 2026-07-14 download
counts are included only to explain discovery order.

The current preset already has owners for tool rendering, memory, context
inspection, web/MCP access, subagents/tasks, and workflows. In particular,
[`pi-tool-display`](https://www.npmjs.com/package/pi-tool-display) remains the
tool/diff UI owner, [`pi-observational-memory`](https://www.npmjs.com/package/pi-observational-memory)
remains the memory owner, and
[`@mrclrchtr/supi-context`](https://www.npmjs.com/package/@mrclrchtr/supi-context)
remains the current-context owner. A candidate must add a missing invariant, not
another UI or state owner.

### Compatibility probe performed

The leading packages were installed separately with exact
`@earendil-works/pi-coding-agent@0.80.6`, then loaded with only their explicit
extension entry under Node `v26.5.0`, npm `11.17.0`, macOS arm64:

```bash
PI_CODING_AGENT_DIR="$TMP/pi-home" "$TMP/node_modules/.bin/pi" \
  --no-extensions --no-skills --no-context-files --offline \
  -e "$ENTRY" --list-models
```

| Package | Dependency resolution | Extension startup | Important limit |
|---|---|---|---|
| `pi-hashline-edit-pro@0.16.11` | Pass | Pass | Resolved `@earendil-works/pi-tui@0.80.7` beside the `0.80.6` host. |
| `pi-readseek@0.6.6` | Pass | Pass | Startup did not exercise its native parser or mutation paths. |
| `@firstpick/pi-extension-stats@0.2.8` | Pass | Pass | Cleanest `0.80.6` dependency closure of the candidates. |
| `@raindrop-ai/pi-agent@0.1.0` | Pass | Pass, tracing disabled without a key | Resolved `pi-agent-core@0.80.7`; no event shipment was attempted. |
| `@mrclrchtr/supi-code-intelligence@2.4.0` | Pass | Pass | Optional host peers appear unmet in the isolated npm tree; the Pi host supplies them at runtime. |
| `pi-codebase-reader@0.6.2` | Pass with peer overrides | Pass | Resolved `pi-ai` and `pi-tui` `0.80.7`; no parser execution was exercised. |

This proves package resolution and extension parsing only. It does not prove
tool behavior, provider compatibility, native platform coverage, or safe
coexistence with the preset.

## 1. Stale-safe, hash-anchored editing

### Required invariant

The desired contract is stronger than “lines have hashes”:

1. A read produces a snapshot identity and edit-ready anchors.
2. Every targeted anchor is checked against the intended snapshot.
3. A stale target rejects before any write.
4. A multi-file operation preflights every file before the first write and has a
   defined recovery policy for mid-commit failure.
5. Recovery returns fresh, unambiguous anchors without silently changing the
   requested target.

No candidate implements all five for arbitrary edits.

### Candidates

| Candidate | Match | Actual invariant | Publication / compatibility / burden | Overlap | Verdict |
|---|---|---|---|---|---|
| [`pi-hashline-edit-pro@0.16.11`](https://www.npmjs.com/package/pi-hashline-edit-pro) | Closest strict single-file match | A top-level path owns a batch. All anchors are resolved against one pre-edit file image, conflicts reject, spans apply bottom-up, and the file is written by temp-file rename. Missing hashes throw `E_STALE_ANCHOR`; there is no fuzzy relocation. The request does not carry a whole-file snapshot ID and recovery is “read again.” See [`replace.ts`](https://github.com/YuGiMob/pi-hashline-edit-pro/blob/01b6a61c25c3ba7d504fd2ad1adeb09b9fb790a1/src/replace.ts#L145-L212), [`apply.ts`](https://github.com/YuGiMob/pi-hashline-edit-pro/blob/01b6a61c25c3ba7d504fd2ad1adeb09b9fb790a1/src/hashline/apply.ts#L254-L355), and [`resolve.ts`](https://github.com/YuGiMob/pi-hashline-edit-pro/blob/01b6a61c25c3ba7d504fd2ad1adeb09b9fb790a1/src/hashline/resolve.ts#L82-L124). | Published 2026-07-13; MIT; Pi peers `>=0.74.0`; no Node engine declared; 123 KB unpacked; `xxhash-wasm`, no N-API binary. Source was active at the inspected release commit. | Replaces built-in `read` and `edit`; `pi-tool-display` must remain the only renderer owner. | **Trial**, isolated profile only. |
| [`pi-readseek@0.6.6`](https://www.npmjs.com/package/pi-readseek) | Partial, broader | Single-file anchored edits validate all references before writing. Exact-hash relocation is bounded, but an anchor containing old content may be fuzzy-relocated at token similarity `>0.8` and then written with a warning; that is not strict stale rejection. Its binding-aware workspace rename is stronger: it rechecks every file before any write and restores already-written files on a later write failure. This transaction applies only to rename, not arbitrary multi-file edits. See [`hashline.ts`](https://github.com/jarkkojs/readseek/blob/c2b663882ddf7834aa34d4ecef0ea3f3648cafc9/packages/pi-readseek/src/hashline.ts#L445-L546) and [`rename.rs`](https://github.com/jarkkojs/readseek/blob/c2b663882ddf7834aa34d4ecef0ea3f3648cafc9/src/engine/rename.rs#L278-L349). | Published 2026-07-15; wrapper Apache-2.0; native dependency is `Apache-2.0 AND LGPL-2.1-or-later`; Node `>=20`; 374 KB wrapper plus platform binary. Published leaves cover darwin-arm64, linux-arm64/x64, and win32-x64, not darwin-x64. | Ten edit/search/AST tools overlap both the requested edit seam and the AST candidates. | **Monitor**; conditional trial only if native/LGPL review and fuzzy-recovery semantics are accepted. |
| [`pi-hashline-edit@0.8.3`](https://www.npmjs.com/package/pi-hashline-edit) and forks | Exact name, partial contract | Per-line hashes and same-file bulk edits, but no evidence of a whole-snapshot request token, arbitrary multi-file preflight, or safe anchor recovery beyond re-read. `pi-hashline-edit-pro` is the stricter collision-resolving descendant. | MIT; Pi peers `>=0.74.0`; 190 KB; pure JS/WASM dependencies. Forks include `@jerryan/pi-hashline-edit`, `@jc4649/pi-hashline-edit`, and `pi-hashline-context-edit`, with no stronger complete invariant found. | Same built-in tool replacement seam. | **Reject** as duplicate lineage. |
| [`pi-hledit@1.1.7`](https://www.npmjs.com/package/pi-hledit) | Partial | Hashline edit surface, but its peer contract is `@earendil-works/pi-coding-agent@^0.79.9`, which excludes `0.80.6`. | MIT; Node `>=18`; 225 KB. | Same edit owner. | **Reject** for target peer mismatch. |
| `@the-agency/pi-hashline-edit`, `pi-hashline` | Stale lineage | Both still peer on the old `@mariozechner/*` package identity. | MIT; published, but not compatible with the selected upstream identity without a fork. | Same edit owner. | **Reject**. |

The `pi-hashline-edit-pro` trial is deliberately narrower than adopting it. It
must not replace the preset's normal editor until stale-target, collision,
symlink, hard-link, concurrent-writer, and all-or-nothing batch cases pass.

## 2. Cross-session stats and observability

### Required invariant

The desired local view aggregates token input/output, cache reads/writes, cost,
latency/TTFT, errors, project, provider/model, session, and time range. It must
tolerate malformed or older JSONL records and make deduplication rules explicit.

No Node-compatible package covers the complete metric set.

### Candidates

| Candidate | Match | Actual invariant | Publication / compatibility / burden | Overlap | Verdict |
|---|---|---|---|---|---|
| [`@firstpick/pi-extension-stats@0.2.8`](https://www.npmjs.com/package/@firstpick/pi-extension-stats) | Best bounded partial | Reads every `.jsonl` directly in the current workspace session directory, skips unreadable/malformed records, and aggregates day, session, provider/model, input/output/cache tokens, messages, and provider-reported cost. It does not recurse into nested runs and has no latency, TTFT, error, or cross-project dimension. See [`README`](https://github.com/Firstp1ck/npm-packages/blob/66c78478ca387584875526e12fb237bd7f8f625e/pi-extension-stats/README.md#L7-L36) and [`index.ts`](https://github.com/Firstp1ck/npm-packages/blob/66c78478ca387584875526e12fb237bd7f8f625e/pi-extension-stats/index.ts#L628-L848). | Published 2026-07-04; MIT; wildcard Pi peer; 469 KB; no native dependency; exact `0.80.6` startup passed. About 2.2K npm downloads in the discovery window. | Complements `supi-context`: history versus current-context composition. | **Trial**. |
| [`@tmustier/pi-usage-extension@0.3.2`](https://www.npmjs.com/package/@tmustier/pi-usage-extension) | Broader global partial | Recursively scans all Pi sessions, including nested subagent runs, and deduplicates copied branch messages by timestamp plus total tokens. It reports provider/model/session/token/cache/cost and time-period insights. It still lacks error, latency/TTFT, and project grouping. See [`README`](https://github.com/tmustier/pi-extensions/blob/10c584a8daf2a476e0cdf3ee1b9401db45e5eb19/usage-extension/README.md#L56-L147). | Published 2026-05-07; MIT; wildcard Pi/TUI peers; 629 KB; no native dependency. Repository activity continued through 2026-07-12. About 2.2K discovery-window downloads. | Overlaps the same `/usage` dashboard owner as Firstpick; do not install both. | **Monitor** as the alternative when global recursive scanning matters more than workspace isolation. |
| [`@raindrop-ai/pi-agent@0.1.0`](https://www.npmjs.com/package/@raindrop-ai/pi-agent) | Observability, not local stats | Emits session → turn → LLM → tool traces with model, token, latency, and error signals. Cloud mode requires a write key and sends traces to Raindrop; a local destination is configurable. The package is an event shipper, not a local cross-session cost/project aggregation store. Its default redaction lowers but does not remove data-export review. See the published [`README`](https://www.npmjs.com/package/@raindrop-ai/pi-agent) and source-mapped [`extension` contract](https://www.raindrop.ai/docs/integrations/pi-agent/). | Version `0.1.0` published 2026-07-14; MIT; Pi peers `>=0.74.0`; 288 KB; no native dependency. About 14.3K discovery-window downloads, which is too early to treat as adoption evidence. | Adds an external telemetry owner and privacy boundary. | **Monitor**, not a default preset dependency. |
| [`pi-local-token-costs@1.0.3`](https://www.npmjs.com/package/pi-local-token-costs) | Narrow partial | Tracks token cost and model history, including local-model price matching. It does not own latency, errors, or projects and fetches pricing from OpenRouter. | Published 2026-07-04; MIT; 86 KB; no native dependency. | Duplicates the preferred stats owner while covering fewer dimensions. | **Reject**. |
| [`@oh-my-pi/omp-stats@16.5.2`](https://www.npmjs.com/package/@oh-my-pi/omp-stats) | Metric vocabulary reference | The most complete schema found—tokens, cache, cost, errors, latency/TTFT, model, and project—but it depends on OMP paths/schema and `bun:sqlite`. | MIT; Bun/OMP dependency closure; not a Node extension for upstream Pi. See the separate [Oh My Pi audit](./oh-my-pi-adoption-audit.md). | Would introduce a second runtime and session schema. | **Reject** as a package; reuse only its metric vocabulary and tolerant-reader design. |

## 3. Memory and compaction evaluation harnesses

### Required invariant

This capability is an evaluator, not another memory implementation. A credible
package must accept frozen transcripts and candidate outputs, run the same corpus
against baseline and candidate, score fact retention and hallucination, measure
compression/cost/latency, exercise at least two compaction cycles, and emit
machine-readable results with reproducible model/config metadata.

No credible published Pi package meets that contract.

| Candidate | Match | Actual invariant | Publication / compatibility / burden | Overlap | Verdict |
|---|---|---|---|---|---|
| [`pi-smart-compact@7.20.0`](https://www.npmjs.com/package/pi-smart-compact) | Useful source reference, wrong product boundary | Its repository has gold extraction cases, deterministic summary verification, damage detection, metrics, and a pipeline integration suite. Those tests evaluate its own extractor/compactor and are not part of the published npm files. Installing the package installs a compaction implementation and `session_before_compact` owner. See [`test/eval.test.ts`](https://github.com/alpertarhan/pi-smart-compact/blob/05f4ef0e8042420d5932cb9a01078210f3c885e6/test/eval.test.ts) and the published-file list in [`package.json`](https://github.com/alpertarhan/pi-smart-compact/blob/05f4ef0e8042420d5932cb9a01078210f3c885e6/package.json#L36-L63). | Published 2026-07-14; MIT; 1.56 MB; built and tested with Bun, including a Bun-targeted bundle. About 2.3K discovery-window downloads. | Directly conflicts with the existing memory/compaction owner boundary. | **Monitor** the eval patterns; **Reject** the package for this capability. |
| `@oh-my-pi/pi-metaharness` and `@oh-my-pi/typescript-edit-benchmark` | Adjacent upstream evidence | Private OMP workspaces, not published reusable community packages and not a Node/Pi compaction evaluator. | Bun/OMP monorepo only. | None as installable packages. | **Reject**. |
| Memory implementations (`pi-observational-memory`, Remnic, Magic Context, Engram variants) | Wrong category | They store or compact memory; their tests establish their own behavior, not comparative evaluation of arbitrary candidates. | Various. | Duplicate the existing memory owner. | **Reject** for this capability. |

The correct next step is a small first-party evaluator or an upstream-neutral
fixture format, not installing a second memory system. This audit does not
authorize that implementation.

## 4. Model diagnostics and doctor

### Required invariant

A useful doctor must report the resolved provider and model identity, credential
source and validity without leaking secrets, context-window and current usage,
thinking-level support, and routing/fallback decisions. Checks must be
side-effect-free by default and distinguish configuration from a live provider
probe.

No credible published package implements the full contract.

| Candidate | Match | Actual invariant | Publication / compatibility / burden | Overlap | Verdict |
|---|---|---|---|---|---|
| [`merahburam/pi-extensions/doctor-command.ts`](https://github.com/merahburam/pi-extensions/blob/316c5dced70f18acf2ff14bf69a37d065efeb435/doctor-command.ts) | Unpublished partial | Shows selected model, file presence, environment key names, session count, Node/OS, and memory. It hard-codes NVM paths, masks by printing the first six secret characters, does not validate credentials, and does not check thinking or routing. | Personal repository, no detected repository license, zero stars at inspection, no standalone npm package. | Would create a global `/doctor` owner with weak secret handling. | **Reject**. |
| [`zero-pi` doctor](https://github.com/gonzalonicolasr/zero-pi/blob/7eba44578dba6114d99538cf0833494d3e1aae56/extensions/zero-doctor-extension.ts) | Product-specific partial | Diagnoses zero-pi installation, its model registry, subagents, Git/GitHub, and its SDD state. It is not a provider/model compatibility doctor. | Active MIT repository, but no standalone general Pi package found. | Product-specific command and state. | **Reject** for the preset. |
| [`pi-shazam@0.30.0`](https://www.npmjs.com/package/pi-shazam) `/shazam-doctor` | Component doctor only | Checks Shazam's LSP status, errors, slow calls, grammars, and cache integrity. It says nothing about provider credentials, context, thinking, or routing. | MIT; Node `>=18`; 1.58 MB plus native grammars and external LSPs. | Belongs to the AST stack, not model ownership. | **Monitor** only with an AST trial. |
| [`@alexanderfortin/pi-deepseek-usage@0.3.11`](https://www.npmjs.com/package/@alexanderfortin/pi-deepseek-usage) | Provider-specific adjacent tool | Reports DeepSeek balance/usage. It does not validate general provider/model routing or context/thinking compatibility. | MIT; exact `^0.80.6` Pi/TUI peers; 18 KB. | Creates a provider-specific status owner. | **Reject** as a general doctor. |

## 5. AST, code outline, and symbol tools

### Required invariant

The desired tool returns structural summaries, symbols, imports, exports, and
source ranges. It must state provenance and failure/degradation, and it must not
silently present text grep as semantic identity. Mutators are out of scope for
the initial trial.

### Candidates

| Candidate | Match | Actual invariant | Publication / compatibility / burden | Overlap | Verdict |
|---|---|---|---|---|---|
| [`@mrclrchtr/supi-code-intelligence@2.4.0`](https://www.npmjs.com/package/@mrclrchtr/supi-code-intelligence) | Best complete extension surface | `code_orientation`, `code_inspect`, `code_graph`, `code_find`, and related tools combine Tree-sitter outline/import/export/range facts with optional LSP identity. The package explicitly says non-search semantic requests do not silently fall back to grep, and handles are fingerprint-gated after file changes. See [`README`](https://github.com/mrclrchtr/supi/blob/973acbd6e428c17eaff4aa776eb63df6ce198464/packages/supi-code-intelligence/README.md#L111-L141) and its [failure boundaries](https://github.com/mrclrchtr/supi/blob/973acbd6e428c17eaff4aa776eb63df6ce198464/packages/supi-code-intelligence/README.md#L223-L256). | Published 2026-07-14; MIT; wildcard Pi peers; 51.9 MB unpacked; bundled `web-tree-sitter` WASM; external LSP binaries must be installed manually. Same actively maintained monorepo as `supi-context`. About 4.1K discovery-window downloads. | Same vendor/runtime family as `supi-context`, which is favorable, but adds nine public tools, LSP processes, and `code_refactor_apply`. | **Trial** with only `code_orientation`, `code_inspect`, `code_find`, `code_graph`, and `code_health` enabled; mutators disabled. |
| [`@mrclrchtr/supi-tree-sitter@2.4.0`](https://www.npmjs.com/package/@mrclrchtr/supi-tree-sitter) | Exact library, not extension | Provides 1-based UTF-16 ranges plus outline/import/export/node/callee/call-site APIs across 15 language families. It intentionally registers no Pi tools; the public extension owner is `supi-code-intelligence`. See its [`README`](https://github.com/mrclrchtr/supi/blob/973acbd6e428c17eaff4aa776eb63df6ce198464/packages/supi-tree-sitter/README.md#L9-L35). | MIT; 24.9 MB; bundled WASM and SuPi runtime packages. | Installing it directly would add substrate without a user-facing owner. | **Reject** direct installation; consume through the code-intelligence package. |
| [`pi-codebase-reader@0.6.2`](https://www.npmjs.com/package/pi-codebase-reader) | Strong lightweight outline partial | Overrides built-in `read`: large supported files return nested symbols, previews, and ranges; `connected_tree` adds import and reverse-import graphs. It covers six languages but does not expose exports as a first-class contract. It also writes and manages an Explorer subagent definition. See [`README`](https://github.com/HanzCEO/pi-codebase-reader/blob/f313ef4aca2a2c9f71388af293b8a7df56e7ff00/README.md#L3-L23) and its [subagent lifecycle](https://github.com/HanzCEO/pi-codebase-reader/blob/f313ef4aca2a2c9f71388af293b8a7df56e7ff00/README.md#L159-L180). | Published 2026-07-14; MIT; 982 KB; `web-tree-sitter` plus grammar packages; no Node engine declared. Isolated `0.80.6` install required peer overrides and pulled `0.80.7` Pi companions. | Overrides `read` and overlaps the installed `@tintinweb/pi-subagents` owner. | **Monitor**; not preferred for this preset. |
| [`pi-shazam@0.30.0`](https://www.npmjs.com/package/pi-shazam) | Broad AST/LSP partial | Seven tools cover overview, lookup, impact, verification, changes, formatting, and rename. It has semantic breadth but does not expose the same small factual outline/import/export contract. | Published 2026-07-12; MIT; Node `>=18`; 1.58 MB; native Tree-sitter grammar packages with advertised prebuilt binaries plus external LSPs. About 10.6K discovery-window downloads. | Verification, formatting, rename, and rendering overlap existing owners. | **Monitor** for a later head-to-head, not the first trial. |
| [`pi-lens@3.8.70`](https://www.npmjs.com/package/pi-lens) | Complete but over-broad | Excellent `module_report`, `read_symbol`, `symbol_search`, LSP navigation, and AST outline/search. It also owns diagnostics, formatting, security rules, edit guards, telemetry, and automatic external tool installation. See [`agent-tools.md`](https://github.com/apmantza/pi-lens/blob/21cad1012505ad33b5a69be9632929a19643d918/docs/agent-tools.md) and [`dependencies.md`](https://github.com/apmantza/pi-lens/blob/21cad1012505ad33b5a69be9632929a19643d918/docs/dependencies.md). | Published 2026-07-14; MIT; 45.8 MB; N-API ast-grep plus WASM; auto-installs many LSP/lint/security binaries. About 31.2K discovery-window downloads. | High overlap with tool display, verification, formatting, and policy owners. | **Reject** for the preset's bounded gap. |
| [`pi-readseek@0.6.6`](https://www.npmjs.com/package/pi-readseek) | Combined edit + AST alternative | Structural map/search/definition/reference tools are real parser-backed operations, not grep, but adoption also brings its edit/rename contract and native LGPL component. | See editing section. | Crosses two capability-owner boundaries at once. | **Monitor**, not a second AST trial. |

## Prioritized shortlist

1. **Trial `@firstpick/pi-extension-stats@0.2.8` first.** It is read-only,
   Node-native, current-workspace scoped, and has the cleanest `0.80.6`
   dependency closure. Promote only if fixture totals match and malformed JSONL
   behavior is visible rather than silently misleading.
2. **Trial `@mrclrchtr/supi-code-intelligence@2.4.0` read-only.** Its explicit
   distinction between text, structural, and semantic evidence is the strongest
   AST contract found, and it shares a vendor/runtime family with `supi-context`.
   Disable refactor tools and measure startup CPU, prompt/tool-schema cost, and
   degradation without LSP binaries.
3. **Trial `pi-hashline-edit-pro@0.16.11` only in a disposable profile.** It is
   the narrowest strict stale-rejection candidate, but it replaces core tools and
   does not supply the desired general cross-file transaction. Do not promote it
   on its happy-path tests alone.
4. **Monitor `pi-readseek@0.6.6`.** Reconsider only if its workspace-rename
   transaction is a committed requirement and LGPL/native distribution plus
   fuzzy anchor relocation are acceptable.
5. **Build or sponsor, do not install, the missing evaluator and model doctor.**
   There is no credible package to trial for either capability.

## Exact isolated smoke tests

### Common clean-room startup

Run each candidate separately; never point these commands at the real Pi config:

```bash
tmp="$(mktemp -d)"
cd "$tmp"
npm init -y
npm install --save-exact \
  @earendil-works/pi-coding-agent@0.80.6 \
  CANDIDATE@EXACT_VERSION

PI_CODING_AGENT_DIR="$tmp/pi-home" \
  "$tmp/node_modules/.bin/pi" \
  --no-extensions --no-skills --no-context-files --offline \
  -e "$tmp/node_modules/CANDIDATE/EXACT_ENTRY" \
  --list-models
```

Acceptance: exit `0`, no writes outside `$tmp`, no network in the startup phase,
and no second copy of a Pi host library outside the versions explicitly recorded
in `npm ls --all`.

Use these exact candidate paths in place of the placeholders:

| Package | `CANDIDATE@EXACT_VERSION` | `CANDIDATE/EXACT_ENTRY` |
|---|---|---|
| Stats trial | `@firstpick/pi-extension-stats@0.2.8` | `@firstpick/pi-extension-stats/index.ts` |
| AST trial | `@mrclrchtr/supi-code-intelligence@2.4.0` | `@mrclrchtr/supi-code-intelligence/src/extension.ts` |
| Edit trial | `pi-hashline-edit-pro@0.16.11` | `pi-hashline-edit-pro/index.ts` |
| Readseek monitor probe | `pi-readseek@0.6.6` | `pi-readseek/index.ts` |

### Hashline edit trial

Pin and run the candidate's closest regression seams:

```bash
git clone https://github.com/YuGiMob/pi-hashline-edit-pro.git
cd pi-hashline-edit-pro
git checkout 01b6a61c25c3ba7d504fd2ad1adeb09b9fb790a1
npm ci
npx vitest run \
  test/integration/multi-edit-bulk.test.ts \
  test/integration/stale-position-compound.test.ts \
  test/tools/edit.queue.test.ts \
  test/tools/fs-write-cleanup-on-error.test.ts
```

Then add an external-writer probe in a temporary directory:

1. Read and retain anchors for `a.txt`.
2. Modify the targeted line outside the extension.
3. Submit a two-edit batch where the other anchor is still valid.
4. Assert `E_STALE_ANCHOR` and byte-for-byte equality with the externally modified
   file—neither edit may apply.
5. Repeat with two files and record that the package has no general cross-file
   request; this is a known contract gap, not a passed test.
6. Exercise symlink, hard-link, mode preservation, cancellation, and a write
   failure after temp-file creation. Assert no orphan temp files.

### Stats trial

Create a temporary workspace session directory with three JSONL files:

- two valid assistant messages on different days/models, with distinct input,
  output, cache-read, cache-write, and cost values;
- a copied branch message with the same timestamp/usage;
- one malformed JSON line and one assistant error without usage.

Load only `@firstpick/pi-extension-stats@0.2.8`, invoke `/stats all`,
`/stats-model-compare all`, and `/stats-cache all`, and capture notifications.
Acceptance:

- totals equal the declared fixture formula;
- malformed lines do not abort the command;
- copied-history behavior is explicitly observed (Firstpick currently does not
  deduplicate it, so the expected total must document the double count);
- model and cache totals are correct;
- the report does not claim latency, errors, nested-run recursion, or
  cross-project aggregation.

Run the identical fixture against `@tmustier/pi-usage-extension@0.3.2` only if
evaluating that alternative; its expected copied-branch count is one because it
deduplicates by timestamp plus total tokens.

### AST trial

First run the pinned structural and public-tool tests:

```bash
git clone https://github.com/mrclrchtr/supi.git
cd supi
git checkout 973acbd6e428c17eaff4aa776eb63df6ce198464
pnpm install --frozen-lockfile
pnpm vitest run \
  packages/supi-tree-sitter/__tests__/structure.test.ts \
  packages/supi-code-intelligence/__tests__/unit/app/extension-registration.test.ts \
  packages/supi-code-intelligence/__tests__/unit/tool/orientation/code-orientation-tool.test.ts \
  packages/supi-code-intelligence/__tests__/unit/tool/find/pattern-structured-search.test.ts
```

Use a fixture module containing nested symbols, aliased imports, named/default
exports, overloads, and the same identifier in comments and strings. With only
the read-only `code_*` tools enabled:

1. `code_orientation` must return symbol kinds and exact source ranges.
2. Structural `code_find` must exclude comment/string text that plain `rg` finds.
3. Imports and exports must preserve aliases and default/named distinction.
4. With the LSP binary removed from `PATH`, structural results must remain
   labeled structural and semantic requests must report unavailable—never grep
   fallback.
5. Modify the file after obtaining a `targetId`; reuse must reject as stale.
6. Record cold-start time, peak RSS, spawned processes, tool-schema tokens, and
   results with mutator tools disabled.

### Future compaction-eval acceptance test

Do not accept a package merely because its own compactor tests pass. A future
candidate must run a frozen corpus against upstream baseline and at least one
candidate, with the same model, temperature, prompt, and token budget. The corpus
must include conflicting decisions, resolved versus unresolved errors, renamed
files, large tool output, multilingual instructions, two consecutive
compactions, and a cross-session leakage canary. Required machine-readable
metrics are goal/constraint/file/error/open-loop recall, fabricated-fact count,
compression ratio, latency, tokens, and cost. A scorer shipped by the candidate
must be checked against human-labeled cases.

### Future model-doctor acceptance test

A credible doctor must pass these cases without printing secret material:

1. selected model differs from response model;
2. missing, expired, and valid credentials, with source precedence reported;
3. requested thinking level unsupported by the model;
4. context usage below, at, and above the compaction threshold;
5. configured router fallback versus provider-side model substitution;
6. offline mode, where configuration checks pass but live validation is clearly
   marked not run;
7. non-zero exit or typed failure when a required invariant is false.

Until a package can demonstrate those cases, “doctor” remains an unfilled
capability rather than a reason to adopt an adjacent status widget.
