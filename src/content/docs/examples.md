---
title: Examples
description: Two small plugins you can copy into a server.
---

| Example | Loader | What it shows |
|---|---|---|
| [hello-csharp](https://github.com/HosihikariFramework/hosihikariframework.github.io/tree/main/examples/hello-csharp) | `hosihikari-csharp` | A C# source plugin compiled at load; it writes to its data directory. |
| [hello-node](https://github.com/HosihikariFramework/hosihikariframework.github.io/tree/main/examples/hello-node) | `hosihikari-rpc` | The out-of-process loader: an RPC bridge; a Node plugin over stdio JSON-RPC. |

The [quick start](/quick-start/) uses hello-csharp, an in-process loader example. hello-node demonstrates the out-of-process loader. Both are official. Copy an example directory into the server's `plugins/`; the directory name must match `name` in the manifest.
