---
title: 测试插件
description: 不启动基岩版专用服务器，直接驱动插件生命周期与宿主服务。
---

`Hosihikari.Testing` 是面向插件作者的测试包。它跟框架走同一条契约线（`Hosihikari.Plugin.Abstractions` 2.0），并把 `Hosihikari.PluginManager` 钉在验证过的那条线上；装的时候不写版本，让 NuGet 取与契约对应的那个发布。

```bash
dotnet add package Hosihikari.Testing
```

## 生命周期宿主

`PluginTestHost` 直接驱动四个公开钩子。它不启动 BDS、不读清单，也不创建程序集装载上下文。

```csharp
using System.Threading;
using System.Threading.Tasks;
using Hosihikari;
using Hosihikari.Testing;

public sealed class MyPlugin : IPlugin
{
    public ValueTask OnLoad(IPluginContext context, CancellationToken token) => ValueTask.CompletedTask;
    public ValueTask<PluginHookResult> OnEnable(CancellationToken token) =>
        ValueTask.FromResult(PluginHookResult.Allow());
    public ValueTask<PluginHookResult> OnDisable(CancellationToken token) =>
        ValueTask.FromResult(PluginHookResult.Allow());
    public ValueTask OnUnload(CancellationToken token) => ValueTask.CompletedTask;
}

using var host = new PluginTestHost(new MyPlugin());
host.RunLifecycle();

// host.HookLog: load → enable → disable → unload
```

宿主给每个钩子传 `CancellationToken.None`，并在调用方线程之外跑它们，钩子里同步阻塞的行为与生产一致。

测试上下文给出与生产同形的服务：

- `Events` —— 同步事件总线，档位同样是六档；handler 异常收进 `TestEvents.HandlerErrors`。
- `Scheduler` —— 手动调度器；自己调用 `TestScheduler.RunOnce()` 或 `RunPeriodic()`。
- `PluginServices` —— 内存服务注册表；同类型先到先得。
- `Faults` —— 通过 `IPluginContext.ReportFault`（收 `PluginDiagnostic`）报上来的消息。
- `Logger`、`Configuration`、`CarrierServices` 都可以替换。

`TestPluginContext` 实现了 `ILoaderContext`，写加载器测试时可以直接在上面 `RegisterLoader`。

宿主复刻生产作用域：事件与定时器回调只在启用期间投递，`Unload` 收回订阅、定时器与服务。直接调用 `Unload` 时也会先关闭闸门，再调 `OnUnload`。

## 真实管理器辅助

`PluginManagerHarness` 创建临时的 `plugins/`、`data/`、`config/` 根，并暴露真实的 `PluginManager`。测试需要发现、依赖排序、加载器或卸载验证时用它。

```csharp
using Hosihikari.Testing;

using var harness = new PluginManagerHarness();
harness.CreatePackage("MyPlugin", hosihikariJson, ("main.cs", source));
harness.Manager.RegisterLoader(new MyLoader());

harness.Load("MyPlugin");
harness.Manager.Enable("MyPlugin");
harness.Manager.Unload("MyPlugin");
```

`CreatePackage` 按你给的清单在 `plugins/<name>/` 下写 `hosihikari.json` 与可选文件；越出临时根的包名会被拒绝。清单与真实插件包同为 `hosihikari.json`，所以在辅助里跑通的夹具原样就能打包。管理器的报告与“已移除”回调分别从 `Reports` 与 `Removed` 读取。

## 边界

测试包不模拟载体、BDS 世界 API 或本机库生命周期；这些都在框架契约之外。真实服务端请走各载体的冒烟路径，并参考[常见问题](/zh/framework/develop/troubleshooting/)。
