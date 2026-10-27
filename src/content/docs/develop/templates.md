---
title: Templates
description: Start a plugin from a maintained template for each plugin kind.
---

Each template is a complete plugin package. Copy it into the server as `plugins/<Name>/`, then change
`name` in `manifest.json` and the matching `.conf`; the directory name must equal the manifest name.
The templates are MIT-0; Hosihikari.Plugin.Abstractions 1.0.0 and later are MIT.

## Precompiled assembly

The plugin manager's built-in assembly loader loads a .NET class library. No loader package is needed.

```bash
dotnet new install Hosihikari.Plugin.Templates
dotnet new hosihikari-plugin -n MyPlugin          # C#
# or
dotnet new hosihikari-plugin-fsharp -n MyPlugin   # F#
```

Build and pack with `Hosihikari.Plugin.Build`; no framework checkout is needed:

```bash
cd MyPlugin
dotnet add package Hosihikari.Plugin.Build --version 1.0.0
dotnet build -t:PackPlugin
```

The target writes `dist/MyPlugin/`. Multi-target projects pass `-f <tfm>`. See
[Testing plugins](/develop/testing/) for the test package and the
[template README](https://github.com/HosihikariFramework/PluginAbstractions/tree/main/templates/Hosihikari.Plugin.Templates).

## Source C# and F#

The C# and F# loaders compile the source at load; the package carries source and no build output.

| Template | Loader | Install |
|---|---|---|
| [CSharpPluginTemplate](https://github.com/HosihikariFramework/CSharpPluginTemplate) | `hosihikari-csharp` | `lip install github.com/HosihikariFramework/CSharpLoader` |
| [FSharpPluginTemplate](https://github.com/HosihikariFramework/FSharpPluginTemplate) | `hosihikari-fsharp` | `lip install github.com/HosihikariFramework/FSharpLoader` |

`CSharpPluginTemplate` demonstrates `#:package` and `#:include`; run its `pack.ps1` or `pack.sh`,
then copy `dist/MyCSharpPlugin/` into `plugins/`. `FSharpPluginTemplate` demonstrates `#load`; copy
the repository into `plugins/MyFSharpPlugin/` directly. Rename the plugin and restart. See
[C# plugins](/develop/authoring-csharp/) for the contract.

## Out-of-process runtimes

RpcLoader starts the command from `extraInfo.command` and speaks JSON-RPC over stdio. Each
directory below is a complete package; the binding is copied from the loader and refreshed when
the loader is upgraded.

| Template | Runtime | Build |
|---|---|---|
| [Node.js/TypeScript](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/node-typescript) | Node.js 20+ | `npm install && npm run build` |
| [Python](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/python) | Python 3.8+ | none |
| [Kotlin/JVM](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/kotlin) | JDK 21+ | `./build.sh` (`build.ps1` on Windows) |

Install `RpcLoader` and put the runtime executable on `PATH`, copy the directory into `plugins/`,
and restart. The Python manifest uses `python3`; change it to `python` on Windows. See
[out-of-process plugins](/develop/authoring-rpc/) for the protocol and context.

## Choosing a template

- **Precompiled assembly**: multi-file projects, NuGet dependencies, and code that ships as a DLL.
- **C# or F# source**: small plugins that the loader compiles at load, including multi-file C# with `#:include` and pack-time `#:package` dependencies.
- **RPC**: Node.js, Python, and Kotlin plugins, or work that should run outside the server process.
