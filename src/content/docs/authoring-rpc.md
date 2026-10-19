---
title: Out-of-process bridge (the exception)
description: "The exception: a first-class cross-process bridge over line-delimited JSON-RPC."
---

:::caution
RpcProvider is the one first-class exception, a cross-process bridge outside the official AOT/ALC/CLR provider set (ADR-0037). Use it when a plugin cannot run on the CLR.
:::

`Hosihikari.PluginProvider.Rpc` drives a child process with line-delimited JSON-RPC 2.0 over stdio. The bridge reads only the command from the manifest and the protocol. Unload means the process exits, taking the child process and its state with it.

## Setup

```powershell
lip install github.com/HosihikariFramework/Shim
lip install github.com/HosihikariFramework/RpcProvider
```

The plugin package also declares a dependency on `hosihikari-rpc`. The operator provides the executable: put it on `PATH` or use an absolute path.

## Package layout (Node)

```
plugins/hello-node/
  manifest.json
  main.mjs
  hosihikari.mjs   ← copied from the provider package's bindings/node
  hello-node.conf
```

```json
{
  "name": "hello-node",
  "entry": "main.mjs",
  "type": "hosihikari",
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari" },
    { "name": "hosihikari-rpc" }
  ],
  "extraInfo": {
    "api": "2",
    "format_version": "1",
    "provider": "rpc",
    "command": "[\"node\", \"./hosihikari.mjs\", \"./main.mjs\"]"
  }
}
```

`command` is a JSON array encoded as a string; the working directory is the package directory, and no shell is involved.

Copy the binding from the installed provider package:

```powershell
Copy-Item <server>/plugins/hosihikari-rpc/bindings/node/hosihikari.mjs .
```

## Plugin

```js
import fs from 'node:fs';
import path from 'node:path';

export default {
  onLoad(ctx) {
    fs.writeFileSync(path.join(ctx.dataDirectory, 'loaded.txt'), 'loaded');
    ctx.logInfo(`loaded, package ${ctx.packageDirectory}`);
  },

  onEnable(ctx) {
    const greeting = ctx.config('greeting');
    fs.writeFileSync(path.join(ctx.dataDirectory, 'enabled.txt'), greeting ?? '');
    ctx.logInfo(`enabled, greeting=${greeting}`);
  },

  onDisable(ctx) {
    return true;
  },

  onUnload(ctx) {},
};
```

Hooks may be async. Return values: `undefined` or `true` allows; `false` or `{ allowed: false, reason }` refuses; a thrown exception is a fault.

## Context

`ctx` provides:

| Member | Meaning |
|---|---|
| `name` / `packageDirectory` / `dataDirectory` | Plugin name, package directory, data directory. |
| `config(key)` / `configObject` | The layered configuration. |
| `logInfo` / `logWarn` / `logError` | Structured logs over the protocol. |
| `writeData(file, text)` | Write a file under the data directory. |
| `publish(topic, json)` | Publish an event. |
| `subscribe(topic, fn, { sync })` | Subscribe; with `sync: true` the publisher waits for an ack. |
| `runLater(seconds, fn)` / `runEvery(seconds, fn)` | Timers. |

Events are asynchronous by default. Disabling closes the gate; subscription callbacks and timers stop, and a refused disable reopens it. Unload ends the child process.

## Logs

stdout carries the protocol; stderr carries text logs. The Node binding redirects `console.log` to stderr; do not write to stdout.

## Bindings

The provider package ships reference bindings:

- `bindings/node/hosihikari.mjs`
- `bindings/quickjs/hosihikari.js` (requires `qjs`)
- `bindings/python/hosihikari.py` (module-level `on_load` and friends)
- `bindings/java/hosihikari` (shared by Java and Kotlin; `command` points at `hosihikari.Binding`)

The command forms and context APIs are in the [RpcProvider README](https://github.com/HosihikariFramework/RpcProvider/blob/main/README.md).

## Endstone and PATH

The Endstone CLI replaces the child process `PATH` with Python's `sys.path`; if the executable cannot be found, use an absolute path in `command`.

## Protocol

A custom binding implements the same protocol:

- Host → plugin: `hosihikari/hello`, `hosihikari/enable`, `hosihikari/disable`, `hosihikari/unload`, `hosihikari/events/deliver`
- Plugin → host: `hosihikari/events/publish`, `hosihikari/events/subscribe`, `hosihikari/events/unsubscribe`, `hosihikari/log`
- Unload: `unload` request → close stdin → wait 5 seconds → kill the process tree.
