---
title: Examples
description: Two small plugins you can copy into a server.
---

| Example | Provider | What it shows |
|---|---|---|
| [hello-csharp](https://github.com/HosihikariFramework/hosihikariframework.github.io/tree/main/examples/hello-csharp) | `hosihikari-csharp` | A C# source plugin compiled at load; it writes to its data directory. |
| [hello-node](https://github.com/HosihikariFramework/hosihikariframework.github.io/tree/main/examples/hello-node) | `hosihikari-rpc` | The exception first-class provider: a cross-process bridge; a Node plugin over stdio JSON-RPC. |

The [quick start](/quick-start/) uses hello-csharp, a first-class provider example. hello-node demonstrates the exception first-class provider. Both are official. Copy an example directory into the server's `plugins/`; the directory name must match `name` in the manifest.
