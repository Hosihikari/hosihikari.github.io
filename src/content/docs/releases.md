---
title: Releases
description: Published versions of the framework, providers, and templates.
---

The current release line was published on 20 October 2026.

| Component | Version | Distribution |
| --- | --- | --- |
| [Abstractions](https://www.nuget.org/packages/Hosihikari.Abstractions/0.7.1) | 0.7.1 | NuGet |
| [HostingShim](https://github.com/HosihikariFramework/Shim/releases/tag/v0.5.0) | v0.5.0 | lip, four carrier variants |
| [C# Provider](https://github.com/HosihikariFramework/CSharpProvider/releases/tag/v0.2.0) | v0.2.0 | lip |
| [F# Provider](https://github.com/HosihikariFramework/FSharpProvider/releases/tag/v0.1.1) | v0.1.1 | lip |
| [RPC Provider](https://github.com/HosihikariFramework/RpcProvider/releases/tag/v0.2.0) | v0.2.0 | lip |
| [Plugin template](https://www.nuget.org/packages/Hosihikari.Plugin.Template/0.1.2) | 0.1.2 | `dotnet new` |

## Abstractions 0.7.1

- `IPluginContext.TryRegisterProvider` reports a duplicate provider registration instead of hiding it.
- `dependencies` and `extraInfo` become empty collections when the manifest contains `null`.
- The contract documents failed unloads, exact event-type matching, and hooks during self-initiated shutdown.
- This version is MIT on NuGet; 0.7.0 remains LGPL-3.0-or-later.

## HostingShim v0.5.0

- Carrier reload keeps the managed core and loaded providers; only child plugins unload and reload (ADR-0037).
- Endstone reload recycles the managed core before the native module unloads; a failed managed load is reported instead of silently enabling the plugin.
- The packer understands `#:package` and recursive `#:include` with `*`, `**`, and `?`.
- Manifest and load-path hardening covers `null` and self dependencies, path-like names, loading-window rollback, and report delivery outside the load lock.
- Smoke tests record the server's real exit code; Linux links the carrier with `-z nodelete`.

## C# Provider v0.2.0

- Source files can use `#:package Id@Version` and `#:include` with globs.
- Cache validation covers both the assembly and its PDB; compilation uses the same source snapshot as the cache key.
- A failed load releases its ALC, and a package must expose exactly one `IPlugin` type.
- Compilation uses a unique staging directory and tolerates another process publishing the same cache first.

## F# Provider v0.1.1

- Compile-time references use the same package-first order as runtime resolution.
- FSharp.Compiler.Service compilation is limited to 30 seconds.
- PDB checksums, the source snapshot, and a unique staging directory protect the cache.
- A failed load releases its ALC.

## RPC Provider v0.2.0

- Parent exit is detected through the process `Exited` event, so an orphaned plugin shuts down.
- Queues are bounded: 4096 incoming messages, 1024 replies, and 4 MiB per line; overflow reports a fault and stops the child.
- Notifications are processed in order, and synchronous delivery still permits a reentrant publish.
- String request IDs are preserved, structured payloads keep their raw JSON, and a duplicate subscription can upgrade a topic to synchronous delivery.

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

Shim variants for LeviLamina and Endstone are selected with `#levilamina`, `#endstone`, and
`#endstone_linux`; the package without a suffix installs the Linux self-hosted carrier.

## Compatibility

Plugins built against Abstractions 0.7.1 use contract `api` 2 and manifest `format_version` 1.
The previous release line was Abstractions 0.7.0, Shim v0.4.1, Provider v0.1.0, and template 0.1.1.
