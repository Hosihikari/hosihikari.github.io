# hello-node

[English](README.md) | [简体中文](README.zh_hans.md)

> 例外一等成员：RpcProvider 是官方 AOT/ALC/CLR 集之外的唯一跨进程桥（ADR-0037）。

一个最小的 Node 进程外插件。载入与启用时写日志与数据文件，并读取 `greeting`。

## 安装

在文档仓根执行：

```powershell
git clone https://github.com/HosihikariFramework/hosihikariframework.github.io
cd hosihikariframework.github.io
lip install github.com/HosihikariFramework/Shim
lip install github.com/HosihikariFramework/RpcProvider
$Server = 'C:\bedrock-server'
Copy-Item -Recurse .\examples\hello-node "$Server\plugins\hello-node"
Copy-Item "$Server\plugins\hosihikari-rpc\bindings\node\hosihikari.mjs" "$Server\plugins\hello-node\hosihikari.mjs"
```

运行 `node` 必须在 `PATH` 上；Endstone 下若找不到，把 `manifest.json` 的 `command` 改成 `node` 的绝对路径。

## 文件

- `manifest.json`：`provider` 是 `rpc`，依赖 `hosihikari` 与 `hosihikari-rpc`，`command` 指向绑定与入口。
- `main.mjs`：默认导出四个钩子。
- `hello-node.conf`：包内默认配置。
- `hosihikari.mjs`：安装时从 Provider 包复制。

## 预期

日志出现 `loaded, package` 与 `enabled, greeting=你好，星光`；数据写在 `data/hosihikari/hello-node/`。
