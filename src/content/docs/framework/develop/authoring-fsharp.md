---
title: F# plugins
description: Write an F# source plugin that the loader compiles at load.
---

F# runs on the CLR, so `Hosihikari.PluginLoader.FSharp` compiles `.fsx` at load and loads the assembly into a collectible ALC. Authors ship source; the result gets the same isolation and unload guarantees as any assembly plugin.

The package layout, the manifest fields, the lifecycle, configuration, and the deploy steps are the same as for [C# plugins](/framework/develop/authoring-csharp/). This page covers what differs.

## Setup

Pick the HostingShim variant for the server (see [Choosing a carrier](/framework/server/carriers/)), then install the F# loader:

```bash
lip install github.com/HosihikariFramework/HostingShim#levilamina
lip install github.com/HosihikariFramework/FSharpLoader
```

The [F# template](https://github.com/HosihikariFramework/FSharpPluginTemplate) is a package you can copy into `plugins/`, rename, and restart. The `dotnet new` package also ships an F# precompiled template, `hosihikari-plugin-fsharp`.

## Package layout

```
plugins/hello-fsharp/
  manifest.json
  main.fsx
  hello-fsharp.conf
```

Manifest, with the loader name and the dependency:

```json
{
  "name": "hello-fsharp",
  "entry": "main.fsx",
  "type": "hosihikari",
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari" },
    { "name": "hosihikari-fsharp" }
  ],
  "extraInfo": { "api_version": "2", "manifest_version": "1", "loader": "fsharp" }
}
```

The entry path is whatever `manifest.json` says; the file name is not fixed to `main.fsx`.

## Entry

Define a type implementing `IPlugin` with a parameterless constructor. Annotate the hook parameter: the compiler needs the type on `OnLoad`, and it is not inferred from the interface.

```fsharp
open Hosihikari
open System.IO

type HelloPlugin() =
    let mutable dataDirectory = ""

    interface IPlugin with
        member this.OnLoad(context: IPluginContext) =
            dataDirectory <- context.DataDirectory
            let greeting = context.Configuration.["greeting"]
            File.WriteAllText(Path.Combine(dataDirectory, "body.txt"), "body:" + greeting)
        member this.OnEnable() =
            File.WriteAllText(Path.Combine(dataDirectory, "enabled.txt"), "enabled")
            PluginHookResult.Allow()
        member this.OnDisable() = PluginHookResult.Allow()
        member this.OnUnload() = ()
```

`context.Events` and `context.Scheduler` are available exactly as in C#.

## How it compiles

The loader drives `FSharpChecker` directly instead of going through `GetProjectOptionsFromScript`: in a directory with no SDK context that helper falls back to the .NET Framework reference set. It passes `--noframework --targetprofile:netcore` plus an explicit reference list:

- assemblies already loaded in the framework's own ALC, so the contract keeps its identity;
- private DLLs in the package root;
- the loader's own directory, which ships `FSharp.Core` and friends;
- the host's trusted platform assemblies.

An F# plugin is a real assembly referencing the contract, so it reaches everything a C# plugin does — including the type-keyed channels (event bus, service registry) that an out-of-process plugin cannot.

## Caching

Output is content-addressed: `data/hosihikari/<name>/bin/<hash>/<name>.dll`, with a checksum beside it that is verified before loading. A mismatch recompiles; the artifact is never loaded anyway.

The hash covers the source text, files pulled in by `#load` and local `#r`, private DLL names and contents, the compiler version, and the runtime version. Entries that use `#I`, `nuget:` references, globs, or unresolved paths are recompiled on every load into a unique `-run-` directory.

## Packaging notes

- A generated F# package carries `FSharp.Core.dll`; the shared contract DLL stays out of the package.
- Precompiled F# plugins use the same `loader: assembly` path as C#, via the `hosihikari-plugin-fsharp` template.
- The loader is LGPL-3.0-or-later, unlike the framework's own packages.

## Deploy and verify

Put the directory under `plugins/` and start the server. The log should show the plugin loading and enabling; the data directory gets the files the plugin writes.
