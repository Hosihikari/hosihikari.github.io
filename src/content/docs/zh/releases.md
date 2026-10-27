---
title: 发布记录
description: 星光框架、加载器与模板的已发布版本。
---

当前功能线发布于 2026 年 10 月 22 日；模板包在同一天更新至 1.0.1。

| 组件 | 版本 | 分发方式 |
| --- | --- | --- |
| [PluginAbstractions](https://www.nuget.org/packages/Hosihikari.Plugin.Abstractions/1.1.0) | 1.1.0 | NuGet |
| [PluginManager](https://github.com/HosihikariFramework/PluginManager/releases/tag/v1.1.0) | v1.1.0 | lip、NuGet |
| [HostingShim](https://github.com/HosihikariFramework/HostingShim/releases/tag/v1.1.0) | v1.1.0 | lip，四个载体变体 |
| [C# Loader](https://github.com/HosihikariFramework/CSharpLoader/releases/tag/v1.0.0) | v1.0.0 | lip |
| [F# Loader](https://github.com/HosihikariFramework/FSharpLoader/releases/tag/v1.0.0) | v1.0.0 | lip |
| [RPC Loader](https://github.com/HosihikariFramework/RpcLoader/releases/tag/v1.0.0) | v1.0.0 | lip |
| [Plugin.Build](https://www.nuget.org/packages/Hosihikari.Plugin.Build/1.0.0) | 1.0.0 | NuGet |
| [Testing](https://www.nuget.org/packages/Hosihikari.Testing/1.0.0) | 1.0.0 | NuGet |
| [插件模板](https://www.nuget.org/packages/Hosihikari.Plugin.Templates/1.0.1) | 1.0.1 | `dotnet new` |

## 插件模板 1.0.1

- 包内新增预编译 F# 模板 `hosihikari-plugin-fsharp`；C# 模板仍为 `hosihikari-plugin`。
- 内容目录为 `Hosihikari.Plugin.Templates` 与 `Hosihikari.Plugin.Templates.FSharp`。
- 生成的 F# 插件包会带 `FSharp.Core.dll`；两个模板都不会把共享契约 DLL 放进插件包。

## 1.1.0

1.1.0 功能线只向 1.0 的 API 添加内容；已有插件无需改动。

- `Hosihikari.Plugin.Abstractions` 1.1.0 新增可选的 `IPluginLoaderDiagnostics` 伴随接口。实现它的
  加载器会在 `Load` 之前校验包；报告的问题使该插件被跳过，并进入装载报告。
- `Hosihikari.PluginManager` 1.1.0 新增 `PluginManagerOptions.UnloadVerificationTimeout`（默认 30
  秒）与 `Plugins` / `TryGetPlugin` 状态快照。验证超时按卸载失败记录；槽位保持 `Detached`，不会把
  插件报成已经离场。
- `HostingShim` v1.1.0 依赖 `1.1.*` 的 PluginManager 线。加载器仍为 v1.0.0，可与新核心搭配。
- `Hosihikari.Plugin.Build` 1.0.0 提供 `PackPlugin` MSBuild 目标，打包插件不再需要检出
  PluginManager。多目标项目要带 `-f <tfm>`。
- `Hosihikari.Testing` 1.0.0 提供生命周期测试用的 `PluginTestHost`、驱动真实管理器的
  `PluginManagerHarness`，以及内存服务、事件与调度。

## v1.0.0

- 所有组件统一发布为 v1.0.0。公开命名按 ADR-0040：`PluginManager`、`IPluginLoader`（`Id`）、`PluginHandle`、`CarrierServices`、`RegisterLoader`、`ScheduleOnce` / `SchedulePeriodic`。
- 清单字段改为 `extraInfo.api_version`、`extraInfo.loader`、`extraInfo.manifest_version`；旧 `api`、`provider`、`format_version` 会给出迁移错误。顶层 `type`、`entry`、`version` 的线上名不变。
- GitHub 仓改名为 HostingShim、PluginManager、PluginAbstractions、CSharpLoader、FSharpLoader、RpcLoader；NuGet 包为 `Hosihikari.Plugin.Abstractions` 与 `Hosihikari.Plugin.Templates`。
- 卸载验证移出管理器锁，并让并发卸载共享同一个进行中的验证任务。
- RPC 绑定改用 `scheduleOnce` / `schedulePeriodic`（Python 为 `schedule_once` / `schedule_periodic`）；打包器子命令为 `pack-loader`。
- HostingShim 与 PluginManager 同步发布；HostingShim 依赖 `1.0.*` 的 PluginManager 线，入口契约版本仍为 1。

## Core v0.7.2

- 依赖版本参与解析：插件自己的 `version` 是 SemVer；依赖的 `version` 是 NuGet 范围，例如 `1.2.3`、`[1.2.3]` 或 `[1.0.0,2.0.0)`。
- 非法版本或范围在清单读取与打包期被拒；依赖图与父级逐包交付在装载前检查目标版本，不满足时只剔除依赖者，报告里带约束与实际版本。
- `hosihikari` 依赖不参与版本检查；兼容由契约 API 与清单格式管理。
- 托管核心成为独立 lip 包，安装到 `plugins/hosihikari/`；原生 Shim 通过 lip 依赖声明兼容的 Core 版本。
- 原生侧与托管侧在启动时核对 `HostingContractVersion`；缺少入口返回 -2，版本不一致返回 -3。
- 显式卸载 Provider 包被拒绝；读不了的清单只跳过该包。
- 故障移除回调与核心收尾共用同一道闸门；Provider 复用日志移出核心锁。
- 打包器从包根展开 `#:include` 通配符，带引号与 `../shared/*.cs` 的写法可用；C# Provider 0.2.2 装载源码时使用同一套路径解析。
- 打包器清理暂存目录时容忍只读文件；清理失败不再让已完成的打包或 Provider 打包命令失败。
- `1.*`、`1.2.*` 等浮动约束按上界判定：`1.*` 拒绝 `2.0.0`，`1.2.*` 拒绝 `1.3.0`；依赖图与父级交付共用这一检查。
- `dependencies` 里的 `null` 或空 `name` 作为打包问题返回，不再抛 `NullReferenceException`。

## HostingShim v0.7.0

- 发布附件只含原生文件：载体、`nethost` 与自持态启动器；托管文件由 Core 包提供。
- Core 依赖范围改为 `0.7.*`；入口契约版本仍为 1。
- `lip install` 会自动解析并安装 Core；`verify-lip` 覆盖了 `plugins/hosihikari/` 的双包落盘。
- Endstone 在 Windows 与 Linux 都用 `#endstone`，由 `platform` 选择附件；旧的 `#endstone_linux` 已移除。
- 载体重载保留托管核心与已装载的 Provider，只卸载并重载子插件（ADR-0037）。
- Endstone 重载会等已进桥的日志写完，再让旧日志器销毁；hostfxr 每个进程只加载一次。
- 清单与装载路径补强：`null` 依赖、自依赖、带路径的包名、装载窗口回滚，以及锁外报告。
- 冒烟脚本记录服务器真实退出码；Linux 载体以 `-z nodelete` 链接。

## C# Provider v0.2.3

- lip 变体平台中立，Windows 与 Linux 都可安装。
- 源码可用 `#:package Id@Version` 与带通配符的 `#:include`。
- `#:include` 接受带引号的路径与 `../shared/*.cs`，与打包器的路径解析一致。
- 缓存校验同时覆盖程序集与 PDB；编译与缓存键使用同一份源码快照。
- 缓存清理跨进程安全：旧目录要过保留期且没有租约才清；暂存与刚发布的产物不动。
- 装载失败释放 ALC；一个包必须恰好暴露一个 `IPlugin` 类型。
- 同类型的第二个 Provider 包会装载失败，不再留在场上空转。

## F# Provider v0.1.5

- lip 变体平台中立，Windows 与 Linux 都可安装。
- 编译期引用顺序与运行期一致，包内依赖优先。
- FSharp.Compiler.Service 编译限制为 30 秒。
- PDB 校验、源码快照与唯一暂存目录保护缓存。
- `#load` 与本地 `#r` 引入的文件参与内容寻址；依赖一改就换目录，未改动的指令入口复用缓存。`#I`、`nuget:`、通配符或解析不了的路径仍每次编译到独立的 `-run-<nonce>` 目录。
- 指令扫描按 F# 词法处理：行注释与嵌套块注释、注释里的字符串、引号标识符、字符字面量与 `(*)` 运算符都不会被误认为指令；扫到文件尾仍停在注释或字符串里的入口按不可缓存处理。
- 跨进程清理使用保留期与装载租约；同类型的第二个 Provider 包装载失败。

## RPC Provider v0.2.4

- Node 绑定附 `hosihikari.d.ts`，Python 绑定附 `hosihikari.pyi`，QuickJS 绑定用 JSDoc 标注 `Context` 与 `Plugin`；模板携带同一份声明。
- Node 与 QuickJS 的宿主请求 30 秒超时：移除待办项并拒绝 Promise，回复到达时清除定时器。
- JSON 根不是对象（数组、字符串或 `null`）的行只记录警告并丢弃，不再中断读循环。
- lip 变体平台中立，Windows 与 Linux 都可安装。
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

```bash
dotnet add package Hosihikari.Plugin.Abstractions --version 1.1.0
dotnet add package Hosihikari.Plugin.Build --version 1.0.0
dotnet add package Hosihikari.Testing --version 1.0.0
dotnet new install Hosihikari.Plugin.Templates::1.0.1

lip install github.com/HosihikariFramework/HostingShim
lip install github.com/HosihikariFramework/CSharpLoader
lip install github.com/HosihikariFramework/FSharpLoader
lip install github.com/HosihikariFramework/RpcLoader
```

HostingShim 包会通过 lip 依赖安装 PluginManager。需要显式锁定 PluginManager 时：

```bash
lip install github.com/HosihikariFramework/PluginManager@1.1.0
```

HostingShim 的 LeviLamina 与 Endstone 变体用 `#levilamina`、`#endstone` 选择；
无后缀包安装 Linux 自持态载体。加载器仍为 v1.0.0，与 1.1.0 核心一同安装。

## 兼容

PluginManager v1.1.0 与 HostingShim v1.1.0 使用入口契约版本 1，HostingShim 依赖范围为 `1.1.*`。
按 Hosihikari.Plugin.Abstractions 1.1.0 构建的插件使用 API 版本 2 与清单 `manifest_version` 1，与 1.0.0 相同。
上一版功能线是 PluginAbstractions 0.7.1、PluginManager v0.7.2、HostingShim v0.7.0、C# Loader v0.2.3、F# Loader v0.1.5、RPC Loader v0.2.4 与模板 0.1.2。
