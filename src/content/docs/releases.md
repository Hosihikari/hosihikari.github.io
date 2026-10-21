---
title: Releases
description: Published versions of the framework, providers, and templates.
---

The current release line was published on 21 October 2026.

| Component | Version | Distribution |
| --- | --- | --- |
| [Abstractions](https://www.nuget.org/packages/Hosihikari.Abstractions/0.7.1) | 0.7.1 | NuGet |
| [Core](https://github.com/HosihikariFramework/PluginManagement/releases/tag/v0.6.0) | v0.6.0 | lip |
| [HostingShim](https://github.com/HosihikariFramework/Shim/releases/tag/v0.6.1) | v0.6.1 | lip, four carrier variants |
| [C# Provider](https://github.com/HosihikariFramework/CSharpProvider/releases/tag/v0.2.1) | v0.2.1 | lip |
| [F# Provider](https://github.com/HosihikariFramework/FSharpProvider/releases/tag/v0.1.2) | v0.1.2 | lip |
| [RPC Provider](https://github.com/HosihikariFramework/RpcProvider/releases/tag/v0.2.1) | v0.2.1 | lip |
| [Plugin template](https://www.nuget.org/packages/Hosihikari.Plugin.Template/0.1.2) | 0.1.2 | `dotnet new` |

## Core v0.6.0

- The managed core is now its own lip package. It installs under `plugins/hosihikari/`; the native Shim declares a compatible Core version as a lip dependency.
- The native and managed sides check `HostingContractVersion` at startup. A missing entry fails with -2, a mismatch with -3.
- Explicitly unloading a provider package is refused; a manifest that cannot be read is isolated to its package.
- The failure-removal callback and core shutdown now use the same gate, and the provider-reuse log is written outside the core lock.
- The packer expands `#:include` globs from the package root, so quoted paths and `../shared/*.cs` work. The matching loader change ships with the next C# Provider release.

## HostingShim v0.6.1

- Release assets contain only native files: the carrier, `nethost`, and the self-hosted launcher. Core files come from the Core package.
- `lip install` resolves and installs Core automatically; `verify-lip` covers the shared `plugins/hosihikari/` layout.
- Endstone uses `#endstone` on both Windows and Linux; `platform` selects the archive. The old `#endstone_linux` label is removed.
- Carrier reload keeps the managed core and loaded providers; only child plugins unload and reload (ADR-0037).
- Endstone reload waits for in-flight log lines before the old logger is destroyed; hostfxr is loaded once per process.
- Manifest and load-path hardening covers `null` and self dependencies, path-like names, loading-window rollback, and report delivery outside the load lock.
- Smoke tests record the server's real exit code; Linux links the carrier with `-z nodelete`.

## C# Provider v0.2.1

- Source files can use `#:package Id@Version` and `#:include` with globs.
- Cache validation covers both the assembly and its PDB; compilation uses the same source snapshot as the cache key.
- Cache cleanup is safe across processes: old directories need an expired retention window and no active lease; staging and freshly published artifacts are left alone.
- A failed load releases its ALC, and a package must expose exactly one `IPlugin` type.
- A second provider package for the same plugin type now fails to load instead of remaining idle.

## F# Provider v0.1.2

- Compile-time references use the same package-first order as runtime resolution.
- FSharp.Compiler.Service compilation is limited to 30 seconds.
- PDB checksums, the source snapshot, and a unique staging directory protect the cache.
- Entries containing `#` compile into a new `-run-<nonce>` directory on every load, so two processes never replace the same cache in place.
- Cross-process cleanup uses retention windows and load leases; a second provider package for the same type fails to load.

## RPC Provider v0.2.1

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
dotnet add package Hosihikari.Abstractions --version 0.7.1
dotnet new install Hosihikari.Plugin.Template::0.1.2

lip install github.com/HosihikariFramework/Shim
lip install github.com/HosihikariFramework/CSharpProvider
lip install github.com/HosihikariFramework/FSharpProvider
lip install github.com/HosihikariFramework/RpcProvider
```

The Shim package installs Core as a lip dependency. To pin Core explicitly:

```powershell
lip install github.com/HosihikariFramework/PluginManagement@0.6.0
```

Shim variants for LeviLamina and Endstone are selected with `#levilamina` and `#endstone`; the
package without a suffix installs the Linux self-hosted carrier.

## Compatibility

Core v0.6.0 and Shim v0.6.1 use hosting contract version 1 and declare a `0.6.*` dependency.
Plugins built against Abstractions 0.7.1 use contract `api` 2 and manifest `format_version` 1.
The previous release line was Abstractions 0.7.0, Shim v0.5.1, Provider v0.2.1 / v0.1.2, and template 0.1.2.
