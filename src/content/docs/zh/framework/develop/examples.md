---
title: 示例插件
description: 两个可以直接复制进服务端的插件。
---

两个现成的包：一个 C# 源码插件，一个 Node 进程外插件。

| 示例 | 加载器 | 说明 |
|---|---|---|
| [hello-csharp](https://github.com/Hosihikari/hosihikari.github.io/tree/main/examples/hello-csharp) | `hosihikari-csharp` | C# 源码插件；装载时编译，写到数据目录。 |
| [hello-node](https://github.com/Hosihikari/hosihikari.github.io/tree/main/examples/hello-node) | `hosihikari-rpc` | 进程外加载器：RPC 桥；Node 插件，stdio JSON-RPC。 |

[第一个插件](/zh/framework/develop/first-plugin/)是从模板生成自己的插件；下面两个是现成的包，供阅读。hello-csharp 是进程内加载器示例，hello-node 是进程外示例。两者都是官方示例。把示例目录放进服务端的 `plugins/`，目录名与清单里的 `name` 一致。
