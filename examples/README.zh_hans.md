# 示例插件

[English](README.md) | [简体中文](README.zh_hans.md)

| 示例 | Provider | 说明 |
|---|---|---|
| [hello-csharp](hello-csharp/) | `hosihikari-csharp` | C# 源码插件；装载时编译，写到数据目录 |
| [hello-node](hello-node/) | `hosihikari-rpc` | 例外一等成员：跨进程桥；Node 插件，stdio JSON-RPC |

[快速开始](https://hosihikariframework.github.io/zh/quick-start/)使用 hello-csharp。hello-node 演示例外一等成员，不在官方 AOT/ALC/CLR 集内。把示例目录放进服务端的 `plugins/`，目录名与清单里的 `name` 一致。
