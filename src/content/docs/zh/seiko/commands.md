---
title: 命令参考
description: sk 的命令、选项与机器可读输出。
---

每条命令都作用于一个安装根与一个存储。`sk --help` 列出命令，`sk <command> --help` 列出单个命令的选项。

## 全局选项

| 选项 | 说明 |
| --- | --- |
| `--json` | 在 stdout 输出单个 JSON 文档。 |
| `-v`、`--verbose` | 输出调试日志与完整堆栈。 |
| `-q`、`--quiet` | 静默进度与非错误输出。 |

进度条只在 stdout 是交互式终端时出现，且不会与 `--json` 同时出现。

## 常用选项

| 选项 | 命令 | 说明 |
| --- | --- | --- |
| `--root <path>` | 大多数 | 安装根。默认从当前目录向上找最近的 `seiko.conf`。 |
| `--store <path>` | 部署与缓存 | 存储目录。默认取 `SEIKO_STORE`，否则用平台默认路径。 |
| `--proxy <url>` | 联网命令 | HTTP 代理，默认使用系统代理。 |
| `--jobs <n>` | `sync`、`add`、`remove`、`update` | 最大并发 HTTP 请求数，默认 4。 |
| `--pre` | 解析类命令 | 允许预发布版本。 |
| `--latest-installable` | `sync`、`add`、`update` | 跳过没有匹配当前依赖图构件的版本；默认仍选最高版本。 |
| `--allow-critical` | `sync`、`add`、`update` | 允许解析带 critical 公告的版本；否则这些版本会被跳过并给出警告。 |

## 生命周期

### `sk init [--root <path>]`

写入带官方索引、空的 `sei` 与 `components` 的 `seiko.conf` 模板。拒绝覆盖已有文件。

### `sk sync [选项]`

解析声明并部署。别名：`sk install`。

| 选项 | 说明 |
| --- | --- |
| `--frozen` | 按 `seiko.lock.json` 重放，不重新解析；声明的直接集合必须与锁一致。 |
| `--locked` | 正常解析，但结果与现有锁不同就失败。 |
| `--pre` | 允许预发布版本。 |
| `--latest-installable` | 跳过没有匹配构件的版本；不能与 `--frozen` 同用。 |
| `--allow-critical` | 允许解析带 critical 公告的版本。 |

`--frozen` 与 `--locked` 互斥。`--frozen` 不改写锁。

`sync`、`add` 与 `update` 在选中弃用版本，或重放锁定的 yanked / critical 版本时会打印警告；范围内匹配到但被跳过的 yanked / critical 版本也会警告。`--json` 在 `data.warnings` 中给出同样的消息。

### `sk add <name[@range]>`

把直接声明加入 `sei` 并同步。裸写 `1.2.0` 表示 1.2.0 或更高；精确锁定用 `[1.2.0]`。`--latest-installable` 作用于这次同步；`--allow-critical` 允许带 critical 公告的版本。

### `sk remove <name>`

从 `sei` 或 `components` 删除直接声明，并同步剩余内容。

### `sk update [name] [--latest]`

重新解析直接声明，在范围内优先选新版本。传 `name` 只更新该声明；不传则更新全部。`--latest` 把选中的直接范围改写成最新版本（`[x.y.z]`）；`--latest-installable` 跳过没有匹配构件的版本；`--allow-critical` 允许带 critical 公告的版本。

### `sk rollback [--to <generation>] [--proxy <url>]`

恢复上一代部署，或 `--to` 指定的代。部署代记录在 `.seiko/generations/` 下。目标代的构件缺失或损坏时，回滚会从配置的源重新下载。

## 查看

| 命令 | 说明 |
| --- | --- |
| `sk list` | 从锁列出已安装的 sei。 |
| `sk why <name>` | 把某个 sei 带入依赖图的依赖链。 |
| `sk outdated [--pre]` | 范围内、整体与最新可安装版本。 |
| `sk search <term>` | 在配置的索引里搜索 sei 名。 |
| `sk info <name>` | 单个 sei 的版本、依赖与构件数。 |
| `sk doctor [--clean]` | 检查锁、存储、部署与残留下载；`--clean` 删除所有未完成下载。 |

## 源与配置

| 命令 | 说明 |
| --- | --- |
| `sk source list` | 按声明顺序列出源。 |
| `sk source add <id> <index> [--token-host <host>]...` | 追加源；`--token-host` 可重复。私有源 token 来自 `SEIKO_TOKEN_<HOST>`。 |
| `sk source remove <id>` | 删除源。 |
| `sk config get <key>` | 读取 `rid`。 |
| `sk config set <key> <value>` | 写入配置；空值删除该键。 |

`config` 目前只暴露 `rid`。源保存在 `seiko.conf` 里，由命令原地修改。

## 存储

| 命令 | 说明 |
| --- | --- |
| `sk cache status` | 构件与未完成下载的数量。 |
| `sk cache verify` | 按摘要校验存储中的载荷文件。 |
| `sk cache clean` | 删除未被任何已注册安装根的锁及其保留回滚代引用的构件。 |

`cache clean` 传 root 只是为了定位存储；它保护所有已注册的根，而不只是传入的那个。摘要元数据或载荷缺失、损坏的构件会被同步与回滚重新下载；`cache verify` 只报告。

## 索引编写

```bash
sk index verify [path] [--check-artifacts] [--strict] [--proxy <url>]
```

校验索引目录的 schema、名称、版本、构件 URL 与 SHA-256。`--check-artifacts` 还会下载每个构件，核对大小、摘要与内嵌 `sei.json`；`--strict` 把警告也当错误。路径默认是当前目录。追加规则由索引仓库的 CI 检查，不由这条命令检查。

## 版本范围

声明与依赖都使用 NuGet SemVer 范围。

| 范围 | 含义 |
| --- | --- |
| 省略、`*` 或 `""` | 任意稳定版本。 |
| `1.2.3` | 1.2.3 或更高。 |
| `[1.2.3]` | 精确 1.2.3。 |
| `[1.0.0,2.0.0)` | 包含 1.0.0，不包含 2.0.0。 |

预发布版本默认排除；传 `--pre`，或范围本身点名预发布版本（如 `[1.2.0-beta,2.0.0)`）才会纳入。

## 退出码与 JSON

| 退出码 | 含义 |
| --- | --- |
| `0` | 成功。 |
| `1` | 运行期失败。 |
| `2` | 用法错误。 |

`--json` 成功时输出 `{"schemaVersion":1,"command":"...","data":...}`，失败时输出 `{"schemaVersion":1,"command":"...","error":{"code":"...","message":"..."}}`。错误码为 `usage`、`config`、`source`、`resolve`、`download`、`checksum`、`deploy`、`lock`、`io` 与 `internal`；见[常见问题](/zh/seiko/troubleshooting/)。
