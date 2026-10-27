---
title: Getting started
description: Add the package and stand up a minimal host.
---

You are embedding `Hosihikari.PluginManager` in a process you control. The manager gives you discovery, dependency ordering, isolation, and lifecycle; you supply the carrier services and decide when to start and stop.

If you only want to run plugins on a Bedrock server, use a [carrier](/server/) instead — the carriers are hosts that already do this.

## Add the package

```bash
dotnet add package Hosihikari.PluginManager
```

The manager targets .NET 10 and depends on `Hosihikari.Plugin.Abstractions` for the plugin contract.

## Construct it

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
    reportFault: entry => loggerFactory.CreateLogger("Hosihikari").LogError("Load problem: {Entry}", entry),
    carrierServices: services,
    onRemoved: name => { /* the plugin is gone; drop your own record of it */ });
```

The three roots are directories you own. The manager creates `data/` and `config/` subdirectories as needed; it does not create `plugins/` for you, and a missing `plugins/` means an empty plugin set.

- `reportFault` receives problems that happen outside a plugin hook — a process that died, a protocol error, a package refused before load.
- `carrierServices` is the `IServiceProvider` plugins reach through `IPluginContext.CarrierServices`. Put an `ILoggerFactory` in it: without one, plugins get a null logger and every line they write disappears silently.
- `onRemoved` fires after a failed plugin has been unloaded, so you can remove it from your own registry.

## Register the loaders you support

The manager does not know how to load anything by itself. A loader is a plugin package that registers itself on load, and the built-in assembly loader handles precompiled DLLs:

```csharp
manager.RegisterLoader(new AssemblyPluginLoader());
manager.LoadAll();
```

To support source plugins, install the loader package alongside the others and let it register itself; see [Carrier services](/embed/carrier-services/).

## Options

Pass `PluginManagerOptions` to the seven-argument constructor:

```csharp
var options = new PluginManagerOptions
{
    UnloadVerificationTimeout = TimeSpan.FromSeconds(60),
};

var manager = new PluginManager(pluginsRoot, dataRoot, configRoot, reportFault, carrierServices, onRemoved, options);
```

`UnloadVerificationTimeout` is the budget for confirming that a detached plugin was actually reclaimed. It defaults to 30 seconds. A finite value must be positive and no more than about 49.7 days; use `Timeout.InfiniteTimeSpan` for no timer. The timeout is one of the failure modes described in [Lifecycle](/embed/lifecycle/).

## Next

- [Carrier services](/embed/carrier-services/) — what the host must supply, and how loaders are registered.
- [Lifecycle](/embed/lifecycle/) — `Load`, `Enable`, `Disable`, `Unload`, and the status snapshot.
- [Events and callbacks](/embed/events-and-callbacks/) — the event bus and the two callbacks back into your host.

Writing the plugins themselves is in [Writing plugins](/develop/).
