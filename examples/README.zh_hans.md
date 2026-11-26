# 示例插件

[English](README.md) | [简体中文](README.zh_hans.md)

| 示例 | 加载器 | 说明 |
|---|---|---|
| [hello-csharp](hello-csharp/) | `hosihikari-csharp` | C# 源码插件；装载时编译，写到数据目录 |
| [hello-node](hello-node/) | `hosihikari-rpc` | 进程外加载器：RPC 桥；Node 插件，stdio JSON-RPC |

[快速开始](https://hoshi.srcz.one/zh/framework/develop/first-plugin/)使用 hello-csharp，它是进程内加载器示例。hello-node 演示进程外加载器。两者都是官方示例。它们都是源码树、不是装好的包：先按各自 README 打包，再把产出的 `dist/<名称>/` 放进服务端的 `plugins/`；目录名必须与 `hosihikari.json` 里的 `name` 一致。

示例代码为 MIT-0，见 [LICENSE.md](LICENSE.md)。
