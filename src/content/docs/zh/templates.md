---
title: 模板
description: 从每种插件种类的维护模板开始。
---

每个模板都是一个完整的插件包。复制到服务端 `plugins/<名称>/`，改 `manifest.json` 的 `name`
与同名 `.conf`；目录名必须与清单 `name` 一致。模板为 MIT-0；Hosihikari.Plugin.Abstractions 1.0.0 及之后为 MIT。

## 预编译程序集

插件管理器内置的程序集入口加载 .NET 类库，不需要安装加载器包。

```powershell
dotnet new install Hosihikari.Plugin.Templates
dotnet new hosihikari-plugin -n MyPlugin
```

用框架打包器构建打包。打包器需要同级的 `Hosihikari.PluginManager` 检出，或由
`HOSIHIKARI_PLUGINMANAGER` 指向一个：

```powershell
cd MyPlugin
pwsh ./pack.ps1
```

`dist/MyPlugin/` 就是插件包。见
[模板说明](https://github.com/HosihikariFramework/PluginAbstractions/tree/main/templates/Hosihikari.Plugin.Template)。

## C# 与 F# 源码

C# 与 F# 加载器在装载时编译源码；包里放源码，没有构建产物。

| 模板 | 加载器 | 安装 |
|---|---|---|
| [CSharpPluginTemplate](https://github.com/HosihikariFramework/CSharpPluginTemplate) | `hosihikari-csharp` | `lip install github.com/HosihikariFramework/CSharpLoader` |
| [FSharpPluginTemplate](https://github.com/HosihikariFramework/FSharpPluginTemplate) | `hosihikari-fsharp` | `lip install github.com/HosihikariFramework/FSharpLoader` |

`CSharpPluginTemplate` 演示 `#:package` 与 `#:include`；先跑它的 `pack.ps1` 或 `pack.sh`，
再把 `dist/MyCSharpPlugin/` 复制到 `plugins/`。`FSharpPluginTemplate` 演示 `#load`，直接复制仓库
到 `plugins/MyFSharpPlugin/`。改名后重启。契约见 [C# 插件](/zh/authoring-csharp/)。

## 进程外运行时

RpcLoader 启动清单 `extraInfo.command` 里的命令，通过 stdio 走 JSON-RPC。下面每个目录都是
完整插件包；绑定拷自加载器，升级加载器时同步更新。

| 模板 | 运行时 | 构建 |
|---|---|---|
| [Node.js/TypeScript](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/node-typescript) | Node.js 20+ | `npm install && npm run build` |
| [Python](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/python) | Python 3.8+ | 无 |
| [Kotlin/JVM](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/kotlin) | JDK 21+ | `./build.sh`（Windows 用 `build.ps1`） |

在 `PATH` 上准备运行时与 `RpcLoader`，把目录复制到 `plugins/` 后重启。Python 清单使用
`python3`，Windows 上改成 `python`。协议与上下文见[进程外插件](/zh/authoring-rpc/)。

## 怎么选

- **预编译程序集**：多文件项目、NuGet 依赖，以及以 DLL 形式交付的代码。
- **C# 或 F# 源码**：由加载器在装载时编译的小型插件，包括用 `#:include` 组织多文件、用 `#:package` 在打包期还原依赖的 C# 插件。
- **RPC**：Node.js、Python、Kotlin 插件，以及适合在服务器进程外运行的工作。
