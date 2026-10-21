# hello-csharp

[English](README.md) | [简体中文](README.zh_hans.md)

A minimal C# plugin: it logs and writes data files on load and enable, and reads the layered `greeting`. The in-process loader AOT-compiles the source to IL; the plugin runs as CLR code in an ALC.

## Install

Run from the documentation repository root:

```powershell
git clone https://github.com/HosihikariFramework/hosihikariframework.github.io
cd hosihikariframework.github.io
# LeviLamina; use #endstone or no label for the other carriers
lip install github.com/HosihikariFramework/HostingShim#levilamina
lip install github.com/HosihikariFramework/CSharpLoader
$Server = 'C:\bedrock-server'
Copy-Item -Recurse .\examples\hello-csharp "$Server\plugins\hello-csharp"
```

The target directory must be named `hello-csharp`.

## Files

- `manifest.json`: `loader` is `csharp`; depends on `hosihikari` and `hosihikari-csharp`.
- `main.cs`: the `HelloPlugin` entry type.
- `hello-csharp.conf`: package defaults.

## Expected

The log shows `loaded, package` and `enabled, greeting=你好，星光`; data is written under `data/hosihikari/hello-csharp/`.
