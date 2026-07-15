# Forum and popular-package candidate review

Date: 2026-07-15

## Sources reviewed

Local clippings under:

```text
~/Documents/OpenKnowledge/NewEra/brain/external-sources
```

Including the Pi package popularity snapshot from `pi.dev/packages`. Forum claims were treated as leads, not authoritative facts. Candidate metadata and behavior were checked against current npm tarballs, package READMEs, and linked repositories where practical.

Popularity is only a discovery signal. It does not prove compatibility, safety, maintenance quality, or fit for `1st-pi`.

## What `1st-pi` already covers

| Capability | Current package | Notes |
|---|---|---|
| Web search/fetch/GitHub/PDF/video | `pi-web-access` | Makes `pi-search`, `pi-grok-search`, `pi-smart-fetch`, Tavily/PDF skills, and most single-provider search packages redundant by default. |
| MCP | `pi-mcp-adapter` | Already covered. |
| Subagents | `@tintinweb/pi-subagents` | Do not also install `pi-subagents`, `@gotgenes/pi-subagents`, `pi-crew`, or another agent runtime. |
| Tasks | `@tintinweb/pi-tasks` | Do not add another todo/task system by default. |
| Workflows/research/review fan-out | `@quintinshaw/pi-dynamic-workflows` | Already has live progress and `/workflows` TUI. |
| Session naming | `pi-session-name` | Already covered. |
| Themes/editor/footer | `pi-everforest-tui` | Avoid powerline/Zentui/Archimedes-style surface owners. |
| Project initialization | `pi-init` | Already covered. |

## Candidate summary

### A. High-value additions worth a compatibility trial

#### `pi-tool-display`

**Purpose:** compact OpenCode-style read/grep/find/bash/edit/write rendering, adaptive split/unified diffs, output truncation, presets, and settings UI.

**Why consider it:** tool rendering is the largest remaining visible TUI gap. It exposes ownership toggles and a public consumer adapter, making it safer to compose than broader UI suites.

**Fit:** `1st-pi` dependency. It must not be copied into `pi-everforest-tui`.

**Trial configuration:** `balanced` preset; initially disable its native user-message box; do not load any other tool/diff renderer.

**Conflict group:** `pi-claude-style-tools`, `pi-diff`, `pi-pretty`, other built-in tool owners.

---

#### `@juicesharp/rpiv-ask-user-question`

**Purpose:** model-callable structured clarification UI with multi-question tabs, single/multi-select, previews, notes, free-text fallback, and review-before-submit.

**Why consider it:** adds a genuinely new interaction primitive and reduces agent guessing. It is not replaced by tasks, workflows, or Everforest styling.

**Fit:** direct `1st-pi` dependency. Everforest should theme it through normal theme tokens, not fork it.

**Cost/risk:** adds one agent tool and an `rpiv-config` dependency. Optional i18n is not required.

---

#### `@paulmupeters/pi-brainstorm`

**Purpose:** explicit read-only brainstorming mode, decision-oriented brief generation, editable summary, Markdown export, and replacement of future LLM context with the reviewed brief.

**Why consider it:** distinct from implementation planning. It creates a safe exploratory space and turns a long discussion into a compact decision artifact.

**Fit:** direct `1st-pi` dependency.

**Constraint:** brainstorm mode permits only `read`; it is intentionally more restrictive than a normal plan mode. Do not install another mode extension until coexistence is tested.

**Conflict group:** `@narumitw/pi-plan-mode`, Plannotator plan mode, other tool-restriction modes.

---

#### `@narumitw/pi-goal`

**Purpose:** session-scoped goal continuation with explicit completion/blocker tools, pause/resume/clear, token budgets, stale-goal guards, and `agent_settled` continuation.

**Why consider it:** the smallest current goal implementation that fits the curated preset. It complements tasks/workflows without introducing another task board or project-wide goal database.

**Fit:** direct `1st-pi` dependency.

**Why this variant:**

