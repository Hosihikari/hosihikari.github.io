---
title: 进程外桥（例外一等 Provider）
description: 例外一等 Provider：跨进程桥，行分隔 JSON-RPC。
---

:::caution
RpcProvider 是例外一等 Provider：官方 Provider，插件在子进程中运行，不把源码 AOT 为 IL（ADR-0031）。
:::

`Hosihikari.PluginProvider.Rpc` 用行分隔 JSON-RPC 2.0 over stdio 驱动子进程。插件可以用任何语言写；它只认清单里的命令与协议。卸载就是让子进程退出，子进程与它持有的状态一起消失。

## 准备

按服务端选 Shim 变体（见[快速开始](/zh/quick-start/)）；下面以 LeviLamina 为例：

```powershell
lip install github.com/HosihikariFramework/Shim#levilamina
lip install github.com/HosihikariFramework/RpcProvider
```

[RPC 模板](/zh/templates/)覆盖 Node.js/TypeScript、Python 与 Kotlin/JVM。

插件包还要声明对 `hosihikari-rpc` 的依赖。可执行文件由运维提供：放在 `PATH` 上或用绝对路径。

## 包结构（Node）

```
plugins/hello-node/
  manifest.json
  main.mjs
  hosihikari.mjs   ← 从 Provider 包的 bindings/node 拷来
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

`command` 是编码成字符串的 JSON 数组；工作目录是包目录，不经 shell。

绑定从安装好的 Provider 包里取：

```powershell
Copy-Item <服务端>/plugins/hosihikari-rpc/bindings/node/hosihikari.mjs .
```

## 插件

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

钩子可以 async。返回值：`undefined` 或 `true` 允许；`false` 或 `{ allowed: false, reason }` 拒绝；抛异常是故障。

## 上下文

`ctx` 提供：

| 成员 | 说明 |
|---|---|
| `name` / `packageDirectory` / `dataDirectory` | 插件名、包目录、数据目录 |
| `config(key)` / `configObject` | 分层后的配置 |
| `logInfo` / `logWarn` / `logError` | 结构化日志（走协议） |
| `writeData(file, text)` | 在数据目录下写文件 |
| `publish(topic, json)` | 发布事件 |
| `subscribe(topic, fn, { sync })` | 订阅事件；`sync: true` 时发布方等 ack |
| `runLater(seconds, fn)` / `runEvery(seconds, fn)` | 定时器 |

事件默认异步。停用会关闭闸门，订阅回调与定时器停止投递；拒绝停用则恢复。卸载会结束子进程。

## 日志

stdout 只走协议；stderr 是文本日志。Node 绑定把 `console.log` 改道 stderr，插件不要往 stdout 写东西。

## 绑定

Provider 包里带参考绑定：

- `bindings/node/hosihikari.mjs` 与 `hosihikari.d.ts`（TypeScript 声明）
- `bindings/quickjs/hosihikari.js`（需要 `qjs`；JSDoc 类型）
- `bindings/python/hosihikari.py` 与 `hosihikari.pyi`（模块级 `on_load` 等；类型存根）
- `bindings/java/hosihikari`（Java 与 Kotlin 共用；`command` 指向 `hosihikari.Binding`）

Node 与 QuickJS 发往宿主的请求 30 秒超时；超时的请求会被拒绝。

各绑定的命令写法与上下文 API 见 [RpcProvider 的 README](https://github.com/HosihikariFramework/RpcProvider/blob/main/README.zh_hans.md)。

## Endstone 的 PATH

Endstone CLI 会把子进程的 `PATH` 换成 Python 的 `sys.path`；找不到可执行文件时，把 `command` 里的可执行文件改成绝对路径。

## 协议

自定义绑定按同一份协议实现：

- 宿主 → 插件：`hosihikari/hello`、`hosihikari/enable`、`hosihikari/disable`、`hosihikari/unload`、`hosihikari/events/deliver`
- 插件 → 宿主：`hosihikari/events/publish`、`hosihikari/events/subscribe`、`hosihikari/events/unsubscribe`、`hosihikari/log`
- 卸载：`unload` 请求 → 关 stdin → 等 5 秒 → 杀进程树。
