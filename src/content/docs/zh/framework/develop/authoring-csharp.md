---
title: C# 插件
description: 写一个由加载器在装载时编译的 C# 源码插件。
---

C# 跑在 CLR 上，所以 `Hosihikari.PluginLoader.CSharp` 在装载时用 Roslyn 编译 `.cs`，再把程序集装进 collectible ALC。作者交付源码；产物得到与任何程序集插件相同的隔离与卸载保证。这是进程内加载器：它在插件运行之前把源码 AOT 为 IL，再把这段 IL 装进 collectible ALC；插件本身是普通的 CLR 代码。

## 准备

按服务端选 HostingShim 变体（见[选择载体](/zh/framework/server/carriers/)）；下面以 LeviLamina 为例：

把 LeviLamina 载体归档、`hosihikari-core-<版本>.zip` 与 `hosihikari-csharp-<版本>.zip` 解压到服务端根目录。用 Seiko 时，`sk add hosihikari-csharp` 会连同插件管理器一起装好。

[C# 模板](/zh/framework/develop/templates/)是一份可以复制、改名的完整插件包。

## 包结构

```
plugins/hello-csharp/
  hosihikari.json
  main.cs
  hello-csharp.conf
```

上面的结构是源码树。父级靠打包器生成的 `manifest.json` 信封发现包，所以安装前先打包。在插件目录里、装好 `hosihikari-pack` 工具（`dotnet tool install -g Hosihikari.Plugin.Pack`）后：

```bash
hosihikari-pack pack-plugin . ./hosihikari.json ./dist
```

再把 `dist/hello-csharp/` 复制到服务端 `plugins/hello-csharp/`。

清单：

```json
{
  "schemaVersion": 1,
  "name": "hello-csharp",
  "version": "1.0.0",
  "entry": "main.cs",
  "loader": "csharp",
  "kind": "plugin",
  "apiVersion": 3,
  "dependencies": [{ "name": "hosihikari" }, { "name": "hosihikari-csharp" }]
}
```

## file-based 指令

入口文件接受两个 .NET file-based apps 指令。Roslyn 编译前会把它们换成空行，打包器则按它们行事：

- `#:package Newtonsoft.Json@13.0.3`：打包期把包还原进插件包。服务端装载插件时不还原、不下载。
- `#:include helpers.cs`：把包内另一个 `.cs` 文件和入口一起编译。路径相对于当前文件，可以加引号，也可以用 `..` 指向包内的兄弟目录；支持 `*`、`**`、`?` 通配符，例如 `#:include "../shared/*.cs"`。

`#:project`、`#:property`、`#:sdk` 与顶层语句都不支持。入口仍要定义 `IPlugin` 类型。需要独立运行循环时，先用普通 file-based app 或项目开发，再用预编译模板打包程序集。

## 入口

文件里定义一个实现 `IPlugin`、有无参构造的类型；加载器找到它并实例化。四个钩子都是异步方法并接收 `CancellationToken`；`OnEnable` 与 `OnDisable` 返回 `PluginHookResult`。

```csharp
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Hosihikari;
using Microsoft.Extensions.Logging;

public sealed class HelloPlugin : IPlugin
{
    private IPluginContext _context = null!;

    public ValueTask OnLoad(IPluginContext context, CancellationToken token)
    {
        _context = context;
        context.Logger.LogInformation("loaded, package {Dir}", context.PackageDirectory);
        File.WriteAllText(Path.Combine(context.DataDirectory, "loaded.txt"), "loaded");
        return ValueTask.CompletedTask;
    }

    public ValueTask<PluginHookResult> OnEnable(CancellationToken token)
    {
        var greeting = _context.Configuration["greeting"];
        _context.Logger.LogInformation("enabled, greeting={Greeting}", greeting);
        File.WriteAllText(Path.Combine(_context.DataDirectory, "enabled.txt"), greeting ?? "");
        return ValueTask.FromResult(PluginHookResult.Allow());
    }

    public ValueTask<PluginHookResult> OnDisable(CancellationToken token) =>
        ValueTask.FromResult(PluginHookResult.Allow());

    public ValueTask OnUnload(CancellationToken token) => ValueTask.CompletedTask;
}
```

`using Microsoft.Extensions.Logging;` 是必需的：`LogInformation` 是扩展方法。框架在专起的一根线程上跑钩子，底下没有 `SynchronizationContext`，钩子里同步阻塞是安全的；尊重令牌，钩子超时才能把它截断。

## 编译与缓存

- 装载时编译；源码插件不需要 csproj。
- 产物按内容寻址，落在 `data/hosihikari/<name>/bin/<hash>/` 下，旁边是校验和与 portable PDB。
- 改动源码、私有 DLL、Roslyn 版本或运行时版本都会改变哈希。
- 包根的私有 DLL 参与编译引用，运行期从包里解析。
- 本机库放在包根或 `runtimes/<当前 portable RID>/native/` 下；RID 目录优先。

## 配置

包内默认 `hello-csharp.conf`：

```text
greeting = "Hello, Hosihikari"
```

服务端覆盖是 `config/hosihikari/hello-csharp.conf`；环境变量也覆盖同名键。

## 事件与定时器

`context.Events` 与 `context.Scheduler` 来自框架。停用先关闭闸门，事件与定时器回调随之中断；把周期任务的启动放到 `OnEnable`。顺序要紧时订阅带档位：`context.Events.Subscribe<SomeEvent>(OnSomeEvent, EventPriority.High)`。

## 程序集插件

已有编译好的 DLL 时，把它放进包，`loader` 写 `assembly`，`entry` 指向该 DLL。入口在程序集上声明：

```csharp
[assembly: EntryPoint<HelloPlugin>]
```

引用契约并排除它的运行期资产，包里就不会多出一份副本。下界必须从 2.0.1 起：NuGet 对版本范围取最低满足版本，而 2.0.0 带着一个坏的依赖。

```xml
<PackageReference Include="Hosihikari.Plugin.Abstractions" Version="[2.0.1,3.0.0)" ExcludeAssets="runtime" />
```

程序集里恰好一个 `EntryPoint<T>`；入口类型实现 `IPlugin` 且有无参构造。

## 部署与验证

把打包产物复制到 `plugins/` 后启动服务端。日志应出现 `loaded, package` 与 `enabled`；数据目录里出现 `loaded.txt` 与 `enabled.txt`。卸载时插件管理器通过插件的 `PluginHandle` 动手：`Unload()` / `WaitForUnloadAsync()` 释放它，`IsUnloaded` 在 ALC 放下之后验证回收。
