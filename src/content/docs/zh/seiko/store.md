---
title: 存储与部署
description: 构件放在哪里、载荷如何进入安装根，以及回滚如何工作。
---

Seiko 把下载与部署分开。构件只解包一次，进入共享的内容寻址存储；每个安装根再链接或复制自己需要的载荷文件。

## 存储

| 平台 | 默认存储 |
| --- | --- |
| Windows | `%LOCALAPPDATA%\seiko\store` |
| Linux、macOS | `~/.cache/seiko` |

用 `SEIKO_STORE` 全局改，或给命令传 `--store <path>`。多个安装根可以共用一个存储。

构件按 SHA-256 存放。存储里还有：

| 路径 | 用途 |
| --- | --- |
| `<sha>/` | 解包后的构件 |
| `.meta/<sha>.json` | 解包时记录的逐文件摘要 |
| `.partial/` | 未完成下载，可跨进程续传 |
| `.locks/` | 每个构件的下载锁 |

下载使用全局请求预算（`--jobs`，默认 4）、带退避的重试，并在服务器支持时对大文件分块。中断的下载下次运行会从 `.partial` 续传。

Seiko 解包 zip 构件。存储按内容寻址，上游改变的构件会成为另一个存储条目。摘要记录或载荷文件缺失、损坏时，`sk sync` 会在构件锁内替换并重新下载该构件；`sk cache verify` 只报告。

解包有硬上限：最多 100,000 个条目、单文件 1 GiB、总计 4 GiB。超限的构件会被拒绝并清理临时文件。

## 部署

对每个解析出的 sei，Seiko 读取构件的 `sei.json`，按安装根的 `rid` 选中构件，再按 `layout` 部署载荷（`root` 表示路径相对安装根）。构件里的 `sei.json` 与包根的 `tooth.json` 不会部署。

载荷文件按可用的最便宜机制放置，顺序是：

1. 文件系统支持时用 **reflink**（APFS、btrfs、XFS）。
2. 源与目标在同一卷时用 **硬链接**。
3. 否则 **复制**。

reflink 与硬链接的文件与存储共享数据。reflink 是写时复制：编辑部署文件不会改到存储。硬链接的原地修改会改到存储，下一次 `sk sync` 或 `sk cache verify` 会拒绝该构件。不要原地编辑已部署的载荷文件；应当修改源包并发布新版本。

部署后会应用 `sei.json` 里的 Unix 模式；Windows 忽略。只接受 `0000–0777`：setuid、setgid、sticky 会在改动文件前被拒绝。Seiko 拒绝穿过符号链接或重解析点写入，并把 `seiko.conf`、`seiko.lock.json` 与 `.seiko/` 保留给自己。

## 部署代与回滚

每次部署都在安装根里记录一代：

```
.seiko/
  state.json
  generations/
    1/
      state.json
      lock.json
  installed/
    hosihikari/1.2.0/sei.json
```

`sk rollback` 恢复上一代；`sk rollback --to <n>` 恢复指定代。目标代的构件缺失或损坏时，回滚会从配置的源重新下载（支持 `--proxy`）。`sk cache clean` 会保留被保留代引用的构件。

部署是事务性的：文件、状态、锁与代目录通过日志写入，失败时恢复上一次部署。如果运行被中断，下一条命令会先恢复或丢弃未完成的事务。

## 缓存维护

```bash
sk cache status        # 构件与未完成下载数量
sk cache verify        # 重新计算存储载荷的摘要
sk cache clean         # 删除未被引用的构件
```

`cache clean` 持有注册表锁与所有已注册安装根的安装锁，因此不会删除任何根的当前锁或保留回滚代仍需要的构件。

## Doctor

```bash
sk doctor
sk doctor --clean
```

`doctor` 检查锁与声明是否一致、存储是否仍有引用的构件、部署状态是否一致，以及是否有残留的未完成下载。`--clean` 删除所有未完成下载。错误码见[常见问题](/zh/seiko/troubleshooting/)。
