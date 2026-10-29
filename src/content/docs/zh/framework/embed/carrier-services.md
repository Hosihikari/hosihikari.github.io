---
title: 载体服务
description: 宿主必须提供什么，加载器怎么登记自己。
---

宿主提供一个带 `ILoggerFactory` 的 `IServiceProvider`，并登记它支持的加载器。发现、隔离与生命周期归管理器；其余都来自宿主。这一页写的就是两者之间的契约。

## 服务提供者

`carrierServices` 是传给构造函数的 `IServiceProvider`。插件通过 `IPluginContext.CarrierServices` 取用它，拿宿主拥有的东西：游戏世界句柄、绑在主线程上的调度器、指标汇。框架不检查它里面的内容。

两条规矩：

- **往里放一个 `ILoggerFactory`。** 不放的话插件拿到空日志器，它们写的每一行都会消失，而且没人会报这件事。
- **别把宿主类型塞进插件契约。** 这样取到的服务是按你宿主的类型声明的；用它的插件就绑死在你的宿主上，这是逃生舱的用法。只用宿主服务的插件才能跨宿主搬动。

框架自己的五项服务——日志、配置、数据目录、调度、事件总线——不算载体服务。它们由管理器提供，在每个宿主里都一样。

## 登记加载器

管理器把包路由给认领它的加载器。它只自带一个：处理预编译 IL 的内置程序集加载器。

```csharp
manager.RegisterLoader(new AssemblyPluginLoader());
```

其余加载器都是插件包，在 `OnLoad` 里自己登记：

```csharp
// 某个加载器插件的 OnLoad 里
context.RegisterLoader(new MyLoader());
```

管理器记下这条登记；id 已被占用时返回 `false`。登记不能撤销：加载器交出的类型住在它的装载上下文里，所以更换或移除加载器意味着重启服务端。

登记发生在装载时，因此顺序有意义。需要某个加载器的插件要在清单里声明依赖它，依赖图会让加载器先装：

```json
"dependencies": [
  { "name": "hosihikari" },
  { "name": "hosihikari-csharp" }
]
```

比加载器先到的包没有加载器认领，会被跳过并留下报告。

## 加载器诊断

加载器可以实现 `IPluginLoaderDiagnostics`，在装载前检查包。管理器在 `CanLoad` 选中这个加载器之后、`Load` 开始之前调用 `Validate`：

```csharp
public IReadOnlyList<string> Validate(PluginManifest manifest, string packageDirectory)
{
    var entryPath = Path.Combine(packageDirectory, manifest.EntryPath);
    return File.Exists(entryPath)
        ? []
        : [$"entry not found: {manifest.EntryPath}"];
}
```

返回非空列表时，问题并入装载报告并跳过该包；空列表则继续装载。诊断只报告问题——路由仍由 `CanLoad` 决定。

## 宿主拿不到的东西

这份契约不交出插件句柄。要按名字找插件，用[生命周期](/zh/framework/embed/lifecycle/)里的状态快照；要对它做事，直接调管理器的方法。
