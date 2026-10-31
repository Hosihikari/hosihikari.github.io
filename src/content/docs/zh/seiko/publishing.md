---
title: 发布 sei
description: 打包构件并把版本提交到官方索引。
---

sei 是一个 zip，根部有 `sei.json`，其余是载荷。发布就是把 zip 托管在稳定 URL 上，并把匹配的版本条目提交到索引。

## 构建构件

```
hello-csharp.zip
  sei.json
  plugins/hello-csharp/manifest.json
  plugins/hello-csharp/main.cs
  plugins/hello-csharp/start.sh
```

zip 根只能有一个 `sei.json`。其余都是载荷；路径相对安装根部署，所以载荷路径 `plugins/hello-csharp/manifest.json` 会变成 `<root>/plugins/hello-csharp/manifest.json`。Seiko 不读 `manifest.json`；它属于加载插件的运行时。星光框架的插件包契约见[插件包与清单](/zh/framework/develop/plugin-package/)。

构件有硬上限：最多 100,000 个条目、单文件 1 GiB、总计 4 GiB。

`sei.json` 描述这个包：

```json
{
  "schemaVersion": 1,
  "name": "hello-csharp",
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari", "version": "[1.1.0,1.2.0)" }
  ],
  "layout": "root",
  "modes": { "plugins/hello-csharp/start.sh": "0755" }
}
```

| 字段 | 说明 |
| --- | --- |
| `schemaVersion` | 当前为 `1`。 |
| `name` | sei 名；必须与索引文件一致，且路径安全。 |
| `version` | NuGet SemVer 版本；预发布使用 `1.3.0-beta.1` 这类后缀。 |
| `dependencies` | 名字与可选的版本范围，按与声明相同的规则解析。 |
| `selectors` | 可选的构件选择器，见下。 |
| `layout` | `root`（或省略）。目前只支持根布局。 |
| `modes` | 可选的载荷路径到 Unix 模式的映射。只接受 `0000–0777`；setuid/setgid/sticky 会被拒绝。Windows 忽略模式。 |

## 选择器

一个版本可以发布多个构件，每个带不同的 `selectors`：

- `rid` 匹配目标平台，如 `win-x64`、`linux-arm64`。
- 其他键的值是一个 sei 名；依赖图里有这个名字就算匹配。例如 `{ "carrier": "levilamina" }` 在图中存在名为 `levilamina` 的 sei 时匹配。
- 所有键值对都要匹配。匹配的构件中，选择器键最多的胜出；特异度相同会报歧义。

平台无关的构件省略 `selectors`。同一版本的两个构件不能有完全相同的选择器。

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
  "artifacts": [
    {
      "layout": "root",
      "source": {
        "url": "https://github.com/example/hello-csharp/releases/download/v1.0.0/hello-csharp.zip",
        "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "size": 12345
      }
    }
  ]
}
```

`sha256` 是精确 zip 的摘要，64 位小写十六进制；`size` 是字节数。条目的 `version`、`dependencies`、`selectors` 与 `layout` 必须与内嵌的 `sei.json` 一致；CI 会下载构件并核对两者，不一致会被拒绝。

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

## 规则

- **版本不可变。** 添加新版本；从不编辑或删除已有版本。
- **已有版本只能改 `yanked` 与 `deprecated`。** `yanked: true` 让新解析看不到它，但锁重放仍然可用；`deprecated` 是人类可读的迁移提示。
- **从不删除 sei 或版本。** 退役的方式是 yank 或 deprecate。
- **`index.json` 的名字列表只能增长。**

私有索引使用同一套布局；Seiko 只需要一个 HTTPS URL 或本地目录，以及同样的 `sei/<name>.json` 文件。
