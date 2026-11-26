---
title: Templates
description: Start a plugin from a maintained template for each plugin kind.
---

Each template is a plugin package. Pack it, copy the output into the server as `plugins/<Name>/`, and keep the directory name equal to the manifest `name`. The source and RPC templates ship `hosihikari.json` for you to rename; the `dotnet new` templates have no manifest file in the source tree, because `Hosihikari.Plugin.Build` generates it at pack time. No template ships `manifest.json` — the packer generates the envelope from `hosihikari.json`. The templates are MIT-0; Hosihikari.Plugin.Abstractions 1.0.0 and later are MIT. The RPC templates live in [RpcPluginTemplate](https://github.com/HosihikariFramework/RpcPluginTemplate); pack the runtime directory you want.

## Precompiled assembly

The plugin manager's built-in assembly loader loads a .NET class library. No loader package is needed.

```bash
dotnet new install Hosihikari.Plugin.Templates
dotnet new hosihikari-plugin -n MyPlugin          # C#
# or
dotnet new hosihikari-plugin-fsharp -n MyPlugin   # F#
```

The generated project has no manifest file in the source tree. A 2.0-capable `Hosihikari.Plugin.Build` writes `hosihikari.json` at pack time from the project properties.

The published template is still 1.1.0: it pins the 1.x contract, its hooks are the synchronous ones, and its project references `Plugin.Build` `[1.1.0]`, which writes only the old `manifest.json` envelope — a 2.0 loader refuses a package with no `hosihikari.json`. Bring it onto the current line first — upgrade the contract, rewrite the hooks as in [Migrate from 1.x to 2.0](/framework/migrate/v2/#2-make-the-hooks-async), and switch to the 2.0 build package:

```bash
cd MyPlugin
dotnet add package Hosihikari.Plugin.Abstractions --version 2.0.1
dotnet add package Hosihikari.Plugin.Build --version 1.2.0
dotnet build -t:PackPlugin
```

The target writes `dist/MyPlugin/`, containing `hosihikari.json` and the generated envelope. Multi-target projects pass `-f <tfm>`. See [Testing plugins](/framework/develop/testing/) for the test package and the [template README](https://github.com/HosihikariFramework/PluginAbstractions/tree/main/templates/Hosihikari.Plugin.Templates).

## Source C# and F#

The C# and F# loaders compile the source at load; the package carries source and no build output.

| Template                                                                            | Loader              | Loader archive                                                                                    |
| ----------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| [CSharpPluginTemplate](https://github.com/HosihikariFramework/CSharpPluginTemplate) | `hosihikari-csharp` | [`hosihikari-csharp-<version>.zip`](https://github.com/HosihikariFramework/CSharpLoader/releases) |
| [FSharpPluginTemplate](https://github.com/HosihikariFramework/FSharpPluginTemplate) | `hosihikari-fsharp` | [`hosihikari-fsharp-<version>.zip`](https://github.com/HosihikariFramework/FSharpLoader/releases) |

`CSharpPluginTemplate` demonstrates `#:package` and `#:include`; run its `pack.ps1` or `pack.sh`, then copy `dist/MyCSharpPlugin/` into `plugins/`. The scripts call the framework packer, so they need a sibling `PluginManager` checkout or `HOSIHIKARI_PLUGINMANAGER` pointing at one, and they stop at `migrate` when the directory still has a 1.x `manifest.json`. `FSharpPluginTemplate` demonstrates `#load`; pack it the same way and copy `dist/MyFSharpPlugin/` into `plugins/`. Rename the plugin and restart. See [C# plugins](/framework/develop/authoring-csharp/) for the contract.

## Out-of-process runtimes

RpcLoader starts the command from `pack.command` and speaks JSON-RPC over stdio. Each directory below is a complete package; the protocol definition is copied from the loader and refreshed when the loader is upgraded.

| Template                                                                                                 | Runtime     | Build                                 |
| -------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------- |
| [Node.js/TypeScript](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/node-typescript) | Node.js 20+ | `npm install && npm run build`        |
| [Python](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/python)                      | Python 3.8+ | none                                  |
| [Kotlin/JVM](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/kotlin)                  | JDK 21+     | `./build.sh` (`build.ps1` on Windows) |

Install `RpcLoader` and put the runtime executable on `PATH`. Build the runtime, run its `pack.sh` (`pack.ps1` on Windows) so the package gets the generated `manifest.json` envelope, copy `dist/<Name>/` into `plugins/`, and restart. The pack scripts call the framework packer and need a sibling `PluginManager` checkout or `HOSIHIKARI_PLUGINMANAGER`. The Python manifest uses `python3`; change it to `python` on Windows. See [out-of-process plugins](/framework/develop/authoring-rpc/) for the protocol and context.

## Choosing a template

- **Precompiled assembly**: multi-file projects, NuGet dependencies, and code that ships as a DLL.
- **C# or F# source**: small plugins that the loader compiles at load, including multi-file C# with `#:include` and pack-time `#:package` dependencies.
- **RPC**: Node.js, Python, and Kotlin plugins, or work that should run outside the server process.
