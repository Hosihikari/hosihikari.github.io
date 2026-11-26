---
title: 插件包与清单
description: 目录结构、清单字段，以及框架在载入前的检查。
---

插件包是 `plugins/` 下的一个目录；目录名就是插件名，里面必须有 `hosihikari.json`。框架在载入之前读清单，并拒绝不合格的包。

`manifest.json` 是 LeviLamina 的信封。打包器按 `hosihikari.json` 把它生成进输出包；源码树里只有 `hosihikari.json`。只剩 `manifest.json` 的包是 1.x 的包，会被拒载并附上 `hosihikari-pack migrate` 的提示；见[从 1.x 迁到 2.0](/zh/framework/migrate/v2/)。

## 目录

```
plugins/
  hello-csharp/
    hosihikari.json
    main.cs
    hello-csharp.conf
```

## 清单

```json
{
  "schemaVersion": 1,
  "name": "hello-csharp",
  "version": "1.0.0",
  "entry": "main.cs",
  "loader": "csharp",
  "kind": "plugin",
  "apiVersion": 3,
  "dependencies": [{ "name": "hosihikari" }, { "name": "hosihikari-csharp" }]
}
```

| 字段                       | 说明                                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion`            | 清单 schema 版本，`1`。                                                                                                             |
| `name`                     | 插件名，必须等于目录名。                                                                                                            |
| `version`                  | 插件自己的 SemVer 版本。                                                                                                            |
| `entry`                    | 包内相对路径；绝对路径与 `..` 出界。                                                                                                |
| `loader`                   | 处理这个包的加载器，省略时为 `assembly`。`assembly` 是插件管理器内置入口；`csharp`、`fsharp` 是进程内加载器；`rpc` 是进程外加载器。 |
| `kind`                     | `plugin`（缺省）、`loader` 或 `carrier`。自持态扫描会跳过载体包。                                                                   |
| `apiVersion`               | 契约主版本，当前 `3`。                                                                                                              |
| `dependencies`             | 必填 `hosihikari`，父级才会先装寄宿垫片。其余是被依赖的插件名，可带 SemVer 范围；依赖图决定装载顺序并检查版本。                     |
| `description`              | 展示文本，有则抄进信封。                                                                                                            |
| `author`                   | 展示文本，有则抄进信封。                                                                                                            |
| `pack.command`             | 仅 `rpc`：参数表，用 JSON 数组或用字符串装编码后的数组。                                                                            |
| `pack.packages`            | 打包期还原进包的 `Id/Version` 或 `Id` NuGet 包。                                                                                    |
| `pack.prepack`             | 打包期在包目录执行的命令，例如 `npm ci`；单个字符串或数组。只在打包期跑，服务端不还原，每次执行限 5 分钟。                          |
| `carrier.sharedAssemblies` | 仅 `carrier`：载体加进共享层的文件名。                                                                                              |
| `carrier.components`       | 仅 `carrier`：进程级组件，元素为 `{ assembly, type }`，类型是实现了 `ICarrierComponent` 的具体类。                                  |

`type` 可省，写了就必须是 `hosihikari`；信封里恒有它。信封是生成出来的，改 `description` 或 `author` 要重新打包才会到父级手里。

依赖按你写的顺序保留；它们之间的装载顺序走拓扑序。每条依赖可以带一个 NuGet SemVer 范围：

- 省略、空字符串或 `*`：任意版本。
- `1.2.3`：1.2.3 或更高。
- `[1.2.3]`：精确 1.2.3。
- `[1.0.0,2.0.0)`：包含 1.0.0，不包含 2.0.0。

被范围约束的目标插件必须声明可解析的 `version`。框架依赖 `hosihikari` 不参与版本检查；加载器包先于依赖它的包装载。用进程内加载器的插件声明 `hosihikari-csharp` 或 `hosihikari-fsharp`；进程外插件声明 `hosihikari-rpc`。预编译程序集走插件管理器内置入口，不需要加载器包。

## 载体包

载体包的 `kind` 是 `carrier`，名叫 `hosihikari`，不需要 `hosihikari` 依赖。它就是垫片自己，所以自持态扫描会跳过它，打包器也只把它生成进输出包。它声明 `carrier.sharedAssemblies` 与 `carrier.components`；打包器校验什么见[从 1.x 迁到 2.0](/zh/framework/migrate/v2/#载体包)。

## 加载器与入口

官方加载器分两类：进程内加载器在装载时把源码编成 IL；RpcLoader 是进程外加载器，RPC 桥。预编译程序集走插件管理器内置入口。

| `loader`   | `entry`  | 装载方式                                                                                 |
| ---------- | -------- | ---------------------------------------------------------------------------------------- |
| `assembly` | `.dll`   | 插件管理器内置：直接装载预编译 IL 程序集；程序集上恰好一个 `[assembly: EntryPoint<T>]`。 |
| `csharp`   | `.cs`    | 进程内加载器：Roslyn 在装载时把 `.cs` 编成 IL，产物进 collectible ALC。                  |
| `fsharp`   | `.fsx`   | 进程内加载器：FSharp.Compiler.Service 在装载时把 `.fsx` 编成 IL。                        |
| `rpc`      | 入口文件 | 进程外加载器：由 `pack.command` 启动子进程，行分隔 JSON-RPC 2.0 over stdio。             |

进程内加载器与预编译程序集插件的入口类型必须实现 `IPlugin` 且有无参构造；`EntryPoint<T>` 的泛型约束在编译期保证这两条。文件缺失、程序集里的入口声明数量不对等，由加载器报告。

只有 `kind: loader` 的包拿到 `ILoaderContext`；其余包拿到只实现 `IPluginContext` 的视图，强转到 `ILoaderContext` 会失败。

## 载入前检查

框架在构造插件之前拒绝：

- `name` 与目录名不一致；
- `entry` 为空、绝对路径或越出包目录；
- `type` 写了但不是 `hosihikari`；
- `apiVersion` 不是 `3`；
- `schemaVersion` 不是 `1`；
- `kind` 不是 `plugin`、`loader` 或 `carrier`，或载体包没叫 `hosihikari`；
- `plugin` 或 `loader` 包缺 `hosihikari` 依赖；
- 依赖里重复了包自己的名字；
- 清单不是合法 JSON。

只有 `manifest.json` 的包按旧包拒载，并附上 `hosihikari-pack migrate` 命令。这些检查发生在包进入生命周期之前，日志里会给出可读的原因。

## 配置与数据

- 包内默认：`plugins/<name>/<name>.conf`，随包更新。
- 服务端覆盖：`config/hosihikari/<name>.conf`，优先于包内。
- 环境变量：覆盖同名键（`greeting` 对应 `GREETING`）。
- 运行期数据：`data/hosihikari/<name>/`，由框架创建并交给插件。

配置是 HOCON。分层走框架的 provider 链，HOCON 的 `include` 在这条路径上不生效。

## 生命周期

`OnLoad` → `OnEnable` → `OnDisable` → `OnUnload`。四个都是异步方法并接收 `CancellationToken`；`OnEnable` 与 `OnDisable` 返回 `PluginHookResult`。

- `OnLoad` 时依赖已就绪；服务器未必已就绪。
- `OnEnable` 允许后打开作用域闸门；拒绝时插件留在册、保持未启用。
- `OnDisable` 之前框架关闭闸门，不再投递事件与定时器；拒绝时闸门重开。
- 卸载经停用；`OnUnload` 释放插件持有的东西。
- `Enable` 与 `Disable` 都幂等：重复调用不会再跑钩子。载体重载会先停用、再启用它重载的那些插件。
- 钩子抛异常是故障：宿主卸载插件并通知载体。
- 钩子超过 `HookTimeout`（默认 30 秒）会被取消；装载被取消会回滚，启用被取消保持停用，停用或卸载被取消后框架不再等待。

回调闸门只管框架投递的事件与定时器。插件自有的线程、服务登记与直接引用要自己在 `OnUnload` 里收尾。

加载器包装上后不能运行期卸载；禁用或升级需重启服务端。