- `pi-goal-x` is powerful but duplicates tasks, questionnaires, contracts, auditor UI, and project state already covered elsewhere.
- `pi-until-done` carries a larger workflow/mise opinion.
- `pi-codex-goal` is capable but has a broader implementation and three model tools.
- `@narumitw/pi-goal` exposes one command and two lifecycle tools, and targets Pi 0.80.6+.

**Conflict group:** install one goal package only.

---

### B. Valuable, but requires an explicit product decision

#### `pi-observational-memory`

**Purpose:** session continuity across compactions using background observation/reflection, source-backed recall, and precomputed compaction memory.

**Best for:** long, multi-day sessions where design rationale and decisions must survive repeated compaction.

**Advantages:** focused scope, no runtime dependencies, memory stored with the session branch, configurable model and thresholds.

**Risks:** changes compaction semantics, triggers background model work, consumes additional tokens, and V3 intentionally does not read V2 memory/settings.

**Recommendation:** preferred memory trial for `1st-pi`, but not bundle blindly. Test cache behavior, provider cost, compaction quality, session tree, and workflows first.

---

#### `pi-hermes-memory`

**Purpose:** cross-session global/project memory, FTS5 session search, failure/correction memory, procedural skill authoring, background review, consolidation, and secret scanning.

**Best for:** users who explicitly want a durable personal memory system across projects and sessions.

**Advantages:** broader than observational memory, policy-only prompt mode, session search, secret scanning, and extensive claimed test coverage.

**Risks:** much larger authority and persistence surface; can store incorrect conclusions, creates/updates skills, indexes session history, and performs background model calls. Its behavior is no longer session-local.

**Recommendation:** offer as a future optional profile, not a default preset dependency. Do not install together with observational memory until their hooks and prompts are proven compatible.

**Memory decision:** choose none, observational, or Hermes—never both by default.

---

#### `pi-rewind`

**Purpose:** automatic Git-ref checkpoints, `/rewind`, diff preview, files/conversation restore modes, redo stack, and branch safety.

**Why consider it:** high-value recovery when agents make destructive or misguided edits.

**Advantages:** MIT, small dependency-free package, files/conversation separation, no second Git working tree required.

**Risks:** creates refs every changed turn, restores filesystem and session state, auto-prunes checkpoint refs, and directly interacts with `/tree`, `/fork`, and dirty workspaces. This requires destructive-operation testing before default inclusion.

**Variant choice:** prefer `pi-rewind` for an MIT preset trial. `@ayulab/pi-rewind` is richer/current but GPL-3.0, making bundled redistribution and license obligations less suitable for the MIT `1st-pi` preset.

---

#### `pi-btw`

**Purpose:** a parallel, user-facing side conversation with its own Pi sub-session, model/thinking overrides, overlay, and explicit inject/summarize handoff.

**Why consider it:** useful for clarifying questions or exploring tangents while the main agent continues working.

**Risks:** another active model session, separate token/cost stream, own modal/editor focus handling, and overlap in mental model with subagents.

**Recommendation:** good opt-in productivity addition; do not enable automatically until editor-overlay coexistence with Everforest and subagent FleetView is tested.

---

#### `@ff-labs/pi-fff`

**Purpose:** local Rust-native fuzzy file/content search, pre-indexing, frecency, Git-aware ranking, multi-pattern grep, and FFF-backed `@` autocomplete.

**Why consider it:** local-only, no shell/network/telemetry in the extension, and default mode adds tools without replacing Pi built-ins.

**Risks:** native platform dependency, background index, three additional model tools, and possible confusion between `grep/find` and `ffgrep/fffind`.

**Recommendation:** trial in default `tools-and-ui` mode. Do not use `override` initially.

---

#### `pi-markdown-preview`

**Purpose:** terminal image, browser, HTML/PNG, and PDF preview/export for Markdown, LaTeX, Mermaid, code, and diffs.

**Why consider it:** particularly useful in Ghostty for reviewing plans, reports, diagrams, and generated documentation.

