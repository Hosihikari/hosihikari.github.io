---
title: 插件包与清单
description: 目录结构、清单字段，以及框架在载入前的检查。
---

插件包是 `plugins/` 下的一个目录；目录名就是插件名，里面必须有 `manifest.json`。框架在载入之前读清单，并拒绝不合格的包。

## 目录

```
plugins/
  hello-csharp/
    manifest.json
    main.cs
    hello-csharp.conf
```

## 清单

```json
{
  "name": "hello-csharp",
  "entry": "main.cs",
  "type": "hosihikari",
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari" },
    { "name": "hosihikari-csharp" }
  ],
  "extraInfo": {
    "api_version": "2",
    "manifest_version": "1",
    "loader": "csharp"
  }
}
```

| 字段 | 说明 |
|---|---|
| `name` | 插件名，必须等于目录名。 |
| `entry` | 包内相对路径；绝对路径与 `..` 出界。 |
| `type` | 路由键，`hosihikari`。 |
| `version` | 插件自己的 SemVer 版本。 |
| `dependencies` | 依赖的插件名，可带 SemVer 范围；依赖图决定装载顺序并检查版本。 |
| `extraInfo.api_version` | 契约主版本，当前 `2`。 |
| `extraInfo.manifest_version` | 清单 schema 版本，当前 `1`。 |
| `extraInfo.loader` | 处理这个包的加载器。`assembly` 是插件管理器内置入口；`csharp`、`fsharp` 是进程内加载器；`rpc` 是进程外加载器。 |
| `extraInfo.command` | 仅 `rpc`：编码成字符串的 JSON 数组。 |

依赖按名字排序；每条依赖可以带一个 NuGet SemVer 范围：

- 省略、空字符串或 `*`：任意版本。
- `1.2.3`：1.2.3 或更高。
- `[1.2.3]`：精确 1.2.3。
- `[1.0.0,2.0.0)`：包含 1.0.0，不包含 2.0.0。

被范围约束的目标插件必须声明可解析的 `version`。框架依赖 `hosihikari` 不参与版本检查；加载器包先于依赖它的包装载。用进程内加载器的插件声明 `hosihikari-csharp` 或 `hosihikari-fsharp`；进程外插件声明 `hosihikari-rpc`。预编译程序集走插件管理器内置入口，不需要加载器包。

## 加载器与入口

官方加载器分两类：进程内加载器把源码 AOT 为 IL；RpcLoader 是进程外加载器，RPC 桥。预编译程序集走插件管理器内置入口。

| `loader` | `entry` | 装载方式 |
|---|---|---|
| `assembly` | `.dll` | 插件管理器内置：直接装载预编译 IL 程序集；程序集上恰好一个 `[assembly: EntryPoint<T>]`。 |
| `csharp` | `.cs` | 进程内加载器：Roslyn 装载时把 `.cs` AOT 为 IL，产物进 collectible ALC。 |
| `fsharp` | `.fsx` | 进程内加载器：FSharp.Compiler.Service 装载时把 `.fsx` AOT 为 IL。 |
| `rpc` | 入口文件 | 进程外加载器：由 `command` 启动子进程，行分隔 JSON-RPC 2.0 over stdio。 |

进程内加载器与预编译程序集插件的入口类型必须实现 `IPlugin` 且有无参构造；`EntryPoint<T>` 的泛型约束在编译期保证这两条。文件缺失、程序集里的入口声明数量不对等，由加载器报告。

## 载入前检查

框架在构造插件之前拒绝：

- `name` 与目录名不一致；
- `entry` 为空、绝对路径或越出包目录；
- `type` 不是 `hosihikari`；
- `api_version` 不是 `2`；
- `manifest_version` 不是 `1`；
- 清单不是合法 JSON。

这些检查发生在包进入生命周期之前，日志里会给出可读的原因。

## 配置与数据

- 包内默认：`plugins/<name>/<name>.conf`，随包更新。
- 服务端覆盖：`config/hosihikari/<name>.conf`，优先于包内。
- 环境变量：覆盖同名键（`greeting` 对应 `GREETING`）。
- 运行期数据：`data/hosihikari/<name>/`，由框架创建并交给插件。

配置是 HOCON。分层走框架的 provider 链，HOCON 的 `include` 在这条路径上不生效。

## 生命周期

`OnLoad` → `OnEnable` → `OnDisable` → `OnUnload`。

- `OnLoad` 时依赖已就绪；服务器未必已就绪。
- `OnEnable` 允许后打开作用域闸门；拒绝时插件留在册、保持未启用。
- `OnDisable` 之前框架关闭闸门，不再投递事件与定时器；拒绝时闸门重开。
- 卸载经停用；`OnUnload` 释放插件持有的东西。
- 钩子抛异常是故障：宿主卸载插件并通知载体。

回调闸门只管框架投递的事件与定时器。插件自有的线程、服务登记与直接引用要自己在 `OnUnload` 里收尾。

加载器包装上后不能运行期卸载；禁用或升级需重启服务端。
