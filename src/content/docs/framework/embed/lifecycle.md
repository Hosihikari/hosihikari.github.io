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
manager.Reload("Hello");        // self-hosted only; see below
```

`Load` and `Enable` return a bool. `Unload` returns an `UnloadResult`:

```csharp
public readonly record struct UnloadResult(
    bool Released,
    string? Error,
    UnloadFailure Failure = UnloadFailure.None,
    bool HookTimedOut = false);
```

- `Released` is true only when the plugin was actually reclaimed.
- `Error` carries the reason when it was not.
- `Failure` names the stage that failed: `HookTimedOut`, `HookRefused`, `HookThrew`, `ReclamationTimedOut`, `HookAndReclamationTimedOut`, or `ReclamationFailed`.
- `HookTimedOut` is independent of `Released`: a hook timeout followed by a successful verification sets both.

## Reload

`Reload` runs `Disable` → `Unload` → `Load` → `Enable` in one call (FX-0062) and returns a `ReloadResult`:

```csharp
public readonly record struct ReloadResult(bool Reloaded, bool NotSupported, string? Error);
```

It exists only in the self-hosted topology, where the manager owns the plugin set. Under a parent the set belongs to the parent (FX-0003) and the call returns `NotSupported` with the reason in `Error`; reload by driving the parent instead. The first failing step stops the sequence and is recorded as it happened, and the plugin name leaves the roster for the duration, so state events follow the real transitions.

A package pinned by native libraries still reports restart-needed at unload; `Reload` does not bypass that.

## Components start before dispatch

If the carrier declares `carrier.components`, the host starts them once per process, before event dispatch opens to plugins, and stops them in reverse start order before dispatch closes:

```csharp
manager.StartComponents(carrierPackageDirectory, components); // returns false when a component failed to start
manager.StopComponents();
```

A component failing to start fails the whole startup.

## Unload has stages

Unload is not one step. The manager first runs the disable hook under its own budget, then releases the instance and its scope, then waits for the loader to confirm the assembly load context was reclaimed. The stages fail differently:

| Situation                                         | What happens                                                                                                    |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| A plugin still depends on it                      | Refused; `Released` is false. Unload downstream plugins first — the manager does not cascade.                   |
| The plugin is a registered loader                 | Refused; loaders cannot be replaced at runtime. Restart the server.                                             |
| Disable is refused by the plugin                  | Refused; the plugin stays in place and may still be active.                                                     |
| The disable or unload hook outlives `HookTimeout` | The token is cancelled, the framework stops waiting, and the unload continues; `HookTimedOut` is set.           |
| Released, but reclamation is not confirmed        | `Released` is false with the timeout in `Error`; the plugin stays `Detached`. Call `Unload` again to re-verify. |

The last case is the one worth knowing about. The instance is gone, but the load context is pinned by something — a static field, a live thread, a reference kept in `OnUnload`. Calling `Unload` again re-runs only the verification, and a temporarily pinned context can pass the second time.

`HookTimeout` and `UnloadVerificationTimeout` set the budgets for those two waits; see [Getting started](/framework/embed/getting-started/). A hook that ignores the token only hits the hook timeout; it does not by itself block reclamation.

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

State transitions also go out as `PluginStateChanged` on the event bus, with the previous and current state.

## What the snapshot is not

It is a snapshot: holding it does not pin anything, and it does not reflect later changes. Query `Plugins` again for a current view. It also does not hand out plugin instances — for that, call the manager; the manager owns the handles.
