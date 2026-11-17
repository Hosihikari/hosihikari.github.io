---
title: Testing plugins
description: Drive plugin lifecycle and host services without starting a Bedrock Dedicated Server.
---

`Hosihikari.Testing` is the author-facing test package. It targets the same contract line as the framework (`Hosihikari.Plugin.Abstractions` 3.0) and pins the `Hosihikari.PluginManager` line the harness was validated against; install it without a version so NuGet resolves the release that matches the contract.

```bash
dotnet add package Hosihikari.Testing
```

## Lifecycle host

`PluginTestHost` drives the four public hooks directly. It does not start BDS, read a manifest, or create an assembly load context.

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

The host passes `CancellationToken.None` to every hook and runs them off the calling thread, so blocking inside a hook behaves as in production.

The test context exposes the same service shape as production:

- `Events` — synchronous bus with the same six priorities; handler exceptions are collected in `TestEvents.HandlerErrors`.
- `Scheduler` — manual scheduler; call `TestScheduler.RunOnce()` or `RunPeriodic()` yourself.
- `PluginServices` — in-memory registry; the first registration for a type wins.
- `Faults` — the messages reported through `IPluginContext.ReportFault`, which takes a `PluginDiagnostic`.
- `Logger`, `Configuration`, and `CarrierServices` are replaceable.

`TestPluginContext` implements `ILoaderContext`, so a loader test can call `RegisterLoader` on it.

The host mirrors the production scope: event and timer callbacks only fire while enabled, and `Unload` releases subscriptions, timers, and services. Direct `Unload` also closes the gate before calling `OnUnload`.

## Real manager harness

`PluginManagerHarness` creates temporary `plugins/`, `data/`, and `config/` roots and exposes the real `PluginManager`. Use it when the test needs discovery, dependency ordering, loaders, or unload verification.

```csharp
using Hosihikari.Testing;

using var harness = new PluginManagerHarness();
harness.CreatePackage("MyPlugin", hosihikariJson, ("main.cs", source));
harness.Manager.RegisterLoader(new MyLoader());

harness.Load("MyPlugin");
harness.Manager.Enable("MyPlugin");
harness.Manager.Unload("MyPlugin");
```

`CreatePackage` writes `hosihikari.json` with the manifest you pass and any optional files under `plugins/<name>/`; names that escape the temporary root are rejected. The manifest uses the same `hosihikari.json` shape as a real package, so a fixture that loads under the harness packs unchanged. Reports and removed-plugin callbacks are available through `Reports` and `Removed`.

## Boundary

The testing package does not simulate a carrier, BDS world APIs, or native library lifetime. Those remain outside the framework contract. For a real server, use the carrier smoke paths in [Testing the framework](https://github.com/HosihikariFramework/PluginManager) and the [troubleshooting guide](/framework/develop/troubleshooting/).
