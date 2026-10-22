---
title: 插件管理者 API
description: 配置插件管理者、读取插件状态，并为加载器添加装载前诊断。
---

这些 API 面向内嵌 `Hosihikari.PluginManager` 的宿主和自定义加载器的作者。插件作者通常使用
[插件契约](/zh/authoring-csharp/)与[测试插件](/zh/testing/)。

## 管理者配置

七参数构造函数接受 `PluginManagerOptions`：

```csharp
using Hosihikari;

var options = new PluginManagerOptions
{
    UnloadVerificationTimeout = TimeSpan.FromSeconds(60),
};

var manager = new PluginManager(
    pluginsRoot, dataRoot, configRoot, reportFault,
    carrierServices, onRemoved, options);
```

`UnloadVerificationTimeout` 是插件被放下之后，等待回收验证的时间预算，默认 30 秒。有限值必须为
正且不超过约 49.7 天；用 `Timeout.InfiniteTimeSpan` 表示不限时等待。

超时按卸载失败记录：报告写明超时，插件在管理者表里保持 `Detached`，`Unload` 返回失败。再次调用
`Unload` 会重试回收验证。六参数构造函数使用默认配置。

## 状态快照

`Plugins` 返回所有槽位的只读快照，包含已经放下、等待回收的插件。`TryGetPlugin` 按名字读取一个，
`Detached` 的条目也能取到。

```csharp
foreach (var info in manager.Plugins)
{
    Console.WriteLine(
        $"{info.Name} {info.Version} loader={info.Loader} " +
        $"state={info.State} enabled={info.Enabled}");
}
```

`PluginInfo` 带清单里的名字与版本、加载器 id、`PluginState`、逻辑上的 `Enabled`、这个包是否是已登记
的加载器，以及清单声明的依赖。每条依赖暴露 `Name` 与 `VersionRange`。`PluginState.Loaded` 表示实例
与作用域在场；`PluginState.Detached` 表示它们已经放下，只等回收。`Enabled` 是另一条轴。

`LoadedNames` 仍是在场且为 `Loaded` 的插件名列表。

## 加载器诊断

加载器还可以实现 `IPluginLoaderDiagnostics`。管理者在 `CanLoad` 选中加载器之后、`Load` 开始之前
调用 `Validate(manifest, packageDirectory)`；返回非空列表时，问题并入装载报告并跳过该包，空列表则
继续装载。诊断不改变路由：选哪个加载器仍由 `CanLoad` 决定。

```csharp
public IReadOnlyList<string> Validate(PluginManifest manifest, string packageDirectory)
{
    var entryPath = Path.Combine(packageDirectory, manifest.EntryPath);
    return File.Exists(entryPath)
        ? []
        : [$"入口不存在：{manifest.EntryPath}"];
}
```

## 构建与测试包

`Hosihikari.Plugin.Build` 提供 `PackPlugin` 目标；多目标项目要带 `-f <tfm>`。
`Hosihikari.Testing` 提供 `PluginTestHost` 与 `PluginManagerHarness`。见
[模板](/zh/templates/)与[测试插件](/zh/testing/)。
