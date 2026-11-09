---
title: 源与索引
description: 让 Seiko 指向一个索引、组合多个源，并保护私有源。
---

源就是一个静态索引：一个目录或 HTTP(S) 位置，里面有一个 `index.json`，每个名字一个 `<sei>.json`。Seiko 不运行 registry 代码，只抓取文件并校验。

## 官方索引

`sk init` 把官方索引写成 `official` 源：

```hocon
sources = [
  { id = "official", index = "https://raw.githubusercontent.com/Hosihikari/SeiIndex/main/index.json" }
]
```

URL 指向索引文件本身；同级的 `sei/<name>.json` 相对它解析。

## 添加源

```bash
sk source add internal https://packages.example.com/seiko/index.json
sk source add local ../my-index/index.json
```

本地源的索引路径可以是索引文件，也可以是放有它的目录（后者隐含 `index.json`）；相对路径从安装根解析。本地路径在写配置前先检查存在，http(s) 索引不探测，因此 `source add` 保持离线。`sk source list` 打印当前顺序，`sk source remove <id>` 删除一个源。

源按声明顺序尝试。第一个包含某个 sei 名字的源提供该 sei 的全部版本，后面的源不会与之合并。没有 `priority` 字段：要改优先级就调整 `sources` 数组的顺序。

## 私有源

私有源用按主机名派生的 bearer token。目标主机决定环境变量，`seiko.conf` 不能指定变量名：

```hocon
sources = [
  {
    id = "private",
    index = "https://packages.example.com/seiko/index.json",
    tokenHosts = ["cdn.example.com"]
  }
]
```

设置 `SEIKO_TOKEN_<HOST>`：ASCII 字母与数字转大写，其余字符的每个 UTF-8 字节写成 `_XX`。`packages.example.com` 对应 `SEIKO_TOKEN_PACKAGES_2EEXAMPLE_2ECOM`。token 只通过 HTTPS 发给索引主机或 `tokenHosts` 中列出的主机。位于其他主机的构件不会收到 token，因此公共或第三方下载主机保持无认证。

## 索引布局

```
index.json
sei/
  hosihikari.json
  hello-seiko.json
```

`index.json` 列出供搜索使用的名字：

```json
{
  "schemaVersion": 2,
  "generatedBy": "SeiIndex maintainers",
  "sei": ["hello-seiko", "hosihikari"]
}
```

每个 `sei/<name>.json` 保存该名字的全部版本、构件与依赖。格式见[发布 sei](/zh/seiko/publishing/)。

索引只追加：只添加新版本，从不编辑或删除旧版本。本地 `origin` 文件是索引规则的例外——不进索引、不与索引交叉核对，同一版本下改字节后重新添加正是 `checksum` 守卫要拦的。某个版本可以用 `yanked: true` 退役（新解析看不见，锁重放仍可用），或用 `deprecated` 给出迁移提示。

## catalog.json

索引可以在 `index.json` 旁放一份 `catalog.json`：每个名字一行（最新可安装版本、简介、标签、协议、退役与 advisory 状态），让 `search`、`--tag`、`--license` 与 `outdated` 只需一次请求而不是逐名请求。它是派生数据：缺失或损坏时回退逐名读取，且从不决定安装什么。

## 搜索与查看

```bash
sk search hosihikari
sk search server --tag hosting --limit 10
sk info hosihikari
sk info hosihikari --versions
sk audit --fail-on high
sk outdated
```

`search` 匹配名字、简介与标签，完全同名排最前。`sk info` 是包页面：简介、作者、协议、标签、链接、安装状态、值得看的版本、外链主机与上游主机。`sk audit` 拿锁里的版本对照 advisory 与退役状态，`--fail-on low|moderate|high|critical` 让 CI 在命中严重度时非零退出；源答不上来的包报 `unknown`，不当成干净。

## 校验索引

```bash
sk index verify . --check-artifacts --strict
sk index verify ./sei-index.json
sk index catalog . --check
```

`index verify` 接受目录或单个维护者 `sei-index.json`。`index catalog` 重新生成 catalog，`--check` 只比较，CI 用的就是后者。

不带路径时校验当前目录。`--check-artifacts` 下载每个构件并核对大小、SHA-256 与内嵌 `sei.json`；`--strict` 把警告也视为失败。SeiIndex 的 CI 在合并提交前运行同一条命令。

`--proxy` 作用于索引与构件请求。HTTP 索引元数据还会缓存在 `<store>/.metadata`；`--offline` 下 `sync --locked`/`--frozen`、`rollback`、`--dry-run` 与只读命令都从该缓存重放。缓存缺失会一次列出，环境保持原状。