**Risks:** requires Pandoc and Chromium for the primary experience; PDF needs a LaTeX engine; package is about 2.3 MB and exported artifacts broaden filesystem behavior.

**Recommendation:** optional developer-experience profile, not a universal default.

---

#### `@plannotator/pi-extension`

**Purpose:** browser-based plan review, annotations, approval loops, plan diff, code review, Markdown annotation, and a shared event API.

**Why consider it:** high-quality human approval surface and line-level feedback that terminal-only plan mode does not offer.

**Risks:** about 41 MB unpacked, launches a browser UI, overlaps brainstorm/plan/review workflows, and changes tools by phase.

**Recommendation:** optional “visual review” profile. If selected, do not also enable a second plan-mode extension by default.

---

#### `@gotgenes/pi-permission-system`

**Purpose:** deterministic allow/ask/deny gates for tools, Bash, paths, MCP, skills, external directories, and subagents, including fail-closed Bash parsing.

**Why consider it:** strongest general safety candidate in the popularity list.

**Risks and integration issue:** its missing-policy fallback is conservative (`ask`), so bundling without a carefully installed policy could flood users with prompts. Native child-session integration targets `@gotgenes/pi-subagents`, while `1st-pi` currently uses `@tintinweb/pi-subagents`; parent/child prompt forwarding must be tested. It also expects config in package-specific global/project paths.

**Recommendation:** do not bundle until `1st-pi` has an intentional default policy and current-subagent compatibility is demonstrated. Strong future candidate.

---

### C. Specialist candidates, not suitable as universal defaults

#### `pi-lens`

Real-time LSP, lint, format, type-check, structural analysis, symbol search, diagnostics, security scans, and edit guardrails. Powerful but approximately 46 MB unpacked with aggressive write/edit hooks and many external language tools. Better as an opt-in “heavy code intelligence” profile.

#### `pi-shazam`

Seven tree-sitter/LSP structural tools: overview, lookup, impact, verify, changes, format, and rename. More bounded than `pi-lens`, but still adds many tools and native/language-server dependencies. Consider after comparing it against `pi-lens` on real repositories.

#### `pi-readseek`

Hash-anchored read/edit/grep/write plus structural map/search/ref/rename tools. Built-ins remain unless explicitly replaced. Adds ten tools and a native binary with Apache/LGPL licensing. Do not add while the preset still uses stock file tools unless a deliberate anchored-edit migration is chosen.

#### `pi-webdav-sync`

Backs up selected `~/.pi/agent` files and packages through WebDAV. Useful for an individual, but archives may include `auth.json`, `models.json`, and `mcp.json` without client-side encryption. Do not bundle in a public preset; document as an optional personal tool.

#### Telegram bridges

Candidates mentioned: `pi-telebridge`, `@bytesbrains/pi-telegram-bridge`, `badlogic/pi-telegram`, `jalyfeng/pi-telegram-plus`, TelePi, and `@llblab/pi-telegram`.

Remote control is deployment-specific, expands the attack surface, introduces bot-token/session-lifecycle concerns, and has multiple mutually exclusive architectures. Do not bundle. If requested later, conduct a dedicated security and reliability comparison.

#### Web/IDE companions

- `@agegr/pi-web`: browser UI/configuration companion; about 26 MB, not a normal Pi package manifest.
- Pendant VS Code extension: external IDE integration.
- Pi switch tools: provider/model management outside the preset.

Document them as optional companions rather than bundling them.

## Explicitly avoid or treat as alternatives

