---
title: Plugin packages
description: The directory layout, the manifest, and the checks the framework applies before load.
---

A plugin package is a directory under `plugins/`. The directory name is the plugin name, and the directory must contain `manifest.json`. The framework reads the manifest before load and rejects packages that break the contract.

## Layout

```
plugins/
  hello-csharp/
    manifest.json
    main.cs
    hello-csharp.conf
```

## Manifest

```json
{
  "name": "hello-csharp",
  "entry": "main.cs",
  "type": "hosihikari",
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari" },
    { "name": "hosihikari-csharp" }
  ],
  "extraInfo": {
    "api": "2",
    "format_version": "1",
    "provider": "csharp"
  }
}
```

| Field | Meaning |
|---|---|
| `name` | Plugin name; must equal the directory name. |
| `entry` | Path inside the package; absolute paths and `..` are rejected. |
| `type` | Routing key; always `hosihikari`. |
| `version` | The plugin's own version string. |
| `dependencies` | Plugin names; the dependency graph decides load order. |
| `extraInfo.api` | Contract major version; currently `2`. |
| `extraInfo.format_version` | Manifest schema version; currently `1`. |
| `extraInfo.provider` | The provider that handles this package. `assembly` is the core's built-in path; `csharp` and `fsharp` are first-class providers; `rpc` is the exception first-class provider. |
| `extraInfo.command` | `rpc` only: a JSON array encoded as a string. |

Dependencies are sorted by name and carry no version constraints. The framework itself is `hosihikari`. First-class providers declare `hosihikari-csharp` or `hosihikari-fsharp`; the exception first-class provider declares `hosihikari-rpc`. Provider packages load before the packages that depend on them. Precompiled assemblies use the core's built-in path and need no provider package.

## Providers and entries

Official providers come in two classes: first-class providers compile source AOT to IL; RpcProvider is the exception first-class provider, a cross-process bridge. Precompiled assemblies use the core's built-in path.

| `provider` | `entry` | How it loads |
|---|---|---|
| `assembly` | `.dll` | Core built-in: loads a precompiled IL assembly directly; the assembly declares exactly one `[assembly: EntryPoint<T>]`. |
| `csharp` | `.cs` | First-class provider: AOT-compiles `.cs` to IL at load with Roslyn, into a collectible ALC. |
| `fsharp` | `.fsx` | First-class provider: AOT-compiles `.fsx` to IL at load with FSharp.Compiler.Service. |
| `rpc` | Entry file | Exception first-class provider: `command` starts a child process speaking line-delimited JSON-RPC 2.0 over stdio. |

For first-class and precompiled assembly plugins, the entry type must implement `IPlugin` and have a parameterless constructor; `EntryPoint<T>` enforces both at compile time. A missing file or the wrong number of entry declarations is reported by the provider.

## Checks before load

The framework rejects a package before constructing a plugin if:

- `name` differs from the directory name;
- `entry` is empty, absolute, or escapes the package directory;
- `type` is not `hosihikari`;
- `api` is not `2`;
- `format_version` is not `1`;
- the manifest is not valid JSON.

These checks run before the package enters its lifecycle, and the log gives the reason.

## Configuration and data

- Package defaults: `plugins/<name>/<name>.conf`, updated with the package.
- Server override: `config/hosihikari/<name>.conf`, which takes precedence.
- Environment variables override the same keys (`greeting` maps to `GREETING`).
- Runtime data: `data/hosihikari/<name>/`, created by the framework and handed to the plugin.

The configuration format is HOCON. Layering goes through the framework's provider chain; HOCON `include` does not apply on this path.

## Lifecycle

`OnLoad` → `OnEnable` → `OnDisable` → `OnUnload`.

- `OnLoad` runs after dependencies are ready; the server itself may not be ready.
- An allowed `OnEnable` opens the scope gate; a refusal keeps the plugin loaded and disabled.
- Before `OnDisable`, the framework closes the gate and stops delivering events and timers; a refusal reopens it.
- Unload goes through disable; `OnUnload` releases what the plugin holds.
- An exception from a hook is a fault: the host unloads the plugin and notifies the carrier.

The gate covers framework-delivered events and timers. Threads, service registrations, and direct references owned by the plugin must be released in `OnUnload`.

Provider packages are loaded once and cannot be unloaded at runtime; disable or upgrade them by restarting the server.
