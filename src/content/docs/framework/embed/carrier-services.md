---
title: Carrier services
description: What the host must supply, and how loaders register themselves.
---

The host supplies an `IServiceProvider` with an `ILoggerFactory`, and registers the loaders it supports. Discovery, isolation, and lifecycle stay with the manager; everything else comes from the host. This page is the contract between the two.

## The service provider

`carrierServices` is an `IServiceProvider` handed to the constructor. Plugins reach it through `IPluginContext.CarrierServices` when they need something the host owns: a game-world handle, a scheduler tied to the main thread, a metrics sink. The framework does not inspect it.

Two rules:

- **Put an `ILoggerFactory` in it.** Without one, plugins get a null logger. Every line they write disappears, and nothing reports that it did.
- **Keep host types out of the plugin contract.** A service reachable this way is typed against something in your host; a plugin that uses it binds to your host's types, which is the escape hatch. Plugins that only use host services stay portable across hosts.

The five framework services — logging, configuration, data directory, scheduler, event bus — are not carrier services. They come from the manager itself and work the same in every host.


## Carrier packages and the configurator

A carrier package is the native shim plus a `hosihikari.json` with `kind: carrier`. The manager reads that manifest from the carrier directory the shim passes at startup, so the same build works wherever the carrier is installed. Two optional groups matter here:

- `carrier.components`: process-wide managed components (see [Carrier packages](/framework/develop/plugin-package/#carrier-packages)).
- `carrier.bootstrap`: one `{ assembly, type }` implementing `ICarrierServicesConfigurator`. The manager constructs it and calls `Configure(ICarrierServiceContext context)` before the service provider is built, then hands that provider to plugins and components as `CarrierServices`.

The context carries the service collection (`context.Services`), the absolute carrier package directory (`context.CarrierDirectory`), and the native handle (`context.HostHandle`). The handle is the carrier's own pointer (Endstone passes its `Plugin*`; the parented LeviLamina carrier passes none). The core passes it through untouched; the configurator decides what type to expose under which key, and that key type lives with your carrier code — the framework never references it.

```csharp
public sealed class CarrierServicesConfigurator : ICarrierServicesConfigurator
{
    public void Configure(ICarrierServiceContext context)
    {
        context.Services.AddSingleton(new HostHandle(context.HostHandle));
    }
}
```

No manifest, no configurator: a directory without `hosihikari.json` starts with a provider that holds only the logger factory, which is what the verification hosts and local runs use.

## Registering loaders

The manager routes a package to whichever loader claims it. It ships with one loader only: the built-in assembly loader, for precompiled IL.

```csharp
manager.RegisterLoader(new AssemblyPluginLoader());
```

Every other loader is a plugin package with `kind: loader` that registers itself during `OnLoad`. Only those packages receive `ILoaderContext`, so the parameter has to be typed that way:

```csharp
// inside a loader plugin's OnLoad
public ValueTask OnLoad(ILoaderContext context, CancellationToken token)
{
    context.RegisterLoader(new MyLoader());
    return ValueTask.CompletedTask;
}
```

The manager records the registration and returns `false` if the id is already taken. Registration cannot be undone: the types a loader hands out live in its load context, so replacing or removing a loader means restarting the server.

Because registration happens on load, ordering matters. A plugin that needs a loader declares it as a dependency in its manifest, so the dependency graph loads the loader first:

```json
"dependencies": [
  { "name": "hosihikari" },
  { "name": "hosihikari-csharp" }
]
```

A package that arrives before its loader has no loader claiming it, and is skipped with a report.

## Loader diagnostics

A loader can implement `IPluginLoaderDiagnostics` to inspect a package before it is loaded. The manager calls `Validate` after `CanLoad` has selected this loader and before `Load` runs:

```csharp
public IReadOnlyList<PluginDiagnostic> Validate(PluginManifest manifest, string packageDirectory)
{
    var entryPath = Path.Combine(packageDirectory, manifest.EntryPath);
    return File.Exists(entryPath)
        ? []
        : [PluginDiagnostic.Error("entry-missing", $"entry not found: {manifest.EntryPath}")];
}
```

Each diagnostic joins the load report and the package is skipped; an empty list lets the load continue. Diagnostics report problems — `CanLoad` still decides routing.

## What the host does not get

The manager does not hand you a plugin handle through this contract. If you need to address a plugin by name, use the status snapshot in [Lifecycle](/framework/embed/lifecycle/); if you need to act on it, call the manager's methods directly.
