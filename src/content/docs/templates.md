---
title: Templates
description: Start a plugin from a maintained template for each plugin type.
---

Each template is a complete plugin package. Copy it into the server as `plugins/<Name>/`, then change
`name` in `manifest.json` and the matching `.conf`; the directory name must equal the manifest name.

## Precompiled assembly

The core's built-in assembly provider loads a .NET class library. No provider package is needed.

```powershell
dotnet new install Hosihikari.Plugin.Template
dotnet new hosihikari-plugin -n MyPlugin
```

Build and pack with the framework's packer. It needs a sibling `Hosihikari.PluginManager` checkout,
or `HOSIHIKARI_PLUGINMANAGER` pointing at one:

```powershell
cd MyPlugin
pwsh ./pack.ps1
```

`dist/MyPlugin/` is the plugin package. See the
[template README](https://github.com/HosihikariFramework/Abstractions/tree/main/templates/Hosihikari.Plugin.Template).

## Source C# and F#

The C# and F# providers compile the source at load; the package carries source and no build output.

| Template | Provider | Install |
|---|---|---|
| [CSharpPluginTemplate](https://github.com/HosihikariFramework/CSharpPluginTemplate) | `hosihikari-csharp` | `lip install github.com/HosihikariFramework/CSharpProvider` |
| [FSharpPluginTemplate](https://github.com/HosihikariFramework/FSharpPluginTemplate) | `hosihikari-fsharp` | `lip install github.com/HosihikariFramework/FSharpProvider` |

Copy the repository into `plugins/MyCSharpPlugin/` or `plugins/MyFSharpPlugin/`, rename the plugin,
and restart. See [C# plugins](/authoring-csharp/) for the contract.

## Out-of-process runtimes

RpcProvider starts the command from `extraInfo.command` and speaks JSON-RPC over stdio. Each
directory below is a complete package; the binding is copied from the provider and refreshed when
the provider is upgraded.

| Template | Runtime | Build |
|---|---|---|
| [Node.js/TypeScript](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/node-typescript) | Node.js 20+ | `npm install && npm run build` |
| [Python](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/python) | Python 3.8+ | none |
| [Kotlin/JVM](https://github.com/HosihikariFramework/RpcPluginTemplate/tree/main/kotlin) | JDK 21+ | `./build.sh` (`build.ps1` on Windows) |

Install `RpcProvider` and put the runtime executable on `PATH`, copy the directory into `plugins/`,
and restart. The Python manifest uses `python3`; change it to `python` on Windows. See the
[out-of-process bridge](/authoring-rpc/) for the protocol and context.

## Choosing a template

- **Precompiled assembly**: multi-file projects, NuGet dependencies, and code that ships as a DLL.
- **C# or F# source**: one-file plugins that the provider compiles at load.
- **RPC**: Node.js, Python, and Kotlin plugins, or work that should run outside the server process.
