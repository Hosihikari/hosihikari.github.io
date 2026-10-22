---
title: Testing plugins
description: Drive plugin lifecycle and host services without starting a Bedrock Dedicated Server.
---

`Hosihikari.Testing` is the author-facing test package. It targets the 1.1.0 line: it references
`Hosihikari.Plugin.Abstractions` 1.1.0 and `Hosihikari.PluginManager` 1.1.0. The packages are
prepared; install them once the 1.1.0 line is published.

```powershell
dotnet add package Hosihikari.Testing --version 1.0.0
```

## Lifecycle host

`PluginTestHost` drives the four public hooks directly. It does not start BDS, read a manifest, or
create an assembly load context.

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

The test context exposes the same service shape as production:

- `Events` — synchronous bus; handler exceptions are collected in `TestEvents.HandlerErrors`.
- `Scheduler` — manual scheduler; call `TestScheduler.RunOnce()` or `RunPeriodic()` yourself.
- `PluginServices` — in-memory registry; the first registration for a type wins.
- `Faults` — strings reported through `IPluginContext.ReportFault`.
- `Logger`, `Configuration`, and `CarrierServices` are replaceable.

The host mirrors the production scope: event and timer callbacks only fire while enabled, and
`Unload` releases subscriptions, timers, and services. Direct `Unload` also closes the gate before
calling `OnUnload`.

## Real manager harness

`PluginManagerHarness` creates temporary `plugins/`, `data/`, and `config/` roots and exposes the
real `PluginManager`. Use it when the test needs discovery, dependency ordering, loaders, or unload
verification.

```csharp
using Hosihikari.Testing;

using var harness = new PluginManagerHarness();
harness.CreatePackage("MyPlugin", manifestJson, ("main.cs", source));
harness.Manager.RegisterLoader(new MyLoader());

harness.Load("MyPlugin");
harness.Manager.Enable("MyPlugin");
harness.Manager.Unload("MyPlugin");
```

`CreatePackage` writes the manifest and optional files under `plugins/<name>/`; names that escape
the temporary root are rejected. Reports and removed-plugin callbacks are available through
`Reports` and `Removed`.

## Boundary

The testing package does not simulate a carrier, BDS world APIs, or native library lifetime. Those
remain outside the framework contract. For a real server, use the carrier smoke paths in
[Testing the framework](https://github.com/HosihikariFramework/PluginManager) and the
[troubleshooting guide](/troubleshooting/).
