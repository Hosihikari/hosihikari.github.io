---
title: 示例插件
description: 两个可以直接复制进服务端的插件。
---

| 示例 | Provider | 说明 |
|---|---|---|
| [hello-csharp](https://github.com/HosihikariFramework/hosihikariframework.github.io/tree/main/examples/hello-csharp) | `hosihikari-csharp` | C# 源码插件；装载时编译，写到数据目录。 |
| [hello-node](https://github.com/HosihikariFramework/hosihikariframework.github.io/tree/main/examples/hello-node) | `hosihikari-rpc` | Node 进程外插件；stdio JSON-RPC。 |

两个示例都在[快速开始](/zh/quick-start/)里逐步安装。把示例目录放进服务端的 `plugins/`，目录名与清单里的 `name` 一致。
