---
title: Releases
description: Published versions of the framework, loaders, and templates.
---

The current release line was published on 9 November 2026; the template package was last updated
on 22 October 2026.

| Component | Version | Distribution |
| --- | --- | --- |
| [PluginAbstractions](https://www.nuget.org/packages/Hosihikari.Plugin.Abstractions/1.2.0) | 1.2.0 | NuGet |
| [PluginManager](https://github.com/HosihikariFramework/PluginManager/releases/tag/v1.3.0) | v1.3.0 | Release archive, NuGet, sei |
| [HostingShim](https://github.com/HosihikariFramework/HostingShim/releases/tag/v1.2.3) | v1.2.3 | Release archive, five carrier targets, sei |
| [C# Loader](https://github.com/HosihikariFramework/CSharpLoader/releases/tag/v1.2.0) | v1.2.0 | Release archive, sei |
| [F# Loader](https://github.com/HosihikariFramework/FSharpLoader/releases/tag/v1.2.0) | v1.2.0 | Release archive, sei |
| [RPC Loader](https://github.com/HosihikariFramework/RpcLoader/releases/tag/v1.2.0) | v1.2.0 | Release archive, sei |
| [Plugin.Build](https://www.nuget.org/packages/Hosihikari.Plugin.Build/1.1.0) | 1.1.0 | NuGet |
| [Testing](https://www.nuget.org/packages/Hosihikari.Testing/1.1.0) | 1.1.0 | NuGet |
| [Plugin templates](https://www.nuget.org/packages/Hosihikari.Plugin.Templates/1.1.0) | 1.1.0 | `dotnet new` |

## 1.3.0

- Generated `sei.json` files use schema 3 (ADR-0055); the index-side `sei/<name>.json` stays at 2. Installing this line needs Seiko 0.4 or newer.
- Loaders and the hosting carrier depend on `hosihikari [1.3.0,2.0.0)`. Loader 1.2.0 reads the shared-layer list from Abstractions 1.2.0, so an older core fails at load time rather than at resolve time.
- `Hosihikari.Plugin.Abstractions` 1.2.0 publishes `PluginContractInfo.SharedAssemblyFileNames` and `AddSharedAssemblies`; carriers append their binding assemblies to the list instead of scanning `FrameworkContext`.
- Every plugin package must declare a `hosihikari` dependency, and `extraInfo.packageKind` accepts `plugin`, `loader`, or `carrier`; both are rejected at load and pack time.
- `extraInfo.prepack` runs at pack time with a whitelisted environment and a timeout; operator text is localized.
- `Disable` is idempotent, a detached plugin still counts as a dependent, and `Hosihikari.Plugin.Pack` is also published as the `hosihikari-pack` dotnet tool.
- `HostingShim` v1.2.2 fixes Endstone plugin removal on reload. No hosting-contract change; hosting contract version stays 1.
- `HostingShim` v1.2.3 moves the LeviLamina carrier to `mods/hosihikari/`: LeviLamina 26.60 loads mods from `mods/`. The core archive stays in `plugins/hosihikari/`, and the shim falls back to it when the core is not beside the mod. Installing this line needs LeviLamina 26.60 or newer.

## 1.2.1

- Every HostingShim release archive carries a root `sei.json`; `hosihikari-hosting` 1.2.1 is in the [Seiko](/seiko/) index with five artifacts selected by carrier and RID.
- Three carrier bundles — `hosihikari-hosting-levilamina`, `hosihikari-hosting-endstone`, and `hosihikari-hosting-selfhosted` (1.0.0) — depend on hosting. Declaring one bundle installs hosting through its dependency and selects the matching carrier artifact.
- The self-hosted Linux archive sets the launcher's executable bit through `sei.json` `modes`.
- No hosting-contract or plugin-API change.

## 1.2.0

- Components are distributed as GitHub release archives that extract at the server root; lip is no longer used. The managed core is `hosihikari-core-<version>.zip`, and the loaders are `hosihikari-csharp-<version>.zip`, `hosihikari-fsharp-<version>.zip`, and `hosihikari-rpc-<version>.zip`.
- `HostingShim` v1.2.0 adds the self-hosted Windows carrier: `hosihikari-server.exe` starts `bedrock_server.exe` suspended, injects the shim, and calls its exported entry before the server's `main`. Its target is BDS 1.21.3.01, the same ceiling as self-hosted Linux.
- `PluginManager` v1.2.0 and the loaders publish a root `sei.json` for the [Seiko](/seiko/) package index; the core is `hosihikari` and the loaders are `hosihikari-csharp`, `hosihikari-fsharp`, and `hosihikari-rpc`.
- The hosting contract stays 1 and the plugin API stays at version 2; existing plugins keep working.

## Plugin template 1.0.1

- The package adds a precompiled F# template, `hosihikari-plugin-fsharp`; the C# template keeps
  `hosihikari-plugin`.
- Its content directories are `Hosihikari.Plugin.Templates` and `Hosihikari.Plugin.Templates.FSharp`.
- A generated F# plugin package carries `FSharp.Core.dll`; both templates keep the shared contract
  DLL out of the package.

## 1.1.0

The 1.1.0 line adds to the 1.0 API; existing plugins keep working without changes.

- `Hosihikari.Plugin.Abstractions` 1.1.0 adds the optional `IPluginLoaderDiagnostics` companion
  interface. A loader that implements it validates a package before `Load`; the reported problems
  skip that plugin and appear in the load report.
- `Hosihikari.PluginManager` 1.1.0 adds `PluginManagerOptions.UnloadVerificationTimeout` (30
  seconds by default) and the `Plugins` / `TryGetPlugin` status snapshot. A verification timeout is
  recorded as a failed unload; the slot stays `Detached`, so the plugin is not reported as gone.
- `HostingShim` v1.1.0 depends on the `1.1.*` PluginManager line. Loaders remain on v1.0.0 and work
  with the new core.
- `Hosihikari.Plugin.Build` 1.0.0 provides the `PackPlugin` MSBuild target, so packing a plugin no
  longer needs a PluginManager checkout. Multi-target projects pass `-f <tfm>`.
- `Hosihikari.Testing` 1.0.0 provides `PluginTestHost` for lifecycle tests, `PluginManagerHarness`
  for the real manager, and in-memory services, events, and scheduling.

## v1.0.0

- All components are released as v1.0.0. Public names follow ADR-0040: `PluginManager`, `IPluginLoader` with `Id`, `PluginHandle`, `CarrierServices`, `RegisterLoader`, and `ScheduleOnce` / `SchedulePeriodic`.
- Manifest fields are `extraInfo.api_version`, `extraInfo.loader`, and `extraInfo.manifest_version`; the top-level `type`, `entry`, and `version` fields keep their names.
- The repositories are HostingShim, PluginManager, PluginAbstractions, CSharpLoader, FSharpLoader, and RpcLoader; the NuGet packages are `Hosihikari.Plugin.Abstractions` and `Hosihikari.Plugin.Templates`.
- Unload verification runs outside the manager gate and shares an in-flight verification task across concurrent unloads.
- The RPC bindings use `scheduleOnce` / `schedulePeriodic` (`schedule_once` / `schedule_periodic` in Python); the packer subcommand is `pack-loader`.
- HostingShim and PluginManager are released together; HostingShim depends on the `1.0.*` PluginManager line, and the hosting contract version stays 1.

## Install

.NET packages:

```bash
dotnet add package Hosihikari.Plugin.Abstractions --version 1.2.0
dotnet add package Hosihikari.Plugin.Build --version 1.1.0
dotnet add package Hosihikari.Testing --version 1.1.0
dotnet new install Hosihikari.Plugin.Templates::1.1.0
```

Server components are GitHub release archives: download the carrier for your platform, the core archive, and any loader archives, then extract them into the server root. See [Installing on LeviLamina](/framework/server/install/levilamina/), [Installing on Endstone](/framework/server/install/endstone/), [self-hosted Linux](/framework/server/install/selfhosted/), and [self-hosted Windows](/framework/server/install/selfhosted-windows/).

The [Seiko](/seiko/) index also lists the core and the loaders as seis; Seiko installs the core when a loader is added.

## Compatibility

PluginManager v1.3.0 and HostingShim v1.2.3 use hosting contract version 1.
Plugins built against Hosihikari.Plugin.Abstractions 1.2.0 use API version 2 and manifest `manifest_version` 1, the same as 1.0.0. Since core v1.3.0 every plugin manifest must declare the `hosihikari` dependency.
