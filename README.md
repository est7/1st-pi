# 1st-pi

[est7](https://github.com/est7) 的 [Pi](https://pi.dev) coding agent preset。

这是一个 Pi Package，用来统一打包和分发常用的 **extensions / skills / prompts / themes**。安装后，Pi 会自动加载本仓库资源以及声明的 bundled Pi packages。

> **Security:** Pi packages 拥有完整系统权限。Extensions 可以执行任意代码，skills 可以指示模型执行操作。安装第三方包前请审阅源码。

## 安装

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
├── extensions/           # TypeScript/JavaScript extensions
├── skills/               # skills/<name>/SKILL.md
└── prompts/              # Markdown prompt templates
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
| [pi-web-access](https://www.npmjs.com/package/pi-web-access) | Web 搜索、URL/GitHub/YouTube 访问及 librarian skill |
| [pi-init](https://www.npmjs.com/package/pi-init) | 生成或更新 `AGENTS.md` 的 init skill |
| [pi-mcp-adapter](https://www.npmjs.com/package/pi-mcp-adapter) | MCP 协议适配 |
| [pi-everforest-tui](https://www.npmjs.com/package/pi-everforest-tui) | Everforest light/dark themes 与可选 TUI 增强 |
| [pi-session-name](https://www.npmjs.com/package/pi-session-name) | 自动生成会话标题并同步终端标题 |
| [pi-tool-display](https://www.npmjs.com/package/pi-tool-display) | 紧凑工具输出与自适应 diff 渲染 |
| [@juicesharp/rpiv-ask-user-question](https://www.npmjs.com/package/@juicesharp/rpiv-ask-user-question) | 多问题、选项预览和自由输入的结构化提问 UI |
| [@narumitw/pi-goal](https://www.npmjs.com/package/@narumitw/pi-goal) | Session-scoped `/goal` 持续执行与完成/阻塞门禁 |
| [pi-observational-memory](https://www.npmjs.com/package/pi-observational-memory) | 跨压缩保留 observations/reflections 的长会话记忆 |
| [@ff-labs/pi-fff](https://www.npmjs.com/package/@ff-labs/pi-fff) | 本地 Rust 模糊文件/内容搜索与 `@` 自动补全 |
| [pi-btw](https://www.npmjs.com/package/pi-btw) | 不污染主上下文的并行 `/btw` 旁路对话 |
| [@mrclrchtr/supi-context](https://www.npmjs.com/package/@mrclrchtr/supi-context) | `/supi-context` 上下文组成与 token 占用报告 |
| [@tintinweb/pi-subagents](https://www.npmjs.com/package/@tintinweb/pi-subagents) | Claude Code 风格 sub-agents |
| [@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks) | Task tracking 与协作 |
| [@quintinshaw/pi-dynamic-workflows](https://www.npmjs.com/package/@quintinshaw/pi-dynamic-workflows) | 动态 workflows |

这些包均位于 `dependencies`，并由 `package.json` 的 `pi` manifest 显式加载资源。大多数包同时随 preset tarball 分发；`@ff-labs/pi-fff` 不预打包，以便 npm 在 macOS、Linux 和 Windows 上选择正确的原生 binary。

TUI surface ownership：

- `pi-everforest-tui`：全局主题、editor chrome、working/status/footer、Command Center 与 Theme Lab
- `pi-tool-display`：唯一的内置 tool/diff renderer
- Tasks、Subagents、Workflows、Goal、BTW、Context 与 Memory：继续使用各 package 自己的领域 UI

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
