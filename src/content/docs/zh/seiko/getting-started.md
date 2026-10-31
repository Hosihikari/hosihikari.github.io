---
title: 快速开始
description: 创建安装根、添加 sei，并重放锁。
---

安装根是含 `seiko.conf` 的目录。Seiko 部署的一切都留在这个目录里。

## 创建安装根

```bash
mkdir my-root
cd my-root
sk init
sk add hosihikari
```

`sk init` 写入 `seiko.conf` 模板：官方索引作为 `official` 源，`sei` 与 `components` 为空。它不解析、不安装任何东西。

`sk add hosihikari` 添加直接声明并立即同步：

```
resolved 1 sei, deployed 29 file(s)
  hosihikari 1.2.0 (direct)
```

文件按构件的布局落盘。`hosihikari` 的文件在 `plugins/hosihikari/` 下；Seiko 不解释那里的内容。像 `manifest.json` 这样的运行期清单是载荷，Seiko 不读取。

## 找到安装根

大多数命令接受 `--root <path>`。不传时，`sk` 从当前目录向上查找最近的含 `seiko.conf` 的目录，找不到就用当前目录。`sk init` 始终使用当前目录（除非传 `--root`），并拒绝覆盖已有的 `seiko.conf`。

## 查看现状

```bash
sk list                 # 锁里已安装的 sei
sk why hosihikari       # 它为什么在依赖图里
sk outdated             # 范围内与整体的新版本
sk info hosihikari      # 版本、依赖与构件数
```

`sk list` 读的是 `seiko.lock.json`，不是配置，所以声明漂移后它仍然可用。

## 保留锁

`seiko.lock.json` 记录实际部署的精确版本、源、构件摘要与选择器。把它和 `seiko.conf` 一起提交。

```bash
sk sync --frozen        # 按锁重放，不重新解析
sk sync --locked        # 正常解析，但结果与锁不一致时报错
```

`--frozen` 要求声明的直接集合与锁中的直接条目一致，且不会改写锁。`--locked` 是 CI 用的检查：正常解析，结果与已提交的锁不同就失败。`sk install` 是 `sk sync` 的别名。

## 修改声明

```bash
sk add hello-csharp@1.2.0          # 直接声明，范围 1.2.0 或更高
sk remove hello-csharp             # 删除声明并同步
sk update                          # 在范围内更新所有直接声明
sk update hosihikari --latest      # 把直接范围钉到最新版本
sk rollback                        # 恢复上一代
sk rollback --to 1                 # 恢复到指定代
```

`sk add`、`sk remove`、`sk update` 与 `sk sync` 都是一次部署：各自写一个新代，`sk rollback` 可以回到更早的部署。

预发布版本默认跳过；传 `--pre`，或声明的范围本身点名了预发布版本，才会被选中。`sk sync`、`sk add`、`sk update` 可传 `--latest-installable`，跳过没有匹配当前依赖图构件的版本；默认仍选最高版本。每个命令的选项见[命令参考](/zh/seiko/commands/)。
