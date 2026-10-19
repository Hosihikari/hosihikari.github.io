---
title: 示例插件
description: 两个可以直接复制进服务端的插件。
---

| 示例 | Provider | 说明 |
|---|---|---|
| [hello-csharp](https://github.com/HosihikariFramework/hosihikariframework.github.io/tree/main/examples/hello-csharp) | `hosihikari-csharp` | C# 源码插件；装载时编译，写到数据目录。 |
| [hello-node](https://github.com/HosihikariFramework/hosihikariframework.github.io/tree/main/examples/hello-node) | `hosihikari-rpc` | 例外一等 Provider：跨进程桥；Node 插件，stdio JSON-RPC。 |

[快速开始](/zh/quick-start/)使用 hello-csharp，它是一等 Provider 示例。hello-node 演示例外一等 Provider。两者都是官方 Provider。把示例目录放进服务端的 `plugins/`，目录名与清单里的 `name` 一致。
