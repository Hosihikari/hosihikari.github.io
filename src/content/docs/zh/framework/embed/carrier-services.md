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

## 载体包与配置器

载体包是原生垫片加一份 `kind: carrier` 的 `hosihikari.json`。管理器从垫片在启动时交来的载体目录里读这份清单，所以同一份构建装到哪儿都成立。这里有两个可选组：

- `carrier.components`：进程级托管组件（见[插件包](/zh/framework/develop/plugin-package/)）。
- `carrier.bootstrap`：一个实现了 `ICarrierServicesConfigurator` 的 `{ assembly, type }`。管理器构造它，在服务提供器建成之前调用 `Configure(IServiceCollection services, nint hostHandle)`，然后把那个提供器作为 `CarrierServices` 交给插件与组件。

原生句柄是载体自己的指针（Endstone 传它的 `Plugin*`；LeviLamina 父级态不传）。核心原样透传；配置器决定用哪个类型、哪个键暴露出去，键类型住在你的载体代码里——框架从不引用它。

```csharp
public sealed class CarrierServicesConfigurator : ICarrierServicesConfigurator
{
    public void Configure(IServiceCollection services, nint hostHandle)
    {
        services.AddSingleton(new HostHandle(hostHandle));
    }
}
```

没有清单就没有配置器：目录里没有 `hosihikari.json` 时，容器里只有日志工厂，验证宿主与本地调试走的就是这条。

## 登记加载器

管理器把包路由给认领它的加载器。它只自带一个：处理预编译 IL 的内置程序集加载器。

```csharp
manager.RegisterLoader(new AssemblyPluginLoader());
```

其余加载器都是 `kind: loader` 的插件包，在 `OnLoad` 里自己登记。只有这类包拿到 `ILoaderContext`，所以参数要按这个类型写：

```csharp
// 某个加载器插件的 OnLoad 里
public ValueTask OnLoad(ILoaderContext context, CancellationToken token)
{
    context.RegisterLoader(new MyLoader());
    return ValueTask.CompletedTask;
}
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
public IReadOnlyList<PluginDiagnostic> Validate(PluginManifest manifest, string packageDirectory)
{
    var entryPath = Path.Combine(packageDirectory, manifest.EntryPath);
    return File.Exists(entryPath)
        ? []
        : [PluginDiagnostic.Error("entry-missing", $"entry not found: {manifest.EntryPath}")];
}
```

返回非空列表时，每条诊断并入装载报告并跳过该包；空列表则继续装载。诊断只报告问题——路由仍由 `CanLoad` 决定。

## 宿主拿不到的东西

这份契约不交出插件句柄。要按名字找插件，用[生命周期](/zh/framework/embed/lifecycle/)里的状态快照；要对它做事，直接调管理器的方法。
