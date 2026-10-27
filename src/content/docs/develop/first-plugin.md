---
title: Your first plugin
description: Generate, pack, and run a plugin.
---

This walks a working server to a running plugin. It assumes the framework is already installed on the server; if it is not, do [Server](/server/) first.

You need the [.NET 10 SDK](https://dotnet.microsoft.com/download) on your machine to build the plugin. The server needs the .NET 10 runtime, which it already has if the framework starts.

## Generate

From a directory outside the server:

```powershell
dotnet new install Hosihikari.Plugin.Templates
dotnet new hosihikari-plugin -n HelloPlugin -o HelloPlugin
```

The result is a complete precompiled plugin project. Choose the F# template with `dotnet new hosihikari-plugin-fsharp` instead.

## Pack

```powershell
dotnet add ./HelloPlugin/HelloPlugin.csproj package Hosihikari.Plugin.Build --version 1.0.0
dotnet build ./HelloPlugin/HelloPlugin.csproj -t:PackPlugin
```

`PackPlugin` produces `HelloPlugin/dist/HelloPlugin/` — the package directory, with the manifest already filled in. A multi-target project needs `-f <tfm>`.

## Install on the server

Copy the directory into the server:

```powershell
Copy-Item -Recurse ./HelloPlugin/dist/HelloPlugin "$Server/plugins/HelloPlugin"
```

The directory name must equal `name` in the manifest. Restart the server.

## Verify

The log should show the plugin loading and enabling. Then check what it wrote:

```powershell
Get-ChildItem "$Server/data/hosihikari/HelloPlugin"
```

A data directory with the plugin's files means it ran.

## What to read next

- [Plugin packages](/develop/plugin-package/) — the manifest, the checks before load, the lifecycle.
- [Templates](/develop/templates/) — the two templates and what they generate.
- [C# plugins](/develop/authoring-csharp/) or [F# plugins](/develop/authoring-fsharp/) — writing the plugin body.
- [Troubleshooting](/develop/troubleshooting/) when the plugin does not appear in the log.

## Writing source instead

The templates produce a precompiled assembly. To ship `.cs` or `.fsx` source that the server compiles at load, install the matching loader package and point the manifest at the source file. See [C# plugins](/develop/authoring-csharp/) for the layout.