| Package/group | Decision | Reason |
|---|---|---|
| `context-mode` | Do not add by default | Elastic-2.0, large sandbox/index system, intercepts outputs, and forum reports describe lost context from insufficient expansion. |
| `@hypabolic/pi-hypa`, `pi-lean-ctx` | Defer | Deterministic context compression is promising but rewrites core tool behavior/evidence. Needs a separate correctness bake-off. |
| `pi-nano-context` | Do not add | Duplicates Everforest context/footer work. |
| `pi-powerline-footer` | Do not add | Replaces editor/footer and conflicts with Everforest ownership. |
| Curated theme packs | Do not add | The preset intentionally owns its Everforest theme identity. |
| `pi-search`, `pi-grok-search`, `pi-smart-fetch`, single-provider web search | Do not add | Mostly redundant with bundled `pi-web-access`. |
| Tavily/PDF extraction skills | Do not add | Bundled web access already covers these capabilities. |
| `pi-ace-tool` | Do not default | Uploads changed code chunks to an Augment-compatible remote API; privacy and provider coupling require explicit user choice. Repository also lacked an explicit detected license in the review. |
| `pi-fast-context` | Defer | Small/community-local option with limited adoption; compare against FFF/Shazam first. |
| `pi-image-gen` | Optional only | Product/design-specific capability, not a coding-agent baseline. |
| `@juicesharp/rpiv-advisor`, `pi-simplify` | Defer | Existing dynamic workflows and review skills already cover second-opinion and review flows. |
| `@feniix/pi-sequential-thinking` | Do not default | Adds another reasoning protocol/tool while models already expose thinking levels and workflows. |
| `pi-goal-x`, `pi-until-done`, `pi-codex-goal` | Alternatives only | Choose one goal runtime; current recommendation is `@narumitw/pi-goal`. |
| `pi-subagents`, `@gotgenes/pi-subagents`, `pi-crew` | Do not add | Current Tintinweb subagent runtime is already selected. |
| Additional todo/task packages | Do not add | Current Tintinweb task package already owns this domain. |
| Broad harness/skill bundles (`bigpowers`, `gentle-pi`, `superpowers-zh`, etc.) | Do not add | They replace the preset's curation philosophy and add large prompt/skill surfaces. |

## Recommended decision set

### Batch 1: recommended compatibility bake-off

These have the best value-to-overlap ratio:

1. `pi-tool-display`
2. `@juicesharp/rpiv-ask-user-question`
3. `@paulmupeters/pi-brainstorm`
4. `@narumitw/pi-goal`

No package manifest should change until they are loaded together with the current preset and tested for command/tool collisions, editor/footer ownership, reload behavior, and prompt-tool overhead.

### Batch 2: choose after explicit decisions

5. Memory: `pi-observational-memory` **or** `pi-hermes-memory` **or neither**
6. Recovery: trial `pi-rewind`
7. Search: trial `@ff-labs/pi-fff` in non-override mode
8. Side conversation: optional `pi-btw`

### Optional profiles rather than defaults

- Visual review: `@plannotator/pi-extension`
- Rich documents: `pi-markdown-preview`
- Heavy code intelligence: compare `pi-lens` vs `pi-shazam`
- Remote access: choose one Telegram/Web companion only after a dedicated review
- Safety policy: `@gotgenes/pi-permission-system` after configuration and subagent integration design

## Proposed default preset if all Batch 1 trials pass

```text
Current 1st-pi packages
+ pi-tool-display
+ @juicesharp/rpiv-ask-user-question
+ @paulmupeters/pi-brainstorm
+ @narumitw/pi-goal
```

This adds four distinct capabilities without replacing existing task, agent, workflow, web, MCP, or Everforest ownership:

- readable tool output;
- structured clarification;
- safe decision exploration;
- persistent goal completion.

## Decision questions

1. Should memory be session-focused (`pi-observational-memory`), cross-session (`pi-hermes-memory`), or omitted?
2. Should Git checkpoint/rewind be on for every user by default, or remain opt-in?
3. Is a parallel `/btw` side conversation worth the extra model/session complexity?
4. Should local FFF indexing and three extra search tools be default or optional?
5. Do you want browser-based visual review (`Plannotator`) in the core preset or as a documented optional profile?
6. Should `1st-pi` eventually ship an opinionated security policy so a permission system can be enabled without prompt spam?
