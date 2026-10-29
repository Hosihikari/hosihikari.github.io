---
title: Examples
description: Two small plugins you can copy into a server.
---

Two ready-made packages: one C# source plugin and one Node out-of-process plugin.

| Example | Loader | What it shows |
|---|---|---|
| [hello-csharp](https://github.com/Hosihikari/hosihikari.github.io/tree/main/examples/hello-csharp) | `hosihikari-csharp` | A C# source plugin compiled at load; it writes to its data directory. |
| [hello-node](https://github.com/Hosihikari/hosihikari.github.io/tree/main/examples/hello-node) | `hosihikari-rpc` | The out-of-process loader: an RPC bridge; a Node plugin over stdio JSON-RPC. |

The [first plugin](/framework/develop/first-plugin/) walkthrough generates its own plugin from a template; these two are
ready-made packages for reading. hello-csharp is the in-process loader, hello-node the out-of-process one. Both are
official. Copy an example directory into the server's `plugins/`; the directory name must match `name` in the
manifest.
