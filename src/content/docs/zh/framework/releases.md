---
title: 发布记录
description: 星光框架、加载器与模板的已发布版本。
---

当前功能线发布于 2026 年 10 月 31 日；模板包最近一次更新在 10 月 22 日（1.0.1）。

| 组件 | 版本 | 分发方式 |
| --- | --- | --- |
| [PluginAbstractions](https://www.nuget.org/packages/Hosihikari.Plugin.Abstractions/1.1.0) | 1.1.0 | NuGet |
| [PluginManager](https://github.com/HosihikariFramework/PluginManager/releases/tag/v1.2.0) | v1.2.0 | Release 归档、NuGet、sei |
| [HostingShim](https://github.com/HosihikariFramework/HostingShim/releases/tag/v1.2.1) | v1.2.1 | Release 归档，五个载体目标、sei |
| [C# Loader](https://github.com/HosihikariFramework/CSharpLoader/releases/tag/v1.1.0) | v1.1.0 | Release 归档、sei |
| [F# Loader](https://github.com/HosihikariFramework/FSharpLoader/releases/tag/v1.1.0) | v1.1.0 | Release 归档、sei |
| [RPC Loader](https://github.com/HosihikariFramework/RpcLoader/releases/tag/v1.1.0) | v1.1.0 | Release 归档、sei |
| [Plugin.Build](https://www.nuget.org/packages/Hosihikari.Plugin.Build/1.0.0) | 1.0.0 | NuGet |
| [Testing](https://www.nuget.org/packages/Hosihikari.Testing/1.0.0) | 1.0.0 | NuGet |
| [插件模板](https://www.nuget.org/packages/Hosihikari.Plugin.Templates/1.0.1) | 1.0.1 | `dotnet new` |

## 1.2.1

- 每个 HostingShim 发布归档都带根级 `sei.json`；`hosihikari-hosting` 1.2.1 已收录进 [Seiko](/zh/seiko/) 索引，五个附件按载体与 RID 选择。
- 三个载体 bundle —— `hosihikari-hosting-levilamina`、`hosihikari-hosting-endstone` 与 `hosihikari-hosting-selfhosted`（1.0.0）—— 依赖 hosting。声明一个 bundle 会通过依赖带入 hosting，并选中对应载体的附件。
- 自持态 Linux 归档通过 `sei.json` 的 `modes` 给启动器设可执行位。
- 入口契约与插件 API 无变化。

## 1.2.0

- 组件改为 GitHub Release 归档分发，在服务端根目录解压；不再使用 lip。托管核心是 `hosihikari-core-<版本>.zip`，三个加载器是 `hosihikari-csharp-<版本>.zip`、`hosihikari-fsharp-<版本>.zip` 与 `hosihikari-rpc-<版本>.zip`。
- `HostingShim` v1.2.0 增加自持态 Windows 载体：`hosihikari-server.exe` 挂起启动 `bedrock_server.exe`，注入垫片，在服务端 `main` 之前调用它的导出入口。目标为 BDS 1.21.3.01，与自持态 Linux 同一个上限。
- `PluginManager` v1.2.0 与三个加载器发布根级 `sei.json`，进入 [Seiko](/zh/seiko/) 的包索引；核心是 `hosihikari`，加载器是 `hosihikari-csharp`、`hosihikari-fsharp` 与 `hosihikari-rpc`。
- 入口契约保持 1，插件 API 保持版本 2；已有插件继续可用。

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
- 清单字段是 `extraInfo.api_version`、`extraInfo.loader` 与 `extraInfo.manifest_version`；顶层 `type`、`entry`、`version` 保持原名。
- 仓库是 HostingShim、PluginManager、PluginAbstractions、CSharpLoader、FSharpLoader 与 RpcLoader；NuGet 包为 `Hosihikari.Plugin.Abstractions` 与 `Hosihikari.Plugin.Templates`。
- 卸载验证移出管理器锁，并让并发卸载共享同一个进行中的验证任务。
- RPC 绑定改用 `scheduleOnce` / `schedulePeriodic`（Python 为 `schedule_once` / `schedule_periodic`）；打包器子命令为 `pack-loader`。
- HostingShim 与 PluginManager 同步发布；HostingShim 依赖 `1.0.*` 的 PluginManager 线，入口契约版本仍为 1。

## 安装

.NET 包：

```bash
dotnet add package Hosihikari.Plugin.Abstractions --version 1.1.0
dotnet add package Hosihikari.Plugin.Build --version 1.0.0
dotnet add package Hosihikari.Testing --version 1.0.0
dotnet new install Hosihikari.Plugin.Templates::1.0.1
```

服务端组件是 GitHub Release 归档：下载对应平台的载体、核心归档与所需加载器归档，解压到服务端根目录。见[在 LeviLamina 上安装](/zh/framework/server/install/levilamina/)、[在 Endstone 上安装](/zh/framework/server/install/endstone/)、[自持态 Linux](/zh/framework/server/install/selfhosted/)与[自持态 Windows](/zh/framework/server/install/selfhosted-windows/)。

[Seiko](/zh/seiko/) 的索引也收录了核心与加载器；用 Seiko 装加载器时会一并装核心。

## 兼容

PluginManager v1.2.0 与 HostingShim v1.2.0 使用入口契约版本 1。
按 Hosihikari.Plugin.Abstractions 1.1.0 构建的插件使用 API 版本 2 与清单 `manifest_version` 1，与 1.0.0 相同。
