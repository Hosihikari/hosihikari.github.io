# hello-csharp

[English](README.md) | [简体中文](README.zh_hans.md)

A minimal C# plugin: it logs and writes data files on load and enable, and reads the layered `greeting`. The in-process loader AOT-compiles the source to IL; the plugin runs as CLR code in an ALC.

## Install

Run from the documentation repository root:

```powershell
git clone https://github.com/Hosihikari/hosihikari.github.io
cd hosihikari.github.io
# Download the LeviLamina carrier, the core, and the C# loader archives from their
# GitHub releases and extract them into the server root.
$Server = 'C:\bedrock-server'
# The parent discovers packages through the manifest.json envelope, which only the packer writes,
# so pack the example first and copy the output.
dotnet tool install -g Hosihikari.Plugin.Pack
$Stage = Join-Path ([System.IO.Path]::GetTempPath()) 'hello-csharp'
New-Item -ItemType Directory -Force $Stage | Out-Null
Copy-Item -Recurse .\examples\hello-csharp\* $Stage
hosihikari-pack pack-plugin $Stage .\examples\hello-csharp\hosihikari.json .\examples\hello-csharp\dist
Copy-Item -Recurse .\examples\hello-csharp\dist\hello-csharp "$Server\plugins\hello-csharp"
```

The target directory must be named `hello-csharp`.

## Files

- `hosihikari.json`: `loader` is `csharp`; depends on `hosihikari` and `hosihikari-csharp`. The `manifest.json` envelope is generated at pack time.
- `main.cs`: the `HelloPlugin` entry type.
- `hello-csharp.conf`: package defaults.

## Expected

The log shows `loaded, package` and `enabled, greeting=Hello, Hosihikari`; data is written under `data/hosihikari/hello-csharp/`.
