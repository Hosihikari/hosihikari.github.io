---
title: 常见问题
description: 读懂 Seiko 错误、检查安装根，并修复损坏的存储或部署。
---

先运行 `sk doctor`。它检查声明、锁、存储、部署状态与未完成下载，并为需要处理的问题打印 finding 代码。`--clean` 删除残留的未完成下载。

## 错误码

每次 `sk` 失败都带下列错误码之一；配合 `--json` 时位于 `error.code`。

| 错误码 | 常见原因 | 处理 |
| --- | --- | --- |
| `usage` | 参数错误或版本范围非法。 | 查看 `sk <command> --help`。 |
| `config` | `seiko.conf` 缺失或非法，或源缺少 `id`/`index`。 | 运行 `sk init` 或修正文件。 |
| `source` | 索引缺失、非法，或读取时 HTTP 失败。 | 检查源路径/URL 与凭据。 |
| `resolve` | 没有版本满足依赖图，或版本冲突。 | 用 `sk why` 与 `sk info` 查看，放宽范围。 |
| `download` | 抓取构件时网络或 HTTP 失败。 | 重试、设置 `--proxy` 或降低 `--jobs`。 |
| `checksum` | 构件字节与记录的 SHA-256 或存储摘要不符。 | 见下文“存储损坏”。 |
| `deploy` | 不安全的路径、符号链接、非法模式或事务失败。 | 移除问题路径；检查 `.seiko/` 状态。 |
| `lock` | 锁缺失、过期，或与声明不一致。 | 运行普通 `sk sync`，或恢复期望的源。 |
| `io` | 文件系统或进程锁失败。 | 检查权限、磁盘空间与其他正在运行的 `sk`。 |
| `internal` | 意外失败。 | 用 `-v` 重跑并报告堆栈。 |

## 常见情况

### “missing seiko.conf; run `sk init` or pass `--root`”

你不在安装根里。在目标目录运行 `sk init`，或传 `--root <path>`。命令会从当前目录向上找最近的 `seiko.conf`。

### 找不到某个 sei

用 `sk search <term>` 确认名字存在于某个已配置的源。源按顺序尝试，第一个包含该名字的源提供其全部版本；后面的源无法补全第一个源已经拥有的名字。私有源还要设置 token 环境变量。

### 版本无法解析

`sk why <name>` 显示把 sei 带入依赖图的链，`sk info <name>` 显示可用版本与依赖。常见做法是放宽 `seiko.conf` 里的范围、更新依赖，或在范围本身没有点名预发布时用 `--pre` 允许预发布。

### `--frozen` 失败

`--frozen` 需要 `seiko.lock.json`，要求声明的直接集合等于锁中的直接条目，并按锁记录的源标识重放。如果新增、删除直接 sei，或改了源名，运行普通 `sk sync` 写新锁。锁要和声明一起提交。

### `--locked` 说锁过期

解析器产生了与已提交锁不同的结果。运行 `sk sync` 审阅并接受更新，再提交 `seiko.lock.json`。CI 里保留 `--locked`，让未提交的变化失败而不是悄悄通过。

### 存储损坏

`sk cache verify` 重新计算存储载荷的摘要；`sk doctor` 报告存储问题。摘要记录缺失或不可读、载荷文件缺失或多出、摘要不匹配时，下一次 `sk sync` 会替换该构件并重新下载；回滚也会为目标代这样做。`sk cache clean` 只删除没有根引用的构件，不是修复命令。

### 部署文件被改动

不要原地编辑已部署的载荷文件。

- **reflink：** 写入是写时复制，修改只留在部署文件里，存储不变。运行 `sk sync` 或 `sk sync --frozen` 即可从存储恢复该文件。
- **硬链接：** 部署文件与存储共享 inode，原地编辑会一并改到存储；下一次 `sk sync` 会发现不一致，重新下载构件并恢复存储与部署。

内容确实需要变化时，应修改源包并发布新版本。

### 不安全路径或符号链接错误

Seiko 拒绝穿过符号链接或重解析点写入，并把 `seiko.conf`、`seiko.lock.json` 与 `.seiko/` 保留给自己。从安装根移除符号链接或冲突文件后重试。试图部署到根外的构件是非法的；应修复包，而不是改安装根。

### 下载中断

未完成文件在 `<store>/.partial` 下，会自动续传。`sk doctor` 会报告它们，`sk doctor --clean` 删除。每条命令可以用 `--proxy` 指定代理，用 `--jobs` 降低并发。

### 回滚失败

`sk rollback` 会从配置的源重新下载目标代缺失或损坏的构件，因此这些源必须可达（必要时用 `--proxy`）。如果源已不再提供该构件或索引，回滚会失败；恢复源或重新发布该版本。检查 `.seiko/generations/` 下有哪些代。

## 报告问题

用 `-v` 运行失败的命令，附上命令本身、`sk --version`、`sk doctor` 输出，以及去掉凭据后的 `seiko.conf` 相关片段。在 [Hosihikari/Seiko](https://github.com/Hosihikari/Seiko/issues) 提交 issue。
