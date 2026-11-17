---
title: 模板
description: 从每种插件种类的维护模板开始。
---

每个模板都是一个插件包。打包后把产物复制到服务端 `plugins/<名称>/`，目录名保持等于清单 `name`。源码与 RPC 模板带 `hosihikari.json` 供你改名；`dotnet new` 模板的源码树里没有清单文件，`Hosihikari.Plugin.Build` 在打包期生成它。模板都不带 `manifest.json`——信封由打包器按 `hosihikari.json` 生成。模板为 MIT-0；Hosihikari.Plugin.Abstractions 1.0.0 及之后为 MIT。RPC 模板在 [RpcPluginTemplate](https://github.com/HosihikariFramework/RpcPluginTemplate)，打包需要的运行时目录。

## 预编译程序集

插件管理器内置的程序集入口加载 .NET 类库，不需要安装加载器包。

```bash
dotnet new install Hosihikari.Plugin.Templates
dotnet new hosihikari-plugin -n MyPlugin          # C#
# 或
dotnet new hosihikari-plugin-fsharp -n MyPlugin   # F#
```

`dotnet new` 生成的项目源码树里没有清单文件：`Hosihikari.Plugin.Build` 在打包期按项目属性生成 `hosihikari.json`。用它构建打包：

```bash
cd MyPlugin
dotnet add package Hosihikari.Plugin.Build
dotnet build -t:PackPlugin
```

目标把 `hosihikari.json` 与生成的信封一起写到 `dist/MyPlugin/`；多目标项目要带 `-f <tfm>`。测试包见 [测试插件](/zh/framework/develop/testing/)，模板说明见 [模板说明](https://github.com/HosihikariFramework/PluginAbstractions/tree/main/templates/Hosihikari.Plugin.Templates)。

## C# 与 F# 源码

C# 与 F# 加载器在装载时编译源码；包里放源码，没有构建产物。

| 模板 | 加载器 | 加载器归档 |
|---|---|---|
| [CSharpPluginTemplate](https://github.com/HosihikariFramework/CSharpPluginTemplate) | `hosihikari-csharp` | [`hosihikari-csharp-<版本>.zip`](https://github.com/HosihikariFramework/CSharpLoader/releases) |
| [FSharpPluginTemplate](https://github.com/HosihikariFramework/FSharpPluginTemplate) | `hosihikari-fsharp` | [`hosihikari-fsharp-<版本>.zip`](https://github.com/HosihikariFramework/FSharpLoader/releases) |

`CSharpPluginTemplate` 演示 `#:package` 与 `#:include`；先跑它的 `pack.ps1` 或 `pack.sh`，再把 `dist/MyCSharpPlugin/` 复制到 `plugins/`。脚本调用框架打包器，因此需要并列的 `PluginManager` 检出，或用 `HOSIHIKARI_PLUGINMANAGER` 指向一个；目录里还留着 1.x 的 `manifest.json` 时，脚本会先停在 `migrate` 上。`FSharpPluginTemplate` 演示 `#load`，同样先打包，再把 `dist/MyFSharpPlugin/` 复制到 `plugins/`。改名后重启。契约见 [C# 插件](/zh/framework/develop/authoring-csharp/)。

## 进程外运行时

RpcLoader 启动清单 `pack.command` 里的命令，通过 stdio 走 JSON-RPC。下面每个目录都是完整插件包；绑定拷自加载器，升级加载器时同步更新。

| 模板 | 运行时 | 构建 |
|---|---|---|
| [Node.js/TypeScript](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/node-typescript) | Node.js 20+ | `npm install && npm run build` |
| [Python](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/python) | Python 3.8+ | 无 |
| [Kotlin/JVM](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/kotlin) | JDK 21+ | `./build.sh`（Windows 用 `build.ps1`） |

在 `PATH` 上准备运行时与 `RpcLoader`。先构建运行时，跑它的 `pack.sh`（Windows 用 `pack.ps1`）生成 `manifest.json` 信封，把 `dist/<名称>/` 复制到 `plugins/` 后重启。打包脚本调用框架打包器，需要并列的 `PluginManager` 检出，或用 `HOSIHIKARI_PLUGINMANAGER` 指向一个。Python 清单使用 `python3`，Windows 上改成 `python`。协议与上下文见[进程外插件](/zh/framework/develop/authoring-rpc/)。

## 怎么选

- **预编译程序集**：多文件项目、NuGet 依赖，以及以 DLL 形式交付的代码。
- **C# 或 F# 源码**：由加载器在装载时编译的小型插件，包括用 `#:include` 组织多文件、用 `#:package` 在打包期还原依赖的 C# 插件。
- **RPC**：Node.js、Python、Kotlin 插件，以及适合在服务器进程外运行的工作。
