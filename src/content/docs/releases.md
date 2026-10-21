---
title: Releases
description: Published versions of the framework, loaders, and templates.
---

The current release line was published on 21 October 2026.

| Component | Version | Distribution |
| --- | --- | --- |
| [PluginAbstractions](https://www.nuget.org/packages/Hosihikari.Plugin.Abstractions/1.0.0) | 1.0.0 | NuGet |
| [PluginManager](https://github.com/HosihikariFramework/PluginManager/releases/tag/v1.0.0) | v1.0.0 | lip |
| [HostingShim](https://github.com/HosihikariFramework/HostingShim/releases/tag/v1.0.0) | v1.0.0 | lip, four carrier variants |
| [C# Loader](https://github.com/HosihikariFramework/CSharpLoader/releases/tag/v1.0.0) | v1.0.0 | lip |
| [F# Loader](https://github.com/HosihikariFramework/FSharpLoader/releases/tag/v1.0.0) | v1.0.0 | lip |
| [RPC Loader](https://github.com/HosihikariFramework/RpcLoader/releases/tag/v1.0.0) | v1.0.0 | lip |
| [Plugin templates](https://www.nuget.org/packages/Hosihikari.Plugin.Templates/1.0.0) | 1.0.0 | `dotnet new` |

## v1.0.0

- All components are released as v1.0.0. Public names follow ADR-0040: `PluginManager`, `IPluginLoader` with `Id`, `PluginHandle`, `CarrierServices`, `RegisterLoader`, and `ScheduleOnce` / `SchedulePeriodic`.
- Manifest fields are now `extraInfo.api_version`, `extraInfo.loader`, and `extraInfo.manifest_version`; the old `api`, `provider`, and `format_version` keys are rejected with a migration error. The top-level `type`, `entry`, and `version` fields keep their wire names.
- The GitHub repositories are renamed to HostingShim, PluginManager, PluginAbstractions, CSharpLoader, FSharpLoader, and RpcLoader; the NuGet packages are `Hosihikari.Plugin.Abstractions` and `Hosihikari.Plugin.Templates`.
- Unload verification runs outside the manager gate and shares an in-flight verification task across concurrent unloads.
- The RPC bindings use `scheduleOnce` / `schedulePeriodic` (`schedule_once` / `schedule_periodic` in Python); the packer subcommand is `pack-loader`.
- HostingShim and PluginManager are released together; HostingShim depends on the `1.0.*` PluginManager line, and the hosting contract version stays 1.

## Core v0.7.2

- Dependency versions are enforced. The plugin's own `version` is SemVer; a dependency `version` is a NuGet range such as `1.2.3`, `[1.2.3]`, or `[1.0.0,2.0.0)`.
- Invalid versions or ranges are rejected when the manifest is read and when a package is packed. The dependency graph and parent-delivered loads check the target version before loading; an unsatisfied dependent is skipped with the constraint and actual version in the report.
- The `hosihikari` dependency is not version-checked; the contract API and manifest format cover that compatibility.
- The managed core is now its own lip package. It installs under `plugins/hosihikari/`; the native Shim declares a compatible Core version as a lip dependency.
- The native and managed sides check `HostingContractVersion` at startup. A missing entry fails with -2, a mismatch with -3.
- Explicitly unloading a provider package is refused; a manifest that cannot be read is isolated to its package.
- The failure-removal callback and core shutdown now use the same gate, and the provider-reuse log is written outside the core lock.
- The packer expands `#:include` globs from the package root, so quoted paths and `../shared/*.cs` work. C# Provider 0.2.2 uses the same path handling when it loads the sources.
- The packer tolerates read-only files when it cleans its staging directory; a cleanup failure no longer fails an already finished pack or provider pack.
- Floating constraints such as `1.*` and `1.2.*` enforce their upper bound: `1.*` rejects `2.0.0`, and `1.2.*` rejects `1.3.0`. The dependency graph and parent-delivered loads share this check.
- A null entry or empty name in `dependencies` is reported as a pack problem instead of throwing a `NullReferenceException`.

## HostingShim v0.7.0

- Release assets contain only native files: the carrier, `nethost`, and the self-hosted launcher. Core files come from the Core package.
- The Core dependency range is `0.7.*`; hosting contract version stays 1.
- `lip install` resolves and installs Core automatically; `verify-lip` covers the shared `plugins/hosihikari/` layout.
- Endstone uses `#endstone` on both Windows and Linux; `platform` selects the archive. The old `#endstone_linux` label is removed.
- Carrier reload keeps the managed core and loaded providers; only child plugins unload and reload (ADR-0037).
- Endstone reload waits for in-flight log lines before the old logger is destroyed; hostfxr is loaded once per process.
- Manifest and load-path hardening covers `null` and self dependencies, path-like names, loading-window rollback, and report delivery outside the load lock.
- Smoke tests record the server's real exit code; Linux links the carrier with `-z nodelete`.

## C# Provider v0.2.3

- The lip variant is platform-neutral and installs on Windows and Linux.
- Source files can use `#:package Id@Version` and `#:include` with globs.
- `#:include` accepts quoted paths and `../shared/*.cs`, matching the packer's path handling.
- Cache validation covers both the assembly and its PDB; compilation uses the same source snapshot as the cache key.
- Cache cleanup is safe across processes: old directories need an expired retention window and no active lease; staging and freshly published artifacts are left alone.
- A failed load releases its ALC, and a package must expose exactly one `IPlugin` type.
- A second provider package for the same plugin type now fails to load instead of remaining idle.

## F# Provider v0.1.5

- The lip variant is platform-neutral and installs on Windows and Linux.
- Compile-time references use the same package-first order as runtime resolution.
- FSharp.Compiler.Service compilation is limited to 30 seconds.
- PDB checksums, the source snapshot, and a unique staging directory protect the cache.
- `#load` and local `#r` files participate in the content-addressed key; an edit changes the directory, while an unchanged directive entry reuses the cached artifact. `#I`, `nuget:`, globs or unresolved paths still compile into a unique `-run-<nonce>` directory on every load.
- Directive scanning follows F# lexing: line and nested block comments, strings inside comments, quoted identifiers, character literals and the `(*)` operator are not mistaken for directives. An entry that ends inside a comment or string is treated as uncacheable.
- Cross-process cleanup uses retention windows and load leases; a second provider package for the same type fails to load.

## RPC Provider v0.2.4

- The Node binding ships `hosihikari.d.ts`, the Python binding ships `hosihikari.pyi`, and the QuickJS binding documents `Context` and `Plugin` with JSDoc; the templates carry the same declarations.
- Node and QuickJS host requests time out after 30 seconds: the pending entry is removed and the promise rejects, and a reply clears the timer.
- A JSON line whose root is not an object (an array, a string, or `null`) is dropped with a warning instead of ending the read loop.
- The lip variant is platform-neutral and installs on Windows and Linux.
- Parent exit is detected through the process `Exited` event, so an orphaned plugin shuts down.
- Queues are bounded: 4096 incoming messages, 1024 replies, and 4 MiB per line; overflow reports a fault and stops the child.
- Lines are read in chunks with the 4 MiB limit enforced during reading, before a full line is allocated.
- Notifications are processed in order; during synchronous delivery only requests with an `id` may reenter, so notifications keep their wire order.
- String request IDs are preserved, structured payloads keep their raw JSON, and a duplicate subscription can upgrade a topic to synchronous delivery.
- A second provider package for the same type fails to load.

## Plugin template 0.1.2

- The generated project references Abstractions 0.7.1 with `ExcludeAssets="runtime"`.
- The scaffolding is MIT-0; the contract it references is MIT.

## Install

```powershell
dotnet add package Hosihikari.Plugin.Abstractions --version 1.0.0
dotnet new install Hosihikari.Plugin.Templates::1.0.0

lip install github.com/HosihikariFramework/HostingShim
lip install github.com/HosihikariFramework/CSharpLoader
lip install github.com/HosihikariFramework/FSharpLoader
lip install github.com/HosihikariFramework/RpcLoader
```

The HostingShim package installs PluginManager as a lip dependency. To pin PluginManager explicitly:

```powershell
lip install github.com/HosihikariFramework/PluginManager@1.0.0
```

HostingShim variants for LeviLamina and Endstone are selected with `#levilamina` and `#endstone`; the
package without a suffix installs the Linux self-hosted carrier.

## Compatibility

PluginManager v1.0.0 and HostingShim v1.0.0 use hosting contract version 1, and HostingShim declares a `1.0.*` dependency.
Plugins built against Hosihikari.Plugin.Abstractions 1.0.0 use API version 2 and manifest `manifest_version` 1.
The previous release line was PluginAbstractions 0.7.1, PluginManager v0.7.2, HostingShim v0.7.0, C# Loader v0.2.3, F# Loader v0.1.5, RPC Loader v0.2.4, and template 0.1.2.
