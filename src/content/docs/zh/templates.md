---
title: 模板
description: 从每种插件类型的维护模板开始。
---

每个模板都是一个完整的插件包。复制到服务端 `plugins/<名称>/`，改 `manifest.json` 的 `name`
与同名 `.conf`；目录名必须与清单 `name` 一致。模板为 MIT-0；框架契约仍为 LGPL-3.0-or-later。

## 预编译程序集

核心内置的程序集入口加载 .NET 类库，不需要安装 Provider 包。

```powershell
dotnet new install Hosihikari.Plugin.Template
dotnet new hosihikari-plugin -n MyPlugin
```

用框架打包器构建打包。打包器需要同级的 `Hosihikari.PluginManager` 检出，或由
`HOSIHIKARI_PLUGINMANAGER` 指向一个：

```powershell
cd MyPlugin
pwsh ./pack.ps1
```

`dist/MyPlugin/` 就是插件包。见
[模板说明](https://github.com/HosihikariFramework/Abstractions/tree/main/templates/Hosihikari.Plugin.Template)。

## C# 与 F# 源码

C# 与 F# Provider 在装载时编译源码；包里放源码，没有构建产物。

| 模板 | Provider | 安装 |
|---|---|---|
| [CSharpPluginTemplate](https://github.com/HosihikariFramework/CSharpPluginTemplate) | `hosihikari-csharp` | `lip install github.com/HosihikariFramework/CSharpProvider` |
| [FSharpPluginTemplate](https://github.com/HosihikariFramework/FSharpPluginTemplate) | `hosihikari-fsharp` | `lip install github.com/HosihikariFramework/FSharpProvider` |

复制仓库到 `plugins/MyCSharpPlugin/` 或 `plugins/MyFSharpPlugin/`，改名后重启。契约见
[C# 插件](/zh/authoring-csharp/)。

## 进程外运行时

RpcProvider 启动清单 `extraInfo.command` 里的命令，通过 stdio 走 JSON-RPC。下面每个目录都是
完整插件包；绑定拷自 Provider，升级 Provider 时同步更新。

| 模板 | 运行时 | 构建 |
|---|---|---|
| [Node.js/TypeScript](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/node-typescript) | Node.js 20+ | `npm install && npm run build` |
| [Python](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/python) | Python 3.8+ | 无 |
| [Kotlin/JVM](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/kotlin) | JDK 21+ | `./build.sh`（Windows 用 `build.ps1`） |

在 `PATH` 上准备运行时与 `RpcProvider`，把目录复制到 `plugins/` 后重启。Python 清单使用
`python3`，Windows 上改成 `python`。协议与上下文见[进程外桥](/zh/authoring-rpc/)。

## 怎么选

- **预编译程序集**：多文件项目、NuGet 依赖，以及以 DLL 形式交付的代码。
- **C# 或 F# 源码**：由 Provider 在装载时编译的单文件插件。
- **RPC**：Node.js、Python、Kotlin 插件，以及适合在服务器进程外运行的工作。
