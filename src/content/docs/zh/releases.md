---
title: 发布记录
description: 星光框架、Provider 与模板的已发布版本。
---

当前功能线发布于 2026 年 10 月 21 日。

| 组件 | 版本 | 分发方式 |
| --- | --- | --- |
| [Abstractions](https://www.nuget.org/packages/Hosihikari.Abstractions/0.7.1) | 0.7.1 | NuGet |
| [Core](https://github.com/HosihikariFramework/PluginManagement/releases/tag/v0.6.0) | v0.6.0 | lip |
| [HostingShim](https://github.com/HosihikariFramework/Shim/releases/tag/v0.6.1) | v0.6.1 | lip，四个载体变体 |
| [C# Provider](https://github.com/HosihikariFramework/CSharpProvider/releases/tag/v0.2.2) | v0.2.2 | lip |
| [F# Provider](https://github.com/HosihikariFramework/FSharpProvider/releases/tag/v0.1.2) | v0.1.2 | lip |
| [RPC Provider](https://github.com/HosihikariFramework/RpcProvider/releases/tag/v0.2.2) | v0.2.2 | lip |
| [插件模板](https://www.nuget.org/packages/Hosihikari.Plugin.Template/0.1.2) | 0.1.2 | `dotnet new` |

## Core v0.6.0

- 托管核心成为独立 lip 包，安装到 `plugins/hosihikari/`；原生 Shim 通过 lip 依赖声明兼容的 Core 版本。
- 原生侧与托管侧在启动时核对 `HostingContractVersion`；缺少入口返回 -2，版本不一致返回 -3。
- 显式卸载 Provider 包被拒绝；读不了的清单只跳过该包。
- 故障移除回调与核心收尾共用同一道闸门；Provider 复用日志移出核心锁。
- 打包器从包根展开 `#:include` 通配符，带引号与 `../shared/*.cs` 的写法可用；C# Provider 0.2.2 装载源码时使用同一套路径解析。

## HostingShim v0.6.1

- 发布附件只含原生文件：载体、`nethost` 与自持态启动器；托管文件由 Core 包提供。
- `lip install` 会自动解析并安装 Core；`verify-lip` 覆盖了 `plugins/hosihikari/` 的双包落盘。
- Endstone 在 Windows 与 Linux 都用 `#endstone`，由 `platform` 选择附件；旧的 `#endstone_linux` 已移除。
- 载体重载保留托管核心与已装载的 Provider，只卸载并重载子插件（ADR-0037）。
- Endstone 重载会等已进桥的日志写完，再让旧日志器销毁；hostfxr 每个进程只加载一次。
- 清单与装载路径补强：`null` 依赖、自依赖、带路径的包名、装载窗口回滚，以及锁外报告。
- 冒烟脚本记录服务器真实退出码；Linux 载体以 `-z nodelete` 链接。

## C# Provider v0.2.2

- 源码可用 `#:package Id@Version` 与带通配符的 `#:include`。
- `#:include` 接受带引号的路径与 `../shared/*.cs`，与打包器的路径解析一致。
- 缓存校验同时覆盖程序集与 PDB；编译与缓存键使用同一份源码快照。
- 缓存清理跨进程安全：旧目录要过保留期且没有租约才清；暂存与刚发布的产物不动。
- 装载失败释放 ALC；一个包必须恰好暴露一个 `IPlugin` 类型。
- 同类型的第二个 Provider 包会装载失败，不再留在场上空转。

## F# Provider v0.1.2

- 编译期引用顺序与运行期一致，包内依赖优先。
- FSharp.Compiler.Service 编译限制为 30 秒。
- PDB 校验、源码快照与唯一暂存目录保护缓存。
- 含 `#` 的入口每次装载编译到新的 `-run-<nonce>` 目录，两个进程不会再原地替换同一份缓存。
- 跨进程清理使用保留期与装载租约；同类型的第二个 Provider 包装载失败。

## RPC Provider v0.2.2

- 通过进程 `Exited` 事件检测父进程退出，孤儿子进程会收尾。
- 队列有界：入站 4096 条、回复 1024 条、单行 4 MiB；溢出报告故障并终止子进程。
- 单行按块读取，4 MiB 上限在读取过程中执行，不再先分配整行。
- 通知按序处理；同步投递期间只有带 `id` 的请求可以重入，通知保持线路顺序。
- 字符串请求 ID 原样保留，结构化载荷保留原始 JSON，重复订阅可把主题升级为同步。
- 同类型的第二个 Provider 包装载失败。

## 插件模板 0.1.2

- 生成的项目以 `ExcludeAssets="runtime"` 引用 Abstractions 0.7.1。
- 脚手架为 MIT-0；它引用的契约为 MIT。

## 安装

```powershell
dotnet add package Hosihikari.Abstractions --version 0.7.1
dotnet new install Hosihikari.Plugin.Template::0.1.2

lip install github.com/HosihikariFramework/Shim
lip install github.com/HosihikariFramework/CSharpProvider
lip install github.com/HosihikariFramework/FSharpProvider
lip install github.com/HosihikariFramework/RpcProvider
```

Shim 包会通过 lip 依赖安装 Core。需要显式锁定 Core 时：

```powershell
lip install github.com/HosihikariFramework/PluginManagement@0.6.0
```

Shim 的 LeviLamina 与 Endstone 变体用 `#levilamina`、`#endstone` 选择；
无后缀包安装 Linux 自持态载体。

## 兼容

Core v0.6.0 与 Shim v0.6.1 使用入口契约版本 1，Shim 依赖范围为 `0.6.*`。
按 Abstractions 0.7.1 构建的插件使用契约 `api` 2 与清单 `format_version` 1。
上一版功能线是 Abstractions 0.7.0、Shim v0.5.1、Provider v0.2.1 / v0.1.2 与模板 0.1.2。
