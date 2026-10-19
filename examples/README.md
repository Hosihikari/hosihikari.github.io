# Example plugins

[English](README.md) | [简体中文](README.zh_hans.md)

| Example | Provider | What it shows |
|---|---|---|
| [hello-csharp](hello-csharp/) | `hosihikari-csharp` | A C# source plugin compiled at load; writes to its data directory. |
| [hello-node](hello-node/) | `hosihikari-rpc` | The exception first-class provider: a cross-process bridge; a Node plugin over stdio JSON-RPC. |

The [quick start](https://hosihikariframework.github.io/quick-start/) uses hello-csharp, a first-class provider example. hello-node demonstrates the exception first-class provider. Both are official. Put an example directory under the server's `plugins/`; the directory name must match `name` in the manifest.
