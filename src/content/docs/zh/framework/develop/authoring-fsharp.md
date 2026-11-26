---
title: F# 插件
description: 写一个由加载器在装载时编译的 F# 源码插件。
---

F# 直接跑在 CLR 上，`Hosihikari.PluginLoader.FSharp` 在装载时把 `.fsx` 编成程序集，再装进 collectible ALC。作者交的是源码，拿到的是与其他程序集插件一样的隔离与卸载承诺。

包结构、清单字段、生命周期、配置与部署步骤都与 [C# 插件](/zh/framework/develop/authoring-csharp/)相同。这一页只讲不一样的部分。

## 准备

按服务端选 HostingShim 变体（见[选择载体](/zh/framework/server/carriers/)），再装 F# 加载器：

把 LeviLamina 载体归档、`hosihikari-core-<版本>.zip` 与 `hosihikari-fsharp-<版本>.zip` 解压到服务端根目录。用 Seiko 时，`sk add hosihikari-fsharp` 会连同插件管理器一起装好。

[F# 模板](https://github.com/HosihikariFramework/FSharpPluginTemplate)是一个可以拷进 `plugins/`、改名、重启的完整包。`dotnet new` 模板包另带一个 F# 预编译模板 `hosihikari-plugin-fsharp`。

## 包结构

```
plugins/hello-fsharp/
  hosihikari.json
  main.fsx
  hello-fsharp.conf
```

上面的结构是源码树。父级靠打包器生成的 `manifest.json` 信封发现包，所以安装前先打包。在插件目录里、装好 `hosihikari-pack` 工具（`dotnet tool install -g Hosihikari.Plugin.Pack`）后：

```bash
hosihikari-pack pack-plugin . ./hosihikari.json ./dist
```

再把 `dist/hello-fsharp/` 复制到服务端 `plugins/hello-fsharp/`。

清单，注意加载器名与依赖：

```json
{
  "schemaVersion": 1,
  "name": "hello-fsharp",
  "version": "1.0.0",
  "entry": "main.fsx",
  "loader": "fsharp",
  "kind": "plugin",
  "apiVersion": 3,
  "dependencies": [
    { "name": "hosihikari" },
    { "name": "hosihikari-fsharp" }
  ]
}
```

入口路径由 `hosihikari.json` 决定，文件名不固定为 `main.fsx`。

## 入口

定义一个实现 `IPlugin`、有无参构造的类型。四个钩子都是异步方法并接收 `CancellationToken`；钩子参数要标类型：`OnLoad` 上编译器需要它，它不会从接口推断。

```fsharp
open Hosihikari
open System.IO
open System.Threading
open System.Threading.Tasks

type HelloPlugin() =
    let mutable dataDirectory = ""

    interface IPlugin with
        member this.OnLoad(context: IPluginContext, token: CancellationToken) : ValueTask =
            dataDirectory <- context.DataDirectory
            let greeting = context.Configuration.["greeting"]
            File.WriteAllText(Path.Combine(dataDirectory, "body.txt"), "body:" + greeting)
            ValueTask()
        member this.OnEnable(token: CancellationToken) : ValueTask<PluginHookResult> =
            File.WriteAllText(Path.Combine(dataDirectory, "enabled.txt"), "enabled")
            ValueTask.FromResult(PluginHookResult.Allow())
        member this.OnDisable(token: CancellationToken) : ValueTask<PluginHookResult> =
            ValueTask.FromResult(PluginHookResult.Allow())
        member this.OnUnload(token: CancellationToken) : ValueTask = ValueTask()
```

`context.Events` 与 `context.Scheduler` 的用法与 C# 完全一致。

## 怎么编译的

加载器直接驱动 `FSharpChecker`，没有走 `GetProjectOptionsFromScript`：在没有 SDK 上下文的目录里，那个辅助函数会退到 .NET Framework 的引用集。它传 `--noframework --targetprofile:netcore`，外加一份显式引用清单：

- 框架自己 ALC 里已加载的程序集，这样契约保持身份一致；
- 插件包根目录里的私有 DLL；
- 加载器自己的目录，`FSharp.Core` 及相关程序集在这里；
- 宿主的受信平台程序集。

F# 插件是真正引用契约的程序集，所以它能用到 C# 插件的一切——包括按类型做键的通道（事件总线、服务注册表），那是在进程外插件拿不到的。

## 缓存

产物按内容寻址：`data/hosihikari/<name>/bin/<hash>/<name>.dll`，旁边有校验和，装载前会核对。不一致就重新编译，绝不将就装载。

哈希覆盖源码文本、`#load` 与本地 `#r` 拉进来的文件、私有 DLL 的名字与内容、编译器版本与运行时版本。用到 `#I`、`nuget:` 引用、通配符或无法解析路径的入口，每次装载都重编进一个独立的 `-run-` 目录。

## 打包要点

- 生成出来的 F# 包带 `FSharp.Core.dll`；共享的契约 DLL 不进包。
- 预编译 F# 插件与 C# 一样走 `loader: assembly`，模板是 `hosihikari-plugin-fsharp`。
- 这个加载器是 LGPL-3.0-or-later，插件管理器与寄宿垫片同样如此。只有契约、构建、测试与模板包属 MIT 一族；具体看你那一份的 `LICENSE.md`。

## 部署与验证

把目录放进 `plugins/` 并启动服务端。日志里应当能看到插件装载与启用；数据目录里出现插件写入的文件。
