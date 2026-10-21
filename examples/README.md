# Example plugins

[English](README.md) | [简体中文](README.zh_hans.md)

| Example | Loader | What it shows |
|---|---|---|
| [hello-csharp](hello-csharp/) | `hosihikari-csharp` | A C# source plugin compiled at load; writes to its data directory. |
| [hello-node](hello-node/) | `hosihikari-rpc` | The out-of-process loader: an RPC bridge; a Node plugin over stdio JSON-RPC. |

The [quick start](https://hosihikariframework.github.io/quick-start/) uses hello-csharp, an in-process loader example. hello-node demonstrates the out-of-process loader. Both are official. Put an example directory under the server's `plugins/`; the directory name must match `name` in the manifest.

The example code is MIT-0, see [LICENSE.md](LICENSE.md).
