---
title: F# 插件
description: 写一个由加载器在装载时编译的 F# 源码插件。
---

F# 直接跑在 CLR 上，`Hosihikari.PluginLoader.FSharp` 在装载时把 `.fsx` 编成程序集，再装进 collectible ALC。作者交的是源码，拿到的是与其他程序集插件一样的隔离与卸载承诺。

包结构、清单字段、生命周期、配置与部署步骤都与 [C# 插件](/zh/develop/authoring-csharp/)相同。这一页 只讲不一样的部分。

## 准备

按服务端选 HostingShim 变体（见[选择载体](/zh/server/carriers/)），再装 F# 加载器：

```bash
lip install github.com/HosihikariFramework/HostingShim#levilamina
lip install github.com/HosihikariFramework/FSharpLoader
```

[F# 模板](https://github.com/HosihikariFramework/FSharpPluginTemplate)是一个可以拷进 `plugins/`、改名、 重启的完整包。`dotnet new` 模板包另带一个 F# 预编译模板 `hosihikari-plugin-fsharp`。

## 包结构

```
plugins/hello-fsharp/
  manifest.json
  main.fsx
  hello-fsharp.conf
```

清单，注意加载器名与依赖：

```json
{
  "name": "hello-fsharp",
  "entry": "main.fsx",
  "type": "hosihikari",
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari" },
    { "name": "hosihikari-fsharp" }
  ],
  "extraInfo": { "api_version": "2", "manifest_version": "1", "loader": "fsharp" }
}
```

入口路径由 `manifest.json` 决定，文件名不固定为 `main.fsx`。

## 入口

定义一个实现 `IPlugin`、有无参构造的类型。钩子参数要标类型：`OnLoad` 上编译器需要它，它不会从接口推断。

```fsharp
open Hosihikari
open System.IO

type HelloPlugin() =
    let mutable dataDirectory = ""

    interface IPlugin with
        member this.OnLoad(context: IPluginContext) =
            dataDirectory <- context.DataDirectory
            let greeting = context.Configuration.["greeting"]
            File.WriteAllText(Path.Combine(dataDirectory, "body.txt"), "body:" + greeting)
        member this.OnEnable() =
            File.WriteAllText(Path.Combine(dataDirectory, "enabled.txt"), "enabled")
            PluginHookResult.Allow()
        member this.OnDisable() = PluginHookResult.Allow()
        member this.OnUnload() = ()
```

`context.Events` 与 `context.Scheduler` 的用法与 C# 完全一致。

## 怎么编译的

加载器直接驱动 `FSharpChecker`，没有走 `GetProjectOptionsFromScript`：在没有 SDK 上下文的目录里， 那个辅助函数会退到 .NET Framework 的引用集。它传 `--noframework --targetprofile:netcore`，外加一份 显式引用清单：

- 框架自己 ALC 里已加载的程序集，这样契约保持身份一致；
- 插件包根目录里的私有 DLL；
- 加载器自己的目录，`FSharp.Core` 及相关程序集在这里；
- 宿主的受信平台程序集。

F# 插件是真正引用契约的程序集，所以它能用到 C# 插件的一切——包括按类型做键的通道（事件总线、服务 注册表），那是在进程外插件拿不到的。

## 缓存

产物按内容寻址：`data/hosihikari/<name>/bin/<hash>/<name>.dll`，旁边有校验和，装载前会核对。不一致就 重新编译，绝不将就装载。

哈希覆盖源码文本、`#load` 与本地 `#r` 拉进来的文件、私有 DLL 的名字与内容、编译器版本与运行时版本。 用到 `#I`、`nuget:` 引用、通配符或无法解析路径的入口，每次装载都重编进一个独立的 `-run-` 目录。

## 打包要点

- 生成出来的 F# 包带 `FSharp.Core.dll`；共享的契约 DLL 不进包。
- 预编译 F# 插件与 C# 一样走 `loader: assembly`，模板是 `hosihikari-plugin-fsharp`。
- 这个加载器是 LGPL-3.0-or-later，与框架自己的包不同。

## 部署与验证

把目录放进 `plugins/` 并启动服务端。日志里应当能看到插件装载与启用；数据目录里出现插件写入的文件。
