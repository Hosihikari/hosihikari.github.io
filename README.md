# 星光框架文档

星光框架把 .NET 插件带进 Minecraft 基岩版专用服务器（BDS）：原生 HostingShim 把 CLR 托管进服务器进程，托管核心负责插件发现、依赖排序、隔离装载与生命周期，插件类型由 Provider 扩展。

## 第一次用

1. [快速开始](quick-start.md) —— 在 LeviLamina 或 Endstone 服务端装上 Shim、Provider 与第一个插件。
2. [插件包与清单](plugin-package.md) —— 一个目录、一份清单，以及载入前的检查。
3. [示例插件](examples/README.md) —— C# 与 Node 各一个。

## 写插件

- [C# 插件](authoring-csharp.md)
- [F# 插件](https://github.com/HosihikariFramework/FSharpProvider/blob/main/README.zh_hans.md)
- [进程外插件（JSON-RPC）](authoring-rpc.md)
- [程序集插件](authoring-csharp.md#程序集插件) —— 预编译 DLL，由核心直接装载。

## 排错

- [常见问题](troubleshooting.md)

## 版本

- 契约 `api`：`2`
- 清单 `format_version`：`1`
- 当前发布：Abstractions 0.7.0、Shim v0.2.0、Provider v0.1.0

## 许可

LGPL-3.0-or-later，见 [LICENSE.md](LICENSE.md)。
