---
title: 开始内嵌
description: 加包，立一个最小宿主。
---

你有一个自己掌控的进程，要把 `Hosihikari.PluginManager` 嵌进去。管理器提供发现、依赖排序、隔离与生命周期；载体服务由你提供，启停也由你决定。

只是想在基岩版服务端上跑插件，用[载体](/zh/framework/server/)就好——载体本身就是已经把这些做好的宿主。

## 加包

```bash
dotnet add package Hosihikari.PluginManager
```

管理器面向 .NET 10，依赖 `Hosihikari.Plugin.Abstractions` 取插件契约。

## 构造它

```csharp
using Hosihikari;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.SetMinimumLevel(LogLevel.Information);
    builder.AddSimpleConsole(options => options.SingleLine = true);
});

var services = new ServiceCollection()
    .AddSingleton(loggerFactory)
    .BuildServiceProvider();

var manager = new PluginManager(
    pluginsRoot: Path.Combine(root, "plugins"),
    dataRoot: Path.Combine(root, "data", "hosihikari"),
    configRoot: Path.Combine(root, "config", "hosihikari"),
    reportFault: entry => loggerFactory.CreateLogger("Hosihikari").LogError("加载问题：{Entry}", entry),
    carrierServices: services,
    onRemoved: name => { /* 插件已经不在了，把你自己的记录摘掉 */ });
```

三个根目录归你管。管理器按需创建 `data/` 与 `config/` 下的子目录；它不会替你建 `plugins/`，缺这个目录就等于没有插件。

- `reportFault` 收到的是钩子之外的问题——进程死了、协议出错、包在装载前被拒。
- `carrierServices` 是插件通过 `IPluginContext.CarrierServices` 取用的 `IServiceProvider`。往里放一个 `ILoggerFactory`：不放的话插件拿到空日志器，它们写的每一行都会无声消失。
- `onRemoved` 在故障插件卸载成功之后触发，供你把那一条从自己的注册表里摘掉。

## 登记你支持的加载器

管理器本身不会装载任何东西。加载器是一个插件包，装载时把自己登记进来；内置的程序集加载器负责预编译 DLL：

```csharp
manager.RegisterLoader(new AssemblyPluginLoader());
manager.LoadAll();
```

要支持源码插件，把对应的加载器包和其他插件一起装上，让它自己登记；见[载体服务](/zh/framework/embed/carrier-services/)。

## 配置项

给七参数构造函数传 `PluginManagerOptions`：

```csharp
var options = new PluginManagerOptions
{
    UnloadVerificationTimeout = TimeSpan.FromSeconds(60),
};

var manager = new PluginManager(pluginsRoot, dataRoot, configRoot, reportFault, carrierServices, onRemoved, options);
```

`UnloadVerificationTimeout` 是确认已放下的插件真的被回收的时间预算，默认 30 秒。有限值必须为正且不超过约 49.7 天；不限时用 `Timeout.InfiniteTimeSpan`。超时是[生命周期](/zh/framework/embed/lifecycle/)里描述的失败方式之一。

## 接下来

- [载体服务](/zh/framework/embed/carrier-services/)——宿主必须提供什么，加载器怎么登记。
- [生命周期](/zh/framework/embed/lifecycle/)——`Load`、`Enable`、`Disable`、`Unload` 与状态快照。
- [事件与回调](/zh/framework/embed/events-and-callbacks/)——事件总线，以及回到宿主的那两个回调。

插件本身怎么写在[写插件](/zh/framework/develop/)。
