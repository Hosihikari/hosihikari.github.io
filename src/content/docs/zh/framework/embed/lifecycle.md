---
title: 生命周期
description: 装载、启用、停用、卸载，以及每个调用返回什么。
---

每一次状态迁移都由宿主驱动。管理器不会自己启动任何东西：`LoadAll` 是你要求把整套装上，下面这些按插件调用的方法则是其余部分。

## 调用

```csharp
manager.LoadAll();              // 按依赖顺序装载 plugins/ 下的全部
manager.Load(packageDirectory); // 按路径装载单个包
manager.Enable("Hello");        // 按清单名启用
manager.Disable("Hello");
manager.Unload("Hello");
```

`Load` 与 `Enable` 返回 bool。`Unload` 返回带两个字段的 `UnloadResult`：

```csharp
public readonly record struct UnloadResult(bool Released, string? Error);
```

- `Released` 只在插件真的被回收时为 true。
- `Error` 在没回收时带上原因。

## 卸载分两段

卸载不是一步。管理器先放下实例与作用域，再等加载器确认程序集装载上下文已被回收。两段的失败方式不一样：

| 情况 | 结果 |
| --- | --- |
| 还有插件依赖它 | 拒绝，`Released` 为 false。先卸下游插件——管理器不做级联。 |
| 这个插件是已登记的加载器 | 拒绝；加载器不能在运行期更换。重启服务端。 |
| 插件拒绝了停用 | 拒绝；插件留在原处，可能仍在活跃。 |
| 已放下，但回收没被确认 | `Released` 为 false，`Error` 里写超时；插件停在 `Detached`。再调一次 `Unload` 重新验证。 |

最后一种值得记住。实例已经没了，但装载上下文被什么东西钉住——静态字段、还在跑的线程、`OnUnload` 里没清掉的引用。再调 `Unload` 只重跑验证，暂时被钉住的上下文第二次可能就过了。

`UnloadVerificationTimeout` 设定这段等待的预算，见[开始内嵌](/zh/framework/embed/getting-started/)。

## 状态快照

`Plugins` 返回每个槽位的只读快照，包含已放下、等待回收的插件：

```csharp
using Microsoft.Extensions.Logging;

var log = loggerFactory.CreateLogger("PluginManager");

foreach (var info in manager.Plugins)
{
    log.LogInformation(
        "{Name} {Version} loader={Loader} state={State} enabled={Enabled}",
        info.Name, info.Version, info.Loader, info.State, info.Enabled);
}
```

`TryGetPlugin("Hello", out var info)` 按名字取一条；`Detached` 的条目也能找到。

`PluginInfo` 带清单名与版本、加载器 id、`PluginState`、逻辑上的 `Enabled` 标志、这个包是不是已登记的加载器，以及声明的依赖。每条依赖暴露 `Name` 与 `VersionRange`。

两个字段容易混：

- `PluginState.Loaded` 表示实例与作用域都在。`PluginState.Detached` 表示它们已经放下、只等回收——插件仍在表里，但不在运行。
- `Enabled` 是另一条轴。插件可以同时是已装载且已停用。

`LoadedNames` 是在场且为 `Loaded` 的插件名，短一些的那份清单。

## 快照不是什么

它是快照：拿着它不会钉住任何东西，它也不会反映之后的变化。要看当前状态就再查一次 `Plugins`。它也不交出插件实例——那要直接调管理器；句柄归管理器所有。
