---
title: 声明与锁
description: seiko.conf 的内容、版本范围的写法，以及 seiko.lock.json 记录什么。
---

安装根里有两个 Seiko 文件：你编辑的声明 `seiko.conf`，以及要提交的解析结果 `seiko.lock.json`。

## seiko.conf

```hocon
schemaVersion = 2

# 官方索引；删除它或添加其他源即可改用别的索引。
sources = [
  { id = "official", index = "https://raw.githubusercontent.com/Hosihikari/SeiIndex/main/index.json" }
]

# 可选；默认当前平台。
rid = "linux-x64"

sei = [
  { name = "hosihikari" },
  { name = "hello-seiko", version = "[1.0.0,2.0.0)" }
]

# 可选：本地 .sei 文件，每个都与上面同名的 sei 条目配对。
origin = [
  {
    name = "hello-seiko"
    paths = ["dist/hello-seiko.sei"]
    selectors = [ { rid = "linux-x64" } ]
  }
]
```

| 字段 | 说明 |
| --- | --- |
| `schemaVersion` | 必填；当前为 `2`。 |
| `sources[].id` | 锁与解析器使用的源标识，必须唯一。 |
| `sources[].index` | `index.json` 的 HTTPS URL，或索引文件的本地路径（相对路径从安装根解析）。 |
| `sources[].tokenHosts` | 额外允许接收其主机 token 的 HTTPS 主机。 |
| `rid` | 写入锁的目标平台；默认运行平台。 |
| `sei[].name` | 直接 sei 名。 |
| `sei[].version` | NuGet 版本范围；省略或 `*` 表示任意稳定版本。 |
| `origin[].name` | 由本地文件提供的 sei，必须同时出现在 `sei` 里。 |
| `origin[].paths` | 相对安装根的存储路径；允许 `./` 与 `../`，绝对路径拒绝。 |
| `origin[].selectors` | 可选的选择条件（`rid`、`prerequisites`），与构件选择器语义一致。 |

直接声明只写在 `sei`。锁记录解析后的图，包括版本级与构件级关系、选中的构件及其 `rid`。`origin` 是保留的源 id：它与同名 `sei` 条目配对，只固定该条目字节的来源，配置的源不得占用它。

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
  "schemaVersion": 2,
  "target": { "rid": "linux-x64" },
  "sources": ["official"],
  "sei": [
    {
      "name": "hosihikari",
      "version": "1.2.0",
      "source": "official",
      "direct": true,
      "dependencies": [],
      "prerequisites": [],
      "optionalPeers": [],
      "conflicts": [],
      "artifact": {
        "sha256": "a65309e97137560672f74998c4895877b85a4a76cb618d173049b75ea5f51afc",
        "rid": "linux-x64",
        "dependencies": [],
        "prerequisites": [],
        "optionalPeers": [],
        "conflicts": []
      }
    }
  ]
}
```

| 字段 | 说明 |
| --- | --- |
| `target.rid` | 选择构件所用的平台。 |
| `sources` | 按声明顺序排列的源标识。 |
| `sei[].source` | 提供该 sei 的源；重放使用同一个源标识。本地文件为 `origin`。 |
| `sei[].originPath` | 仅 origin 条目（其余省略）：读取字节或与快照比对的存储路径。 |
| `sei[].direct` | 是否为直接声明。 |
| `sei[].artifact.sha256` | 选中构件的摘要。 |
| `sei[].artifact.rid` | 选中构件的平台条件（如有）。 |
| `sei[].dependencies` | 该 sei 的版本级依赖。 |
| `sei[].prerequisites`、`optionalPeers`、`conflicts` | 其余版本级关系。 |
| `sei[].artifact.*` | 构件级关系，单独保留供回放与诊断。 |

锁是确定性、机器写入的文件。不要手工编辑；改 `seiko.conf` 或执行更新。

## 重放

- `sk sync --frozen` 按锁重放，不重新解析。声明的直接集合必须等于锁中的直接条目，锁的目标 `rid` 必须等于配置的 `rid`，且每个条目的源、关系、构件 `rid` 与依赖仍要与索引一致。`origin` 条目直接从锁定的 `originPath` 重放（文件本身没了就回落到存储里的快照），使用锁里既有的摘要与选择条件，不从当前声明重选。
- `sk sync --locked` 正常解析，结果与已提交的锁不同就失败。
- 普通 `sk sync` 解析、部署并改写锁。

在 CI 中提交 `seiko.conf` 与 `seiko.lock.json`，用 `sk sync --frozen` 部署经过审阅的精确树；在其他环境用普通 `sk sync` 获取更新。
