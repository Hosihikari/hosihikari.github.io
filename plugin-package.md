# 插件包与清单

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
    "api": "2",
    "format_version": "1",
    "provider": "csharp"
  }
}
```

| 字段 | 说明 |
|---|---|
| `name` | 插件名，必须等于目录名。 |
| `entry` | 包内相对路径；绝对路径与 `..` 出界。 |
| `type` | 路由键，`hosihikari`。 |
| `version` | 插件自己的版本字符串。 |
| `dependencies` | 依赖的插件名；依赖图决定装载顺序。 |
| `extraInfo.api` | 契约主版本，当前 `2`。 |
| `extraInfo.format_version` | 清单 schema 版本，当前 `1`。 |
| `extraInfo.provider` | 处理这个包的 Provider。 |
| `extraInfo.command` | 仅 `rpc`：编码成字符串的 JSON 数组。 |

依赖按名字排序，没有版本约束；框架自身是 `hosihikari`。脚本插件还要声明对应的 Provider：`hosihikari-csharp`、`hosihikari-fsharp` 或 `hosihikari-rpc`。Provider 也是插件包，先于依赖它的包装载。

## Provider 与入口

| `provider` | `entry` | 装载方式 |
|---|---|---|
| `assembly` | `.dll` | 核心直接装载；程序集上恰好一个 `[assembly: EntryPoint<T>]`。 |
| `csharp` | `.cs` | Roslyn 装载时编译，产物进 collectible ALC。 |
| `fsharp` | `.fsx` | FSharp.Compiler.Service 装载时编译。 |
| `rpc` | 入口文件 | 由 `command` 启动子进程，行分隔 JSON-RPC 2.0 over stdio。 |

入口类型必须实现 `IPlugin` 且有无参构造；`EntryPoint<T>` 的泛型约束在编译期保证这两条。文件缺失、程序集里的入口声明数量不对等，由 Provider 报告。

## 载入前检查

框架在构造插件之前拒绝：

- `name` 与目录名不一致；
- `entry` 为空、绝对路径或越出包目录；
- `type` 不是 `hosihikari`；
- `api` 不是 `2`；
- `format_version` 不是 `1`；
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
