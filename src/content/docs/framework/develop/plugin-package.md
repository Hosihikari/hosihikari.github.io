---
title: Plugin packages
description: The directory layout, the manifest, and the checks the framework applies before load.
---

A plugin package is a directory under `plugins/`. The directory name is the plugin name, and the directory must contain `hosihikari.json`. The framework reads the manifest before load and rejects packages that break the contract.

`manifest.json` is the LeviLamina envelope. The packer generates it into the output package from `hosihikari.json`; the source tree holds only `hosihikari.json`. A package that has only `manifest.json` is a 1.x package and is refused with a pointer to `hosihikari-pack migrate`; see [Migrate from 1.x to 2.0](/framework/migrate/v2/).

## Layout

```
plugins/
  hello-csharp/
    hosihikari.json
    main.cs
    hello-csharp.conf
```

## Manifest

```json
{
  "schemaVersion": 1,
  "name": "hello-csharp",
  "version": "1.0.0",
  "entry": "main.cs",
  "loader": "csharp",
  "kind": "plugin",
  "apiVersion": 3,
  "dependencies": [
    { "name": "hosihikari" },
    { "name": "hosihikari-csharp" }
  ]
}
```

| Field | Meaning |
|---|---|
| `schemaVersion` | Manifest schema version; `1`. |
| `name` | Plugin name; must equal the directory name. |
| `version` | The plugin's own SemVer version. |
| `entry` | Path inside the package; absolute paths and `..` are rejected. |
| `loader` | The loader that handles this package; `assembly` when omitted. `assembly` is the plugin manager's built-in path; `csharp` and `fsharp` are in-process loaders; `rpc` is the out-of-process loader. |
| `kind` | `plugin` (default), `loader`, or `carrier`. The self-hosted scan skips carrier packages. |
| `apiVersion` | Contract major version; currently `3`. |
| `dependencies` | Required: must include `hosihikari`, so the parent loads the shim first. Other names carry optional SemVer ranges; the graph decides load order and checks versions. |
| `description` | Display text; copied into the envelope when present. |
| `author` | Display text; copied into the envelope when present. |
| `pack.command` | `rpc` only: the argument vector, as a JSON array or a string holding the encoded array. |
| `pack.packages` | `Id/Version` or `Id` NuGet packages restored into the package at pack time. |
| `pack.prepack` | A command run in the package directory at pack time, e.g. `npm ci`; a single string or an array. Pack-time only, the server never restores, and each run is limited to 5 minutes. |
| `carrier.sharedAssemblies` | `carrier` only: file names the carrier adds to the shared layer. |
| `carrier.components` | `carrier` only: process-level components as `{ assembly, type }`, each a concrete class implementing `ICarrierComponent`. |

`type` is optional and must be `hosihikari` when written; the envelope always carries it. The envelope is generated, so a `description` or `author` edit only reaches the parent after a repack.

Dependencies are sorted by name. A dependency may carry a NuGet SemVer range:

- omitted, empty, or `*`: any version.
- `1.2.3`: 1.2.3 or newer.
- `[1.2.3]`: exactly 1.2.3.
- `[1.0.0,2.0.0)`: 1.0.0 inclusive through 2.0.0 exclusive.

The target plugin must declare a parseable `version` when a range constrains it. The framework dependency `hosihikari` is not version-checked; loader packages load before the packages that depend on them. Plugins that use an in-process loader declare `hosihikari-csharp` or `hosihikari-fsharp`; out-of-process plugins declare `hosihikari-rpc`. Precompiled assemblies use the plugin manager's built-in path and need no loader package.

## Carrier packages

A carrier package has `kind: carrier`, is named `hosihikari`, and needs no `hosihikari` dependency. It is the shim itself, so the self-hosted scan skips it and the packer only emits it into the output package. It declares `carrier.sharedAssemblies` and `carrier.components`; see [Migrate from 1.x to 2.0](/framework/migrate/v2/#carrier-packages) for what the packer validates.

## Loaders and entries

Official loaders come in two classes: in-process loaders compile source AOT to IL; RpcLoader is the out-of-process loader, an RPC bridge. Precompiled assemblies use the plugin manager's built-in path.

| `loader` | `entry` | How it loads |
|---|---|---|
| `assembly` | `.dll` | PluginManager built-in: loads a precompiled IL assembly directly; the assembly declares exactly one `[assembly: EntryPoint<T>]`. |
| `csharp` | `.cs` | In-process loader: AOT-compiles `.cs` to IL at load with Roslyn, into a collectible ALC. |
| `fsharp` | `.fsx` | In-process loader: AOT-compiles `.fsx` to IL at load with FSharp.Compiler.Service. |
| `rpc` | Entry file | Out-of-process loader: `pack.command` starts a child process speaking line-delimited JSON-RPC 2.0 over stdio. |

For in-process and precompiled assembly plugins, the entry type must implement `IPlugin` and have a parameterless constructor; `EntryPoint<T>` enforces both at compile time. A missing file or the wrong number of entry declarations is reported by the loader.

Only `kind: loader` packages receive `ILoaderContext`; every other package receives a view implementing only `IPluginContext`, and a cast to `ILoaderContext` fails.

## Checks before load

The framework rejects a package before constructing a plugin if:

- `name` differs from the directory name;
- `entry` is empty, absolute, or escapes the package directory;
- `type` is present and not `hosihikari`;
- `apiVersion` is not `3`;
- `schemaVersion` is not `1`;
- `kind` is not `plugin`, `loader`, or `carrier`, or a carrier is not named `hosihikari`;
- a `plugin` or `loader` package lacks the `hosihikari` dependency;
- a dependency repeats the package's own name;
- the manifest is not valid JSON.

A package with only `manifest.json` is refused as a legacy package with the `hosihikari-pack migrate` command. These checks run before the package enters its lifecycle, and the log gives the reason.

## Configuration and data

- Package defaults: `plugins/<name>/<name>.conf`, updated with the package.
- Server override: `config/hosihikari/<name>.conf`, which takes precedence.
- Environment variables override the same keys (`greeting` maps to `GREETING`).
- Runtime data: `data/hosihikari/<name>/`, created by the framework and handed to the plugin.

The configuration format is HOCON. Layering goes through the framework's provider chain; HOCON `include` does not apply on this path.

## Lifecycle

`OnLoad` → `OnEnable` → `OnDisable` → `OnUnload`. All four are async and receive a `CancellationToken`; `OnEnable` and `OnDisable` return `PluginHookResult`.

- `OnLoad` runs after dependencies are ready; the server itself may not be ready.
- An allowed `OnEnable` opens the scope gate; a refusal keeps the plugin loaded and disabled.
- Before `OnDisable`, the framework closes the gate and stops delivering events and timers; a refusal reopens it.
- Unload goes through disable; `OnUnload` releases what the plugin holds.
- `Enable` and `Disable` are both idempotent: repeating either does not call the hook again. A carrier reload disables and re-enables the plugins it reloads.
- An exception from a hook is a fault: the host unloads the plugin and notifies the carrier.
- A hook that outlives `HookTimeout` (30 seconds by default) is cancelled; a canceled load rolls back, a canceled enable stays disabled, and a canceled disable or unload stops being awaited.

The gate covers framework-delivered events and timers. Threads, service registrations, and direct references owned by the plugin must be released in `OnUnload`.

Loader packages are loaded once and cannot be unloaded at runtime; disable or upgrade them by restarting the server.
