---
title: 声明与锁
description: seiko.conf 的内容、版本范围的写法，以及 seiko.lock.json 记录什么。
---

安装根里有两个 Seiko 文件：你编辑的声明 `seiko.conf`，以及要提交的解析结果 `seiko.lock.json`。

## seiko.conf

```hocon
# 官方索引；删除它或添加其他源即可改用别的索引。
sources = [
  { id = "official", index = "https://raw.githubusercontent.com/Hosihikari/SeiIndex/main/index.json" }
]

# 可选；默认当前平台。
rid = "linux-x64"

sei = [
  { name = "hosihikari" },
  { name = "hello-csharp", version = "[1.0.0,2.0.0)" }
]

components = []
```

| 字段 | 说明 |
| --- | --- |
| `sources[].id` | 锁与解析器使用的源标识，必须唯一。 |
| `sources[].index` | `index.json` 的 HTTPS URL，或索引文件的本地路径（相对路径从安装根解析）。 |
| `sources[].tokenHosts` | 额外允许接收其主机 token 的 HTTPS 主机。 |
| `rid` | 写入锁的目标平台；默认运行平台。 |
| `sei[].name` | 直接 sei 名。 |
| `sei[].version` | NuGet 版本范围；省略或 `*` 表示任意稳定版本。 |
| `components[]` | 与 `sei` 同结构，用来单独分组环境包。 |

`components` 只是分组：其中条目的解析规则与 `sei` 完全相同，两者都是直接声明。`sk add` 写入 `sei`，并拒绝已经在 `components` 中声明的名字。

`seiko.conf` 是 HOCON。`#` 开始注释，字符串通常可以不加引号。解析前必须至少声明一个源。

## 版本范围

| 值 | 含义 |
| --- | --- |
| 省略、`*`、`""` | 任意稳定版本。 |
| `1.2.3` | 1.2.3 或更高。 |
| `[1.2.3]` | 精确 1.2.3。 |
| `[1.0.0,2.0.0)` | 包含 1.0.0，不包含 2.0.0。 |

解析器优先使用仍满足所有约束的锁定版本，然后选最高的稳定版本。预发布版本默认排除；传 `--pre`，或范围明确点名预发布版本时才会纳入。

## seiko.lock.json

```json
{
  "schemaVersion": 1,
  "target": { "rid": "linux-x64" },
  "sources": ["official"],
  "sei": [
    {
      "name": "hosihikari",
      "version": "1.2.0",
      "source": "official",
      "direct": true,
      "artifact": {
        "sha256": "a65309e97137560672f74998c4895877b85a4a76cb618d173049b75ea5f51afc"
      },
      "dependencies": []
    }
  ]
}
```

| 字段 | 说明 |
| --- | --- |
| `target.rid` | 选择构件所用的平台。 |
| `sources` | 按声明顺序排列的源标识。 |
| `sei[].source` | 提供该 sei 的源；重放使用同一个源标识。 |
| `sei[].direct` | 是否为直接声明。 |
| `sei[].artifact.sha256` | 选中构件的摘要。 |
| `sei[].artifact.selectors` | 选中构件时使用的选择器（如有）。 |
| `sei[].dependencies` | 该 sei 声明的逻辑依赖。 |

锁是确定性、机器写入的文件。不要手工编辑；改 `seiko.conf` 或执行更新。

## 重放

- `sk sync --frozen` 按锁重放，不重新解析。声明的直接集合必须等于锁中的直接条目，且每个条目的源、选择器与依赖仍要与索引一致。
- `sk sync --locked` 正常解析，结果与已提交的锁不同就失败。
- 普通 `sk sync` 解析、部署并改写锁。

在 CI 中提交 `seiko.conf` 与 `seiko.lock.json`，用 `sk sync --frozen` 部署经过审阅的精确树；在其他环境用普通 `sk sync` 获取更新。
