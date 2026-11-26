---
title: Testing plugins
description: Drive plugin lifecycle and host services without starting a Bedrock Dedicated Server.
---

`Hosihikari.Testing` is the author-facing test package. The published 1.1.0 is still on the 1.x contract (`Hosihikari.Plugin.Abstractions` 1.2.0, `PluginManager` 1.3.0) and its hooks are the synchronous ones, so the code below is the 1.x shape. Pin it: a bare install resolves 1.1.0, which does not match the 2.0 contract the rest of these pages describe.

```bash
dotnet add package Hosihikari.Testing --version 1.1.0
```

## Lifecycle host

`PluginTestHost` drives the four public hooks directly. It does not start BDS, read a manifest, or create an assembly load context.

```csharp
using Hosihikari;
using Hosihikari.Testing;

public sealed class MyPlugin : IPlugin
{
    public void OnLoad(IPluginContext context) { }
    public PluginHookResult OnEnable() => PluginHookResult.Allow();
    public PluginHookResult OnDisable() => PluginHookResult.Allow();
    public void OnUnload() { }
}

using var host = new PluginTestHost(new MyPlugin());
host.RunLifecycle();

// host.HookLog: load → enable → disable → unload
```

The host runs each hook off the calling thread, so blocking inside a hook behaves as in production.

The test context exposes the same service shape as production:

- `Events` — synchronous bus with the same six priorities; handler exceptions are collected in `TestEvents.HandlerErrors`.
- `Scheduler` — manual scheduler; call `TestScheduler.RunOnce()` or `RunPeriodic()` yourself.
- `PluginServices` — in-memory registry; the first registration for a type wins.
- `Faults` — the strings reported through `IPluginContext.ReportFault`.
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
