---
title: 发布记录
description: 星光框架、加载器与模板的已发布版本。
---

当前功能线发布于 2026 年 11 月 19 日。

| 组件 | 版本 | 分发方式 |
| --- | --- | --- |
| [PluginAbstractions](https://www.nuget.org/packages/Hosihikari.Plugin.Abstractions/2.0.1) | 2.0.1 | NuGet |
| [PluginManager](https://github.com/HosihikariFramework/PluginManager/releases/tag/v2.0.1) | v2.0.1 | Release 归档、NuGet、sei |
| [HostingShim](https://github.com/HosihikariFramework/HostingShim/releases/tag/v2.0.1) | v2.0.1 | Release 归档，五个载体目标、sei |
| [C# Loader](https://github.com/HosihikariFramework/CSharpLoader/releases/tag/v2.0.1) | v2.0.1 | Release 归档、sei |
| [F# Loader](https://github.com/HosihikariFramework/FSharpLoader/releases/tag/v2.0.1) | v2.0.1 | Release 归档、sei |
| [RPC Loader](https://github.com/HosihikariFramework/RpcLoader/releases/tag/v2.0.1) | v2.0.1 | Release 归档、sei |
| [Plugin.Build](https://www.nuget.org/packages/Hosihikari.Plugin.Build/1.2.0) | 1.2.0 | NuGet |
| [Testing](https://www.nuget.org/packages/Hosihikari.Testing/1.1.0) | 1.1.0 | NuGet |
| [插件模板](https://www.nuget.org/packages/Hosihikari.Plugin.Templates/1.1.0) | 1.1.0 | `dotnet new` |

## 2.0.1

- **契约 2.0.0 还原不出来。** 它的 nuspec 依赖 `Hosihikari.Plugin.Model`，而模型包发的是另一个 id 且那一次推送失败，依赖永远解不出。`Hosihikari.Plugin.Abstractions` 2.0.0 已 unlist；钉着它的工程要改到 `[2.0.1,3.0.0)`。区间一律从 2.0.1 起：NuGet 取最低满足版本，下界留在 2.0.0 仍会选中坏包。
- **载体启动即失败。** 核心落在 `IsolatedComponentLoadContext`，装配却把载体程序集装进默认上下文，`carrier.bootstrap` 的类型解析不到自己的依赖。改为在核心所在的上下文里装载，并先认已装的那份；同时补一个只在正常解析失败后才触发的包目录解析器（FX-0066）。
- **模型包改名 `Hosihikari.Plugin.Model` → `Hosihikari.Plugin.Models`。** 程序集文件名就是共享层身份，所以按 2.0.0 编译的插件要重编。
- **载体换代**：Endstone 0.11.16、LeviLamina 26.60.9。Endstone 0.11.16 会把服务端自我升级到 26.65，**exe 与资源包必须同版本**——只回滚 exe 会让资源包 `min_engine_version` 校验失败、插件完全不加载。
- **投影改名**：`CapabilityExtension` → `Capabilities`，namespace 与程序集族同步单数化（`Hosihikari.Bindings.*` → `Hosihikari.Binding.*`）。载体清单的 `carrier.components[].type` 与 `bootstrap.type` 进了 `Bootstrap` 命名空间。
- 载体归档带投影的注释文档（`.xml`），插件作者的 IntelliSense 才有内容；`verify-live` 的 BDS 默认版本跟到 26.65.1。
- 冒烟不再用退出码判干净退出：0.11.16 起 `Quit correctly` 之后进程仍以 `-1` 退出，裸服也一样。
- LeviLamina、Endstone Linux 与自持面的载体仍是空 `carrier` 组。

## 2.0.0

**契约 2.0.0 还原不出来——区间从 2.0.1 起，或直接装 2.0.1。**其余内容见下。

语义与元数据换代：插件清单换成 `hosihikari.json`，钩子异步化，卸载分三段预算，事件有了优先级，载体包承担进程级组件。1.x 的包与加载器在 v2 上一律拒载，迁移见[从 1.x 迁到 2.0](/zh/framework/migrate/v2/)。

- **清单换代（FX-0058）**：插件写 `hosihikari.json`，LeviLamina 需要的 `manifest.json` 信封由打包器生成。只有 `manifest.json` 的旧包被拒，`hosihikari-pack migrate` 负责把旧清单转过来。
- **契约 3（FX-0059）**：四个钩子改异步并接收 `CancellationToken`；诊断统一成 `PluginDiagnostic`；`RegisterLoader` 移进 `ILoaderContext`，普通插件拿不到；`PluginManifest` 移出契约。`apiVersion` 必须是 3。
- **共享层由载体包声明（FX-0061）**：`PluginContractInfo` 的静态清单删除，改成只读基地清单加 `carrier.sharedAssemblies`。
- **宿主契约 2（FX-0065）**：启动入口改为接收载体目录与原生宿主句柄。1.3.0 及更早的核心与新垫片互不兼容，起服时在版本检查处停下。
- **载体组件（FX-0061）**：载体包在清单里声明进程级托管组件，核心在事件分发开启之前启动、停止之前停。
- **载体服务配置器（FX-0064）**：载体清单的 `carrier.bootstrap` 声明一个 `ICarrierServicesConfigurator`，在服务提供器建成之前注册载体自己的服务。
- **Reload（FX-0062）**：自持态可以重载单个插件，走 Disable → Unload → Load → Enable；父级态返回不支持。
- **事件优先级（FX-0060）**：`Lowest` / `Low` / `Normal` / `High` / `Highest` / `Monitor`，`Monitor` 按约定只读。
- **状态事件**：每次在场迁移发一条 `PluginStateChanged`。

## 1.3.0

- 生成的 `sei.json` 用 schema 3（FX-0055），索引侧的 `sei/<名称>.json` 仍是 2。装这一线需要 Seiko 0.4 及以上。
- 加载器与载体依赖 `hosihikari [1.3.0,2.0.0)`。加载器 1.2.0 从契约 1.2.0 读共享层名单，配旧核心会在装载时失败，走到解析期才报更晚。
- `Hosihikari.Plugin.Abstractions` 1.2.0 公开 `PluginContractInfo.SharedAssemblyFileNames` 与 `AddSharedAssemblies`；载体把绑定程序集追加进名单，不再扫描 `FrameworkContext`。
- 每个插件包都必须声明 `hosihikari` 依赖，`extraInfo.packageKind` 认 `plugin`、`loader` 或 `carrier`；两者都在装载与打包期拦截。
- `extraInfo.prepack` 在打包期以白名单环境和超时执行；操作员文本完成本地化。
- `Disable` 幂等，待回收的插件仍算依赖者；`Hosihikari.Plugin.Pack` 同时作为 `hosihikari-pack` dotnet 工具发布。
- `HostingShim` v1.2.2 修好 Endstone 的插件移除，载体重载不再报未在场。入口契约版本不变，仍为 1。
- `HostingShim` v1.2.3 把 LeviLamina 载体挪到 `mods/hosihikari/`：LeviLamina 26.60 从 `mods/` 加载模组。核心归档仍在 `plugins/hosihikari/`，核心不在模组目录时垫片回退到那里。装这条线需要 LeviLamina 26.60 或更新。

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

- 所有组件统一发布为 v1.0.0。公开命名按 FX-0040：`PluginManager`、`IPluginLoader`（`Id`）、`PluginHandle`、`CarrierServices`、`RegisterLoader`、`ScheduleOnce` / `SchedulePeriodic`。
- 清单字段是 `extraInfo.api_version`、`extraInfo.loader` 与 `extraInfo.manifest_version`；顶层 `type`、`entry`、`version` 保持原名。
- 仓库是 HostingShim、PluginManager、PluginAbstractions、CSharpLoader、FSharpLoader 与 RpcLoader；NuGet 包为 `Hosihikari.Plugin.Abstractions` 与 `Hosihikari.Plugin.Templates`。
- 卸载验证移出管理器锁，并让并发卸载共享同一个进行中的验证任务。
- RPC 绑定改用 `scheduleOnce` / `schedulePeriodic`（Python 为 `schedule_once` / `schedule_periodic`）；打包器子命令为 `pack-loader`。
- HostingShim 与 PluginManager 同步发布；HostingShim 依赖 `1.0.*` 的 PluginManager 线，入口契约版本仍为 1。

## 安装

.NET 包：

```bash
dotnet add package Hosihikari.Plugin.Abstractions --version 2.0.1
dotnet add package Hosihikari.Plugin.Build --version 1.2.0
dotnet add package Hosihikari.Testing --version 1.1.0
dotnet new install Hosihikari.Plugin.Templates::1.1.0
```

服务端组件是 GitHub Release 归档：下载对应平台的载体、核心归档与所需加载器归档，解压到服务端根目录。见[在 LeviLamina 上安装](/zh/framework/server/install/levilamina/)、[在 Endstone 上安装](/zh/framework/server/install/endstone/)、[自持态 Linux](/zh/framework/server/install/selfhosted/)与[自持态 Windows](/zh/framework/server/install/selfhosted-windows/)。

[Seiko](/zh/seiko/) 的索引也收录了核心与加载器；用 Seiko 装加载器时会一并装核心。

## 兼容

PluginManager v2.0.1 与 HostingShim v2.0.1 使用入口契约版本 2。
插件按 Hosihikari.Plugin.Abstractions `[2.0.1,3.0.0)` 构建，声明 `apiVersion` 3 与清单 `schemaVersion` 1。每个插件清单都必须声明 `hosihikari` 依赖。1.x 的包在载入前拒载，见[从 1.x 迁到 2.0](/zh/framework/migrate/v2/)。
