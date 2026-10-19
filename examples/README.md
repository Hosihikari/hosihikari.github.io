# 示例插件

| 示例 | Provider | 说明 |
|---|---|---|
| [hello-csharp](hello-csharp/) | `hosihikari-csharp` | C# 源码插件；装载时编译，写到数据目录 |
| [hello-node](hello-node/) | `hosihikari-rpc` | Node 进程外插件；stdio JSON-RPC |

两个示例都在[快速开始](../quick-start.md)里逐步安装。把示例目录放进服务端的 `plugins/`，目录名与清单里的 `name` 一致。
