# 1st-pi

[est7](https://github.com/est7) 的 [Pi](https://pi.dev) coding agent preset。

这是一个 Pi Package，用来统一打包和分发常用的 **extensions / skills / prompts / themes**。安装后，Pi 会自动加载本仓库资源以及声明的 bundled Pi packages。

> **Security:** Pi packages 拥有完整系统权限。Extensions 可以执行任意代码，skills 可以指示模型执行操作。安装第三方包前请审阅源码。

## 安装

需要 Pi `>=1.1.0`；`@tintinweb/pi-subagents` 0.20 起要求该版本，`pi-btw` 0.7 起要求 `>=0.85.1`。`pi-web-access` 0.44 要求 Node `>=22.19.0`。

macOS 上 `pi-readseek` 的原生二进制动态链接 Homebrew 库，缺少任意一个时 `read`/`edit`/`write` 会因 dyld 报错失败（0.11 起新增 `ftxui`，0.12.1 起新增 `re2`）：

```bash
brew install abseil fmt ftxui gettext glib openssl@4 re2 vips xxhash
```

preset 的 readseek adapter 会在启动时读取该二进制的 Mach-O load commands，若有 dylib 缺失，就在 session 开始时给出 warning 和对应的 `brew install` 命令（会遵循 `READSEEK_BINARY` 覆盖）。

### GitHub

```bash
pi install git:github.com/est7/1st-pi
# 或
pi install https://github.com/est7/1st-pi
```

### 本地开发

```bash
pi install /absolute/path/to/1st-pi
# 当前目录
pi install .
```

### npm

```bash
pi install npm:1st-pi
```

仅在当前会话试用，不写入 settings：

```bash
pi -e .
pi -e git:github.com/est7/1st-pi
```

安装为项目级依赖，写入 `.pi/settings.json`：

```bash
pi install -l .
```

## 管理

```bash
pi list
pi config
pi update --extensions
pi remove git:github.com/est7/1st-pi
```

## 目录结构

```text
1st-pi/
├── package.json          # Pi package manifest
├── extensions/           # 本地 UI 与 community package thin adapters
├── skills/               # skills/<name>/SKILL.md
├── prompts/              # Markdown prompt templates
└── themes/               # 从 pi-everforest-tui 同步并校验的 theme resources
```

## 添加自己的资源

- `extensions/*.ts`：自定义工具、命令、事件和 UI
- `skills/<name>/SKILL.md`：可自动发现或通过 `/skill:name` 调用的技能
- `prompts/*.md`：通过 `/文件名` 调用的提示词模板

修改资源后，在 Pi 中运行 `/reload`，或重新执行：

```bash
pi -e .
```

## Everforest themes

本 preset 通过独立 package [`pi-everforest-tui`](https://github.com/est7/pi-everforest-tui) 提供两个 Ghostty Everforest Soft 风格的 Pi TUI theme：

- `everforest-tui-dark`
- `everforest-tui-light`

Preset 默认开启以下 TUI 增强，session 中持久化的个人选择优先于 preset 默认值：

- phase-aware working indicator
- 仅在工作期间出现的 status（idle 不显示，不重复 model）
- 响应式 cockpit footer 与完整 segment 的 extension statuses
- 连续 Everforest 彩虹 editor 边框与具名 session badge

相关命令：

```text
/everforest             # 搜索全部 extension、prompt、skill commands
/everforest-tui         # 打开交互式 TUI 设置
/everforest-theme-lab   # 预览主题语义色、Markdown、diff、syntax 与 thinking states
```

也可直接执行 `/everforest-tui all on|off` 或针对 `indicator`、`status`、`footer`、`rainbow` 单独设置。

可在 `/settings` 中手动选择 theme。要像 Ghostty 一样随终端背景自动切换，在 Pi 的 `settings.json` 中设置：

```json
{
  "theme": "everforest-tui-light/everforest-tui-dark"
}
```

斜杠前是 light theme，斜杠后是 dark theme。

## Custom header

`extensions/custom-header.ts` 使用 `1st-agent` ASCII wordmark 替换 Pi 默认启动 header。需要临时恢复默认 header 时运行：

```text
/builtin-header
```

## 内置依赖

| 包 | 功能 |
|---|---|
| [pi-web-access](https://www.npmjs.com/package/pi-web-access) | Web 搜索、URL/GitHub/YouTube 访问、来源检查与可配置 provider routing |
| [pi-init](https://www.npmjs.com/package/pi-init) | 生成或更新 `AGENTS.md` 的 init skill |
| [pi-everforest-tui](https://www.npmjs.com/package/pi-everforest-tui) | Everforest light/dark themes 与可选 TUI 增强 |
| [pi-session-name](https://www.npmjs.com/package/pi-session-name) | 自动生成会话标题并同步终端标题 |
| [@pi-kaush/pi-tool-call-markers](https://www.npmjs.com/package/@pi-kaush/pi-tool-call-markers) | 紧凑工具调用标记、连续调用分组，以及仅用于显示的相邻 thinking block 合并 |
| [@juicesharp/rpiv-ask-user-question](https://www.npmjs.com/package/@juicesharp/rpiv-ask-user-question) | 多问题、选项预览和自由输入的结构化提问 UI |
| [@narumitw/pi-goal](https://www.npmjs.com/package/@narumitw/pi-goal) | Session-scoped `/goal` 持续执行与完成/阻塞门禁；可选 experimental ordered-goal queue |
| [@ff-labs/pi-fff](https://www.npmjs.com/package/@ff-labs/pi-fff) | 本地 Rust 模糊文件/内容搜索与 `@` 自动补全；`find`/`grep` 支持 workspace-relative 约束和 workspace 外的绝对路径 |
| [pi-readseek](https://www.npmjs.com/package/pi-readseek) | Parser-backed code map/search、PDF index/view、definition/reference、syntax check、hashline edit 与 workspace rename；caption/OCR/object detection 只在显式调用对应工具时使用本地已安装模型，不会自动下载；其 edit 可进行带警告的 fuzzy anchor relocation，不等同于严格 stale rejection |
| [pi-btw](https://www.npmjs.com/package/pi-btw) | 不污染主上下文的并行 `/btw` 旁路对话 |
| [@mrclrchtr/supi-context](https://www.npmjs.com/package/@mrclrchtr/supi-context) | `/supi-context` 上下文组成与 token 占用报告 |
| [@tintinweb/pi-subagents](https://www.npmjs.com/package/@tintinweb/pi-subagents) | Claude Code 风格 sub-agents |
| [@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks) | Task tracking 与协作 |
| [@quintinshaw/pi-dynamic-workflows](https://www.npmjs.com/package/@quintinshaw/pi-dynamic-workflows) | 动态 workflows；3.x 的关键词只授权模型选择 workflow、不再强制触发；preset 默认关闭该关键词入口，仍可通过 `/workflows`、已保存 workflow slash command 或显式 `/workflows-trigger on` 启用 |

这些包位于普通 npm `dependencies`，安装 preset 时由 npm 获取，不会塞入 `1st-pi` tarball。`extensions/packages/*.ts` 是只负责调用 dependency extension entrypoint 的 thin adapters；因此依赖可以正常 hoist，同时 Pi manifest 只引用本包内稳定路径。FFF 也会由 npm 在 macOS、Linux 和 Windows 上选择正确的原生 binary。

当前 dependency extension 版本以 `package.json` 与 lockfile 为准；维护时使用 npm `latest` 稳定标签，并运行 `npm run check:outdated` 确认没有落后版本。该检查会指出 `package.json` 范围挡住最新版的依赖（例如 `^0.20.0` 不包含 0.21.0，`npm install` 不会提示），以及 lockfile 落后于范围的依赖。

Themes 以及 `pi-init` skill 是发布所需的静态资源，会从锁定依赖同步到本包。`pi-web-access` 从 0.14.0 起不再提供 `librarian` skill，preset 同步移除该过期副本，保留 extension 自身的搜索、抓取与 source-check surface。更新 dependencies 后运行：

```bash
npm run sync:resources
npm run check:resources
```

`prepack` 会执行相同校验，防止静态副本与依赖版本漂移。

TUI 与 tool ownership（每个工具的确切 owner 以 `scripts/smoke-surface.json` 的 `owners` 为准，smoke 会校验）：

- `pi-everforest-tui`：全局主题、editor chrome、working/status/footer、Command Center 与 Theme Lab
- `@ff-labs/pi-fff`：`find`、`grep` 与 `@` autocomplete（`override` mode）
- `pi-readseek`：`read`、`edit`、`write` 及 `readSeek_*`；preset 移除 `readSeek_grep` 的“优先于 `grep`”提示，默认内容搜索仍由 FFF `grep` 负责
- `@pi-kaush/pi-tool-call-markers`：负责折叠工具调用、分组、提问结果、thinking labels 与用户 `!` bash 的显示；不注册工具，不改变工具执行或存储的消息。`Ctrl+O` 恢复各工具原有的展开渲染，`/toggle-info` 在当前 session 隐藏或恢复工具调用与 thinking。该包使用受保护的 Pi 内部 prototype adapters，升级 Pi 后需复验；不支持的内部结构回退到原生显示。无原生 binary、网络请求或持久配置写入，license 为 MIT
- Pi built-ins：`bash`、`ls` 的执行及工具展开时的原生渲染
- Pi 内置 MCP：负责 MCP servers、`/mcp` 与 `pi mcp add/list`，读取 `~/.pi/agent/mcp.json` 与 `.pi/mcp.json`。preset 不再捆绑 `pi-mcp-adapter`；原先放在 `.mcp.json` 或 `~/.config/mcp/mcp.json` 的 servers 需要移入上述文件。曾加载 0.3.0 的用户，`settings.json` 的 `extensions` 中可能残留 adapter 写入的 `-builtin:mcp`，需在 `pi config` → Built-in 重新开启 MCP
- Tasks、Subagents、Workflows、Goal、BTW、Context 与 Memory：继续使用各 package 自己的领域 UI；`workflow` tool 只由 `@quintinshaw/pi-dynamic-workflows` 提供

`pi-tool-display` 已移除，因为它会注册同名的 `read/edit/write/find/grep` overrides，与 Readseek/FFF 形成双重 owner。

Tool Call Markers 默认分组相邻调用并折叠工具详情；可用 `PI_TOOL_CALL_MARKERS_COLLAPSE_PARALLEL=0` 关闭同一消息内的调用分组，或用 `PI_ALWAYS_EXPANDED_TOOL_CALL_MARKERS=edit,write` 保持指定工具展开。preset 保留这些环境变量选择。移除 preset 后无额外配置需要清理；若曾单独安装该包，请在 `pi config` 中禁用单独入口，避免重复加载。

### Preset 默认值

以下默认值由 `extensions/packages/preset-defaults.ts` 统一管理：仅在用户未做选择时写入对应 package 自己的全局配置文件（保留同文件的其他字段，格式损坏的文件不动）；全局、项目级或环境变量中的任何显式值都优先，且不会被覆盖。写入后各 package 的命令和诊断（如 `/fff-mode`）都如实反映配置来源。

| 设置 | preset 默认 | 写入位置 | 视为显式选择的来源 |
|---|---|---|---|
| FFF `mode` | `override` | `~/.pi/agent/pi-fff.json` | `--fff-mode`、`PI_FFF_MODE`、`pi-fff.json` 的 `mode` |
| readseek `overrideTools` | `["read","edit","write"]` | `~/.pi/agent/settings.json` 的 `readseek` | 全局或项目 `.pi/settings.json` 中任意 `readseek.overrideTools` 数组（含 `[]`） |
| pi-subagents `workflowsEnabled` | `false` | `~/.pi/agent/subagents.json` | 全局或项目 `subagents.json` 中的 `true`/`false` |
| Workflow `keywordTriggerEnabled` | `false` | workflow 全局 `settings.json` | 全局或项目 workflow 设置中的 `true`/`false` |

- readseek：仅当原生二进制的 dylib 齐全时才写入默认值，否则 `read/edit/write` 保持 Pi built-ins，并提示 `brew install`。要保留 built-ins，设置 `"readseek": { "overrideTools": [] }`；`grep` 不应加入该数组，它由 FFF 接管
- pi-subagents：关闭其 `SubagentWorkflow`，避免每次启动出现 workflow 冲突 warning（见 [tintinweb/pi-subagents#283](https://github.com/tintinweb/pi-subagents/issues/283)）；设为 `true` 可强制两套 workflow 并存，不推荐
- Workflow 关键词触发关闭不影响 `/workflows` 及已保存 workflow 的 slash commands
- 修改上述配置后运行 `/reload`

## Preset maintenance skill

添加或移除 community extension 时使用：

```text
/skill:add-extension-to-1st-agent
```

该 SOP 覆盖 license/compatibility/ownership gate、thin adapter、README 同步、hoisted npm 安装、native binary、tarball size 与 clean-room smoke tests。

`npm run smoke` 在隔离的 `PI_CODING_AGENT_DIR` 中通过 Pi SDK 加载 preset，不访问网络、不调用模型，检查：

- 扩展加载无错误且与 `package.json#pi.extensions` 一致；工具无重名 owner
- 工具 prompt guidelines 不出现重复的 `name: name:` 前缀，`readSeek_grep` 不提示优先于 `grep`
- `PERSISTED_PRESET_DEFAULTS` 中每个默认值：全新安装时写入并生效（`read/edit/write` 归 readseek，`grep/find` 归 FFF）；已有显式值（全局、项目级、`PI_FFF_MODE`）时不覆盖、不写全局文件，且显式选择真正生效；同文件其他字段保留；格式损坏的配置文件原样不动
- `pi-tasks` 与 `pi-subagents` 的 RPC 协议版本匹配
- readseek 在临时文件上执行 read → anchored edit → write，以及 macOS dylib 检测与 `otool -L` 一致
- 工具、命令集合及每个工具的 owner（`owners`）与 `scripts/smoke-surface.json` 快照一致，该快照是 tool ownership 的权威记录；有意变更时用 `npm run smoke -- --update` 更新快照，并在 diff 中审阅

## 发布

```bash
npm login
npm publish
```

发布前建议运行检查并确认包内容：

```bash
npm run check:outdated
npm run smoke
npm pack --dry-run
```

## License

MIT
