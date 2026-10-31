# hello-node

[English](README.md) | [简体中文](README.zh_hans.md)

> Out-of-process loader: RpcLoader is the official out-of-process loader; it runs the plugin in a child process instead of compiling source to IL (ADR-0031).

A minimal Node out-of-process plugin. It logs and writes data files on load and enable, and reads `greeting`.

## Install

Run from the documentation repository root:

```powershell
git clone https://github.com/Hosihikari/hosihikari.github.io
cd hosihikari.github.io
# Download the LeviLamina carrier, the core, and the RPC loader archives from their
# GitHub releases and extract them into the server root.
$Server = 'C:\bedrock-server'
Copy-Item -Recurse .\examples\hello-node "$Server\plugins\hello-node"
Copy-Item "$Server\plugins\hosihikari-rpc\bindings\node\hosihikari.mjs" "$Server\plugins\hello-node\hosihikari.mjs"
```

`node` must be on `PATH`. On Endstone, if it cannot be found, use the absolute path in `manifest.json`'s `command`.

## Files

- `manifest.json`: `loader` is `rpc`; depends on `hosihikari` and `hosihikari-rpc`; `command` points at the binding and the entry.
- `main.mjs`: default-exports the four hooks.
- `hello-node.conf`: package defaults.
- `hosihikari.mjs`: copied from the loader package at install time.

## Expected

The log shows `loaded, package` and `enabled, greeting=Hello, Hosihikari`; data is written under `data/hosihikari/hello-node/`.
