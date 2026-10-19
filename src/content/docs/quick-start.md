---
title: Quick start
description: Install the shim and a provider, then run a C# plugin and an out-of-process Node plugin.
---

This walkthrough takes a server with LeviLamina or Endstone from a fresh install to two running plugins.

## Prerequisites

- Windows x64.
- Minecraft Bedrock Dedicated Server: BDS 1.26.51+ with LeviLamina 26.51+, or BDS 1.26.52+ with Endstone 0.11+.
- [.NET 10 runtime](https://dotnet.microsoft.com/download) (`Microsoft.NETCore.App`).
- [lip](https://github.com/LiteLDev/lip).
- Node.js 20+ on `PATH` for the out-of-process exception.

Run the install commands in the **server root**.

## Install the shim and providers

LeviLamina:

```powershell
lip install github.com/HosihikariFramework/Shim
```

Endstone:

```powershell
lip install github.com/HosihikariFramework/Shim#endstone
```

Then install the C# provider:

```powershell
lip install github.com/HosihikariFramework/CSharpProvider
```

The order is shim → provider → plugin package. Provider manifests do not declare a lip dependency on the shim: the shim has one package per carrier, and lip cannot express that choice in a dependency.

## Run a C# plugin

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

## Exception first-class provider: out-of-process bridge

RpcProvider is the exception first-class provider: an official provider that runs the plugin in a child process over line-delimited JSON-RPC 2.0, instead of compiling source AOT to IL.

```powershell
lip install github.com/HosihikariFramework/RpcProvider
Copy-Item -Recurse .\examples\hello-node "$Server\plugins\hello-node"
Copy-Item "$Server\plugins\hosihikari-rpc\bindings\node\hosihikari.mjs" "$Server\plugins\hello-node\hosihikari.mjs"
```

`hosihikari.mjs` is the Node binding shipped with the RpcProvider. Keep it next to the entry so the manifest command can find it. The log should show `hello-node` loading and enabling.

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
- [Out-of-process bridge (the exception)](/authoring-rpc/)
- [Troubleshooting](/troubleshooting/)
