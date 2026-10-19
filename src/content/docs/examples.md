---
title: Examples
description: Two small plugins you can copy into a server.
---

| Example | Provider | What it shows |
|---|---|---|
| [hello-csharp](https://github.com/HosihikariFramework/hosihikariframework.github.io/tree/main/examples/hello-csharp) | `hosihikari-csharp` | A C# source plugin compiled at load; it writes to its data directory. |
| [hello-node](https://github.com/HosihikariFramework/hosihikariframework.github.io/tree/main/examples/hello-node) | `hosihikari-rpc` | A Node out-of-process plugin over stdio JSON-RPC. |

Both are installed step by step in [Quick start](/quick-start/). Copy an example directory into the server's `plugins/`; the directory name must match `name` in the manifest.
