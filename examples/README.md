# Example plugins

[English](README.md) | [简体中文](README.zh_hans.md)

| Example | Provider | What it shows |
|---|---|---|
| [hello-csharp](hello-csharp/) | `hosihikari-csharp` | A C# source plugin compiled at load; writes to its data directory. |
| [hello-node](hello-node/) | `hosihikari-rpc` | A Node out-of-process plugin over stdio JSON-RPC. |

Both are installed step by step in the [quick start](https://hosihikariframework.github.io/quick-start/). Put an example directory under the server's `plugins/`; the directory name must match `name` in the manifest.
