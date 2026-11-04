---
title: 发布 sei
description: 打包构件并把版本提交到官方索引。
---

sei 是一个 zip，根部有 `sei.json`，其余是载荷。发布就是把 zip 托管在稳定 URL 上，并把匹配的版本条目提交到索引。

## 构建构件

```
hello-seiko.zip
  sei.json
  plugins/hello-seiko/manifest.json
  plugins/hello-seiko/main.cs
  plugins/hello-seiko/start.sh
```

zip 根只能有一个 `sei.json`。其余都是载荷；路径相对安装根部署，所以载荷路径 `plugins/hello-seiko/manifest.json` 会变成 `<root>/plugins/hello-seiko/manifest.json`。Seiko 不读 `manifest.json`；它属于加载插件的运行时。星光框架的插件包契约见[插件包与清单](/zh/framework/develop/plugin-package/)。

构件有硬上限：最多 100,000 个条目、单文件 1 GiB、总计 4 GiB。

`sei.json` 描述这个包：

```json
{
  "schemaVersion": 2,
  "name": "hello-seiko",
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari", "version": "[1.1.0,1.2.0)" }
  ],
  "prerequisites": [],
  "optionalPeers": [],
  "conflicts": [],
  "artifact": {
    "rid": "linux-x64",
    "dependencies": [],
    "prerequisites": [],
    "optionalPeers": [],
    "conflicts": [],
    "layout": "root",
    "modes": { "plugins/hello-seiko/start.sh": "0755" }
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `schemaVersion` | 必填；通常为 `2`，构件带外链文件时为 `3`。 |
| `name` | sei 名；必须与索引文件一致，且路径安全。 |
| `version` | NuGet SemVer 版本；预发布使用 `1.3.0-beta.1` 这类后缀。 |
| `dependencies` | 名字与可选的版本范围，按与声明相同的规则解析。 |
| `prerequisites`、`optionalPeers`、`conflicts` | 其余版本级关系，见[关系](#关系)。 |
| `artifact` | 只描述当前构件：`rid`、构件专属关系、`layout`、`modes` 与可选外链。 |

## 外链文件

载荷允许下载但不允许再分发时，zip 里只放元数据，指向厂商 URL。zip 仍需根级 `sei.json`；外链字节在安装时获取，并按声明的 SHA-256 校验。

```json
{
  "schemaVersion": 3,
  "name": "proprietary-server",
  "version": "1.0.0",
  "artifact": {
    "rid": "linux-x64",
    "externalFiles": [
      { "path": "server/server.bin", "url": "https://vendor.example/server.bin", "sha256": "…" }
    ],
    "externalArchives": [
      {
        "url": "https://vendor.example/assets.zip",
        "sha256": "…",
        "format": "zip",
        "members": [{ "member": "assets/icon.png", "path": "server/icon.png" }]
      }
    ]
  }
}
```

- 用到外链字段的版本必须声明 `schemaVersion: 3`；不认识的旧客户端会拒绝该版本，而不是装成空包。
- 每个文件与归档都必须有小写 SHA-256；`size` 可选，只用于更早失败。归档摘要覆盖全部成员，成员不再单独带摘要。
- `format` 为 `zip`、`tar` 或 `tar.gz`。只抽取列出的成员；要把归档本身作为文件部署，用 `externalFiles`。
- 目标是包内相对路径；`layout` 不生效，`modes` 仍生效。目标之间及与 zip 内文件都不得冲突。
- URL 必须是绝对 `http(s)`，允许 query，不得内嵌凭据。换地址就发新版本，不设备用地址。

## 关系

版本级关系约束整个版本；`artifact` 内的同名字段只约束该构件。两个作用域同时生效。

| 字段 | 说明 |
| --- | --- |
| `dependencies` | 必须安装，目标会进入依赖图。 |
| `prerequisites` | 目标必须已在图中，不会自动加入；用于构件选择。 |
| `optionalPeers` | 目标可以缺失；存在时版本必须匹配。 |
| `conflicts` | 匹配的目标不能同时存在。 |

构件按 `rid` 与其 `prerequisites` 选择：前提不满足的构件不能被选中。可选中构件中，满足前提最多的胜出；特异度相同会报歧义。因为 `prerequisites` 不加入任何东西，点名条件的 sei 必须由声明或普通依赖带入图中。

## 托管构件

把 zip 放在稳定、公开的 HTTPS URL 上。钉在 tag 上的 GitHub Release 资产最简单；对象存储与静态站点也可以。只要版本存在，URL 就必须持续可下载，因为索引校验与未来每次安装都会重新抓取它。

## 编写索引条目

索引每个名字一个文件。版本条目形如：

```json
{
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari", "version": "[1.1.0,1.2.0)" }
  ],
  "prerequisites": [],
  "optionalPeers": [],
  "conflicts": [],
  "artifacts": [
    {
      "rid": "linux-x64",
      "dependencies": [],
      "prerequisites": [],
      "optionalPeers": [],
      "conflicts": [],
      "layout": "root",
      "modes": { "plugins/hello-seiko/start.sh": "0755" },
      "source": {
        "url": "https://github.com/example/hello-seiko/releases/download/v1.0.0/hello-seiko.zip",
        "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "size": 12345
      }
    }
  ]
}
```

`sha256` 是精确 zip 的摘要，64 位小写十六进制；`size` 是字节数。条目的关系、`rid`、`layout` 与 `modes` 必须与内嵌的 `sei.json` 一致；CI 会下载构件并核对两者，不一致会被拒绝。

## 提交到官方索引

官方索引是 [Hosihikari/SeiIndex](https://github.com/Hosihikari/SeiIndex)。通过它的 issue 表单提交，不要开 pull request：

1. 打开 https://github.com/Hosihikari/SeiIndex/issues/new?template=sei-submission.yml。
2. 填写 sei 名与完整的版本条目 JSON。
3. 对 SeiIndex 有写权限的账号会被自动处理；其他作者需要维护者添加 `index-submission` 标签。

索引机器人追加条目、打开 pull request、批准 GitHub 为该 PR 暂扣的校验运行，并启用自动合并。只有校验通过才会合并，合并落地后机器人关闭 issue。校验会下载每个构件、核对大小与 SHA-256，并比较内嵌的 `sei.json`。

提交前先在索引的本地检出上运行同样的检查：

```bash
sk index verify . --check-artifacts --strict
```

## 退役字段

版本条目可以带：

```json
{
  "version": "1.2.3",
  "yanked": true,
  "deprecated": "use 2.x instead",
  "advisory": { "severity": "critical", "url": "https://example.com/advisories/1" }
}
```

- `yanked` 让新解析看不到该版本；锁重放仍然可用。
- `deprecated` 在选中或查询该版本时显示。
- `advisory.severity` 为 `low`、`moderate`、`high` 或 `critical`。`critical` 版本默认被新解析跳过，除非用户传 `--allow-critical`；锁重放允许但会警告。

sei 文件还可以带 `unlisted: true`，从 `sk search` 隐藏但保留直接解析与锁重放；以及包级 `deprecated`，供未单独设置消息的版本继承。

## 规则

- **版本不可变。** 添加新版本；从不编辑或删除已有版本。
- **已有版本只能改 `yanked`、`deprecated` 与 `advisory`。** 包级 `unlisted` 与 `deprecated` 也可以改。`yanked: true` 让新解析看不到它，但锁重放仍然可用；`deprecated` 是人类可读的迁移提示。
- **从不删除 sei 或版本。** 退役的方式是 yank 或 deprecate。
- **`index.json` 的名字列表只能增长。**

私有索引使用同一套布局；Seiko 只需要一个 HTTPS URL 或本地目录，以及同样的 `sei/<name>.json` 文件。
