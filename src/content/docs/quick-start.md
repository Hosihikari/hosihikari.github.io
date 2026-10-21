---
title: Quick start
description: Install HostingShim and a loader, then run a C# plugin and an out-of-process Node plugin.
---

This walkthrough takes a server with LeviLamina, Endstone, or the self-hosted Linux carrier from a
fresh install to two running plugins.

## Prerequisites

- Windows x64 for LeviLamina and Endstone on Windows; Linux x64 for Endstone on Linux and the
  self-hosted carrier.
- Minecraft Bedrock Dedicated Server: BDS 1.26.51+ with LeviLamina 26.51+, BDS 1.26.52+ with
  Endstone 0.11+, or BDS 1.21.3 for the self-hosted carrier.
- [.NET 10 runtime](https://dotnet.microsoft.com/download) (`Microsoft.NETCore.App`).
- [lip](https://github.com/LiteLDev/lip).
- Node.js 20+ on `PATH` for out-of-process plugins.

Run the install commands in the **server root**.

## Install HostingShim and loaders

The suffix-less package is the **self-hosted Linux** carrier. Parent-managed servers pick a labeled
variant:

```powershell
lip install github.com/HosihikariFramework/HostingShim                # self-hosted Linux
lip install github.com/HosihikariFramework/HostingShim#levilamina     # LeviLamina
lip install github.com/HosihikariFramework/HostingShim#endstone       # Endstone, Windows / Linux
```

Then install the C# loader:

```powershell
lip install github.com/HosihikariFramework/CSharpLoader
```

The order is HostingShim → loader → plugin package. Loader manifests do not declare a lip dependency on HostingShim: HostingShim has one package per carrier, and lip cannot express that choice in a dependency.

The self-hosted carrier installs `hosihikari-server` at the server root and the plugin manager under
`plugins/hosihikari/`. Start the server through the launcher, which preloads HostingShim:

```bash
./hosihikari-server
```

Its target is BDS 1.21.3; the launcher needs the .NET 10 runtime. The plugin packages live under
`plugins/` exactly as they do under a parent, and they are precompiled assembly packages.

## Run a C# plugin

To start a new plugin from a maintained package, see [Templates](/templates/).

Clone the documentation repository and copy the example into the server:

```powershell
git clone https://github.com/HosihikariFramework/hosihikariframework.github.io
cd hosihikariframework.github.io
$Server = 'C:\bedrock-server'
Copy-Item -Recurse .\examples\hello-csharp "$Server\plugins\hello-csharp"
```

The package contains:

```
hello-csharp/
  manifest.json
  main.cs
  hello-csharp.conf
```

Start the server. The log should show `loaded, package` and `enabled, greeting=你好，星光`. The plugin also writes `loaded.txt` and `enabled.txt` under:

```
<server>/data/hosihikari/hello-csharp/
```

## Out-of-process plugins

RpcLoader is the official out-of-process loader. It runs the plugin in a child process over line-delimited JSON-RPC 2.0, instead of compiling source AOT to IL.

```powershell
lip install github.com/HosihikariFramework/RpcLoader
Copy-Item -Recurse .\examples\hello-node "$Server\plugins\hello-node"
Copy-Item "$Server\plugins\hosihikari-rpc\bindings\node\hosihikari.mjs" "$Server\plugins\hello-node\hosihikari.mjs"
```

`hosihikari.mjs` is the Node binding shipped with RpcLoader. Keep it next to the entry so the manifest command can find it. The log should show `hello-node` loading and enabling.

If the target directory already exists, remove it before copying.

## Override configuration

`<name>.conf` inside the package holds the author's defaults. A server-side override in `config/hosihikari/` takes precedence:

```powershell
New-Item -ItemType Directory -Force "$Server\config\hosihikari" | Out-Null
Copy-Item .\examples\hello-csharp\hello-csharp.conf "$Server\config\hosihikari\hello-csharp.conf"
```

Restart the server; the log shows the overridden `greeting`. Environment variables override the same keys.

## Next

- [Plugin packages](/plugin-package/)
- [C# plugins](/authoring-csharp/)
- [Out-of-process plugins](/authoring-rpc/)
- [Troubleshooting](/troubleshooting/)
