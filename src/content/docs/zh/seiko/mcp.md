---
title: MCP server
description: 用 seiko-mcp 把安装根暴露给 MCP 客户端。
---

`seiko-mcp` 是 stdio 上的 MCP server。它与 `sk` 共用同一个库，因此读写同一套安装根、存储与锁。它随 Release 归档发布，并与 `sk` 一起安装。

## 运行

```bash
seiko-mcp --root /path/to/root
```

| 选项 | 说明 |
| --- | --- |
| `--root <path>` | 默认安装根。缺省为当前目录，而不是最近的 `seiko.conf`。 |
| `--allow-mutations` | 注册变更工具。不传时 server 只读。 |
| `--allowed-root <path>` | 可重复。变更工具的 root 必须位于这些目录之下。 |
| `--allowed-store <path>` | 可重复。启用白名单时，变更的 store 必须是默认 store 或位于这些目录之下。 |
| `-h`、`--help` | 显示用法。 |
| `-V`、`--version` | 打印构建版本。 |

server 通过 stdio 使用行分隔 JSON-RPC，协议版本为 `2025-06-18`。`initialize` 返回的 `serverInfo` 带有二进制名与和 `--version` 相同的版本。

## 工具

只读工具：

| 工具 | 用途 |
| --- | --- |
| `list` | 从锁列出已安装的 sei。 |
| `search` | 在配置的索引里搜索 sei 名。 |
| `info` | 版本、依赖与构件数。 |
| `lock` | 返回当前锁文件。 |
| `source_list` | 已配置的源。 |
| `config_get` | 读取安装根配置。 |
| `cache_status` | 存储构件与未完成下载数量。 |
| `cache_verify` | 校验存储中的构件。 |
| `why` | 到某个 sei 的依赖链。 |
| `outdated` | 范围内与整体的新版本。 |

只有带 `--allow-mutations` 才注册变更工具：

| 工具 | 用途 |
| --- | --- |
| `add` | 添加直接声明并同步。 |
| `remove` | 删除直接声明并同步。 |
| `update` | 更新直接声明并同步。 |
| `sync` | 解析并部署 sei。 |
| `rollback` | 恢复上一代。 |
| `source_add`、`source_remove` | 修改源。 |
| `config_set` | 写入配置。 |
| `cache_clean` | 删除未被引用的构件。 |

每个变更工具都必须显式传 `root`；server 不会自行推断。只读工具的 `root` 可选，且不受白名单限制。启用 `--allowed-root` 后，变更 root 在解析符号链接后必须等于允许目录或位于其下。server 与 `sk` 共用安装根锁，因此变更不会与 CLI 同步并发冲突。

## 客户端配置

Claude Code：

```bash
claude mcp add seiko -- seiko-mcp --root /path/to/root
```

Claude Desktop（`claude_desktop_config.json`）：

```json
{
  "mcpServers": {
    "seiko": {
      "command": "seiko-mcp",
      "args": ["--root", "/path/to/root"]
    }
  }
}
```

需要让客户端同步或修改安装根时，在 `args` 中加入 `"--allow-mutations"`。先用只读模式，只对确实需要改动安装根的客户端开放变更。

工具结果是 JSON 文本；工具调用失败会返回错误结果，而不是让 server 崩溃。源凭据照常从配置的环境变量读取，token 不会出现在结果里。
