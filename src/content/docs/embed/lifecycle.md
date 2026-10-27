---
title: Lifecycle
description: Load, enable, disable, unload — and what each call returns.
---

The host drives every plugin transition. The manager does not start anything on its own: `LoadAll` is you asking for the whole set, and the per-plugin calls below are the rest.

## The calls

```csharp
manager.LoadAll();              // load everything under plugins/, in dependency order
manager.Load(packageDirectory); // load one package by path
manager.Enable("Hello");        // enable by manifest name
manager.Disable("Hello");
manager.Unload("Hello");
```

`Load` and `Enable` return a bool. `Unload` returns an `UnloadResult` with two fields:

```csharp
public readonly record struct UnloadResult(bool Released, string? Error);
```

- `Released` is true only when the plugin was actually reclaimed.
- `Error` carries the reason when it was not.

## Unload has two stages

Unload is not one step. The manager first releases the instance and its scope, then waits for the loader to confirm the assembly load context was reclaimed. Both stages can fail differently:

| Situation | What happens |
| --- | --- |
| A plugin still depends on it | Refused; `Released` is false. Unload downstream plugins first — the manager does not cascade. |
| The plugin is a registered loader | Refused; loaders cannot be replaced at runtime. Restart the server. |
| Disable is refused by the plugin | Refused; the plugin stays in place and may still be active. |
| Released, but reclamation is not confirmed | `Released` is false with the timeout in `Error`; the plugin stays `Detached`. Call `Unload` again to re-verify. |

The last case is the one worth knowing about. The instance is gone, but the load context is pinned by something — a static field, a live thread, a reference kept in `OnUnload`. Calling `Unload` again re-runs only the verification, and a temporarily pinned context can pass the second time.

`UnloadVerificationTimeout` sets the budget for that wait; see [Getting started](/embed/getting-started/).

## Status snapshot

`Plugins` returns a read-only snapshot of every slot, including plugins that are detached and waiting for collection:

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

`TryGetPlugin("Hello", out var info)` returns one entry by name; it finds `Detached` entries too.

`PluginInfo` carries the manifest name and version, the loader id, `PluginState`, the logical `Enabled` flag, whether the package is a registered loader, and the declared dependencies. Each dependency exposes `Name` and `VersionRange`.

Two fields are easy to confuse:

- `PluginState.Loaded` means the instance and scope are present. `PluginState.Detached` means they have been released and only collection is pending — the plugin is still in the table, but it is not running.
- `Enabled` is a separate axis. A plugin can be loaded and disabled at the same time.

`LoadedNames` is the shorter list of plugins that are present and `Loaded`.

## What the snapshot is not

It is a snapshot: holding it does not pin anything, and it does not reflect later changes. Query `Plugins` again for a current view. It also does not hand out plugin instances — for that, call the manager; the manager owns the handles.
