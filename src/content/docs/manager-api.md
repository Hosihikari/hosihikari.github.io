---
title: Plugin manager API
description: Configure the plugin manager, read plugin status, and add pre-load diagnostics to a loader.
---

These APIs are for hosts that embed `Hosihikari.PluginManager` and for authors of custom loaders.
Plugin authors normally use the [plugin contract](/authoring-csharp/) and
[Testing plugins](/testing/).

## Manager options

The seven-argument constructor accepts `PluginManagerOptions`:

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

`UnloadVerificationTimeout` is the time budget for unload verification after a plugin has been
detached. It defaults to 30 seconds. A finite value must be positive and no more than about 49.7
days; use `Timeout.InfiniteTimeSpan` to wait without a timer.

A timeout is a failed unload. The report names the timeout, the plugin stays `Detached` in the
manager table, and `Unload` returns a failure. Call `Unload` again to retry unload verification.
The six-argument constructor uses the defaults.

## Status snapshot

`Plugins` returns a read-only snapshot of every slot, including plugins that have been detached and
are waiting for collection. `TryGetPlugin` returns one by name; it also finds `Detached` entries.

```csharp
foreach (var info in manager.Plugins)
{
    Console.WriteLine(
        $"{info.Name} {info.Version} loader={info.Loader} " +
        $"state={info.State} enabled={info.Enabled}");
}
```

`PluginInfo` carries the manifest name and version, the loader id, `PluginState`, the logical
`Enabled` flag, whether the package is a registered loader, and the declared dependencies. Each
dependency exposes `Name` and `VersionRange`. `PluginState.Loaded` means the instance and scope are
present; `PluginState.Detached` means they have been released and only collection is pending.
`Enabled` is a separate axis.

`LoadedNames` remains the shorter list of plugins that are present and `Loaded`.

## Loader diagnostics

A loader can also implement `IPluginLoaderDiagnostics`. After `CanLoad` selects the loader and
before `Load` runs, the manager calls `Validate(manifest, packageDirectory)`. A non-empty list joins
the load report and the package is skipped; an empty list lets the load continue. Diagnostics do
not change routing: `CanLoad` still chooses the loader.

```csharp
public IReadOnlyList<string> Validate(PluginManifest manifest, string packageDirectory)
{
    var entryPath = Path.Combine(packageDirectory, manifest.EntryPath);
    return File.Exists(entryPath)
        ? []
        : [$"entry not found: {manifest.EntryPath}"];
}
```

## Build and test packages

`Hosihikari.Plugin.Build` adds the `PackPlugin` target; multi-target projects pass `-f <tfm>`.
`Hosihikari.Testing` provides `PluginTestHost` and `PluginManagerHarness`. See
[Templates](/templates/) and [Testing plugins](/testing/).
