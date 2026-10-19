---
title: C# plugins
description: Write a C# source plugin that the provider compiles at load.
---

C# runs on the CLR, so `Hosihikari.PluginProvider.CSharp` compiles `.cs` at load with Roslyn and loads the assembly into a collectible ALC. Authors ship source; the result gets the same isolation and unload guarantees as any assembly plugin. This is a first-class provider: it compiles source AOT to IL before the plugin runs; the core loads that IL into a collectible ALC, and the plugin itself is ordinary CLR code.

## Setup

```powershell
lip install github.com/HosihikariFramework/Shim
lip install github.com/HosihikariFramework/CSharpProvider
```

## Package layout

```
plugins/hello-csharp/
  manifest.json
  main.cs
  hello-csharp.conf
```

Manifest:

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
  "extraInfo": { "api": "2", "format_version": "1", "provider": "csharp" }
}
```

## Entry

Define a type that implements `IPlugin` and has a parameterless constructor. The provider finds it and creates an instance.

```csharp
using System.IO;
using Hosihikari;
using Microsoft.Extensions.Logging;

public sealed class HelloPlugin : IPlugin
{
    private IPluginContext _context = null!;

    public void OnLoad(IPluginContext context)
    {
        _context = context;
        context.Logger.LogInformation("loaded, package {Dir}", context.PackageDirectory);
        File.WriteAllText(Path.Combine(context.DataDirectory, "loaded.txt"), "loaded");
    }

    public PluginHookResult OnEnable()
    {
        var greeting = _context.Configuration["greeting"];
        _context.Logger.LogInformation("enabled, greeting={Greeting}", greeting);
        File.WriteAllText(Path.Combine(_context.DataDirectory, "enabled.txt"), greeting ?? "");
        return PluginHookResult.Allow();
    }

    public PluginHookResult OnDisable() => PluginHookResult.Allow();

    public void OnUnload() { }
}
```

`using Microsoft.Extensions.Logging;` is required: `LogInformation` is an extension method.

## Compilation and cache

- Compiled at load; a source plugin needs no csproj.
- Output is content-addressed under `data/hosihikari/<name>/bin/<hash>/`, next to a checksum and a portable PDB.
- A change to the source, a private DLL, the Roslyn version, or the runtime version changes the hash.
- Private DLLs in the package root participate in compilation references and are resolved from the package at run time.
- Native libraries live in the package root or `runtimes/<current portable RID>/native/`; the RID directory wins.

## Configuration

The package default `hello-csharp.conf`:

```text
greeting = "你好，星光"
```

The server override is `config/hosihikari/hello-csharp.conf`; environment variables also override the same keys.

## Events and timers

`context.Events` and `context.Scheduler` come from the framework. Disabling closes the gate first, so event and timer callbacks stop; start periodic work in `OnEnable`.

## Assembly plugins

If you already have a compiled DLL, put it in the package, set `provider` to `assembly`, and point `entry` at the DLL. Declare the entry on the assembly:

```csharp
[assembly: EntryPoint<HelloPlugin>]
```

Reference the contract and exclude its runtime assets so the package does not carry a second copy:

```xml
<PackageReference Include="Hosihikari.Abstractions" Version="[0.7.0]" ExcludeAssets="runtime" />
```

The assembly declares exactly one `EntryPoint<T>`; the entry type implements `IPlugin` and has a parameterless constructor.

## Deploy and verify

Put the directory under `plugins/` and start the server. The log should show `loaded, package` and `enabled`; `loaded.txt` and `enabled.txt` appear in the data directory. On unload the framework drops the plugin from its ALC and verifies reclamation.
