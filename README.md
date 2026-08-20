# 1st-pi

[est7](https://github.com/est7) 的 [Pi](https://pi.dev) coding agent preset。

这是一个 Pi Package，用来统一打包和分发常用的 **extensions / skills / prompts / themes**。安装后，Pi 会自动加载本仓库资源以及声明的 bundled Pi packages。

> **Security:** Pi packages 拥有完整系统权限。Extensions 可以执行任意代码，skills 可以指示模型执行操作。安装第三方包前请审阅源码。

## 安装

需要 Pi `>=0.84.2`；本 preset 的最新 extension 集合使用该版本的 extension API。

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
| [pi-mcp-adapter](https://www.npmjs.com/package/pi-mcp-adapter) | MCP 协议适配 |
| [pi-everforest-tui](https://www.npmjs.com/package/pi-everforest-tui) | Everforest light/dark themes 与可选 TUI 增强 |
| [pi-session-name](https://www.npmjs.com/package/pi-session-name) | 自动生成会话标题并同步终端标题 |
| [@juicesharp/rpiv-ask-user-question](https://www.npmjs.com/package/@juicesharp/rpiv-ask-user-question) | 多问题、选项预览和自由输入的结构化提问 UI |
| [@narumitw/pi-goal](https://www.npmjs.com/package/@narumitw/pi-goal) | Session-scoped `/goal` 持续执行与完成/阻塞门禁；可选 experimental ordered-goal queue |
| [@ff-labs/pi-fff](https://www.npmjs.com/package/@ff-labs/pi-fff) | 本地 Rust 模糊文件/内容搜索与 `@` 自动补全；`find`/`grep` 支持 workspace-relative 约束和 workspace 外的绝对路径 |
| [pi-readseek](https://www.npmjs.com/package/pi-readseek) | Parser-backed code map/search、PDF index/view、definition/reference、hashline edit 与 workspace rename；其 edit 可进行带警告的 fuzzy anchor relocation，不等同于严格 stale rejection |
| [pi-btw](https://www.npmjs.com/package/pi-btw) | 不污染主上下文的并行 `/btw` 旁路对话 |
| [@mrclrchtr/supi-context](https://www.npmjs.com/package/@mrclrchtr/supi-context) | `/supi-context` 上下文组成与 token 占用报告 |
| [@tintinweb/pi-subagents](https://www.npmjs.com/package/@tintinweb/pi-subagents) | Claude Code 风格 sub-agents |
| [@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks) | Task tracking 与协作 |
| [@quintinshaw/pi-dynamic-workflows](https://www.npmjs.com/package/@quintinshaw/pi-dynamic-workflows) | 动态 workflows；3.x 的关键词只授权模型选择 workflow、不再强制触发；preset 默认关闭该关键词入口，仍可通过 `/workflows`、已保存 workflow slash command 或显式 `/workflows-trigger on` 启用 |

这些包位于普通 npm `dependencies`，安装 preset 时由 npm 获取，不会塞入 `1st-pi` tarball。`extensions/packages/*.ts` 是只负责调用 dependency extension entrypoint 的 thin adapters；因此依赖可以正常 hoist，同时 Pi manifest 只引用本包内稳定路径。FFF 也会由 npm 在 macOS、Linux 和 Windows 上选择正确的原生 binary。

当前 dependency extension 版本以 `package.json` 与 lockfile 为准；维护时使用 npm `latest` 稳定标签，并通过 `npm outdated` 确认没有落后版本。

Themes 以及 `pi-init` skill 是发布所需的静态资源，会从锁定依赖同步到本包。`pi-web-access` 从 0.14.0 起不再提供 `librarian` skill，preset 同步移除该过期副本，保留 extension 自身的搜索、抓取与 source-check surface。更新 dependencies 后运行：

```bash
npm run sync:resources
npm run check:resources
```

`prepack` 会执行相同校验，防止静态副本与依赖版本漂移。

TUI 与 tool ownership：

- `pi-everforest-tui`：全局主题、editor chrome、working/status/footer、Command Center 与 Theme Lab
- `@ff-labs/pi-fff`：preset 默认使用 `override` mode，由 FFF 接管 `find`、`grep` 与 `@` autocomplete
- `pi-readseek`：通过 `readseek.replacedTools` 接管 `read`、`edit`、`write`；`readSeek_grep` 仍可显式用于生成 edit-ready anchors，但 preset 会移除其“优先于 `grep`”提示，默认内容搜索仍由 FFF `grep` 负责
- Pi built-ins：继续负责 `bash`、`ls` 及其原生渲染
- `pi-mcp-adapter`：负责 MCP 工具与渲染
- Tasks、Subagents、Workflows、Goal、BTW、Context 与 Memory：继续使用各 package 自己的领域 UI

Workflow 关键词触发在首次加载 preset 时默认写为关闭；已有明确的 `on`/`off` 用户配置会保留，不会被 preset 覆盖。关闭关键词触发不影响 `/workflows` 及已保存 workflow 的 slash commands。

`pi-tool-display` 已移除，因为它会注册同名的 `read/edit/write/find/grep` overrides，与 Readseek/FFF 形成双重 owner。

要启用上述 Readseek ownership，在 `~/.pi/agent/settings.json` 中加入：

```json
{
  "readseek": {
    "replacedTools": ["read", "edit", "write"]
  }
}
```

`grep` 不加入该数组，因为它由 FFF 接管。修改后运行 `/reload`。

## Preset maintenance skill

添加或移除 community extension 时使用：

```text
/skill:add-extension-to-1st-agent
```

该 SOP 覆盖 license/compatibility/ownership gate、thin adapter、README 同步、hoisted npm 安装、native binary、tarball size 与 clean-room smoke tests。

## 发布

```bash
npm login
npm publish
```

发布前建议检查包内容：

```bash
npm pack --dry-run
```

## License

MIT
