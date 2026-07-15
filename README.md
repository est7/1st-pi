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

### npm（发布后）

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
├── prompts/              # Markdown prompt templates
└── themes/               # JSON themes
```

## 添加自己的资源

- `extensions/*.ts`：自定义工具、命令、事件和 UI
- `skills/<name>/SKILL.md`：可自动发现或通过 `/skill:name` 调用的技能
- `prompts/*.md`：通过 `/文件名` 调用的提示词模板
- `themes/*.json`：Pi 主题

修改资源后，在 Pi 中运行 `/reload`，或重新执行：

```bash
pi -e .
```

## 内置依赖

| 包 | 功能 |
|---|---|
| [pi-web-access](https://www.npmjs.com/package/pi-web-access) | Web 搜索、URL/GitHub/YouTube 访问及 librarian skill |
| [pi-init](https://www.npmjs.com/package/pi-init) | 生成或更新 `AGENTS.md` 的 init skill |
| [pi-xai](https://www.npmjs.com/package/pi-xai) | xAI Grok Build provider / Responses API |
| [pi-mcp-adapter](https://www.npmjs.com/package/pi-mcp-adapter) | MCP 协议适配 |
| [pi-cache-optimizer](https://www.npmjs.com/package/pi-cache-optimizer) | Prompt/KV cache 优化 |
| [pi-session-name](https://www.npmjs.com/package/pi-session-name) | 自动生成会话标题并同步终端标题 |
| [@tintinweb/pi-subagents](https://www.npmjs.com/package/@tintinweb/pi-subagents) | Claude Code 风格 sub-agents |
| [@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks) | Task tracking 与协作 |
| [@quintinshaw/pi-dynamic-workflows](https://www.npmjs.com/package/@quintinshaw/pi-dynamic-workflows) | 动态 workflows |

这些包位于 `dependencies` 和 `bundledDependencies`，并由 `package.json` 的 `pi` manifest 显式加载资源。

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
