---
title: 常见问题
description: 常见错误与排查入口。
---

## 日志报 `apiVersion 不匹配` 或 `schemaVersion 不匹配`

插件是按另一版契约构建的。当前契约是 `apiVersion` 3、清单 `schemaVersion` 1；用 Hosihikari.Plugin.Abstractions 2.0.0 重新构建。改清单里的数字不会让旧类型面变成新契约。

## 日志报 `这是旧包（只有 manifest.json…）`

包是 1.x 的包。跑那一行给出的 `hosihikari-pack migrate` 命令，然后重编译、重打包；见[从 1.x 迁到 2.0](/zh/framework/migrate/v2/)。

## 日志报清单还在用旧字段

解析器不再认 1.x 的键名：`extraInfo.api` 改为 `extraInfo.api_version`，`extraInfo.provider` 改为 `loader`，`extraInfo.format_version` 改为 `manifest_version`。在 `hosihikari.json` 里除打包期设置住 `pack` 下，其余都在顶层；只写 `extraInfo.api_version` 与 `extraInfo.manifest_version` 还能按兜底读出来。

## 日志报 `没有能处理 loader=... 的加载器`

对应的加载器没装或没启用，或者插件清单没有声明依赖它。源码插件要装 C# 加载器 / F# 加载器包，并在 `dependencies` 里写 `hosihikari-csharp` / `hosihikari-fsharp`；进程外插件要装 RPC 加载器并写 `hosihikari-rpc`。

## 日志报 `清单 name 必须等于目录名`

目录名与 `name` 必须完全一致；改目录名或改清单。

## 日志报 `entry 必须是包内相对路径`

`entry` 只能指向包目录内的文件；去掉绝对路径与 `..`。

## 插件载入了，但启用前收不到事件与定时器

框架在 `OnEnable` 成功后打开作用域闸门。在 `OnLoad` 里登记的周期任务要等到启用才会收到回调；把周期任务的启动放到 `OnEnable`。

## 配置没有生效

- 包内默认文件是 `<name>.conf`，名字与插件名一致。
- 服务端覆盖是 `config/hosihikari/<name>.conf`。
- 环境变量也参与覆盖；键名大小写不敏感。
- 分层加载走框架的 provider 链，HOCON 的 `include` 不生效。

## 数据写到哪

`data/hosihikari/<name>/`。`ctx.DataDirectory`（Node/Python）或 `context.DataDirectory`（.NET）指向它。

## 进程外插件启动不了

- 可执行文件不在 `PATH`：日志里会有 spawn 失败或进程立即退出。
- Endstone：CLI 换了子进程的 `PATH`，把 `pack.command` 里的可执行文件写成绝对路径。
- 插件往 stdout 写了非协议内容：stdout 只走 JSON-RPC；日志走 stderr 或 `logInfo`。
- 协议定义是从 1.x 加载器拷来的：握手协议是版本 2，旧定义过不了 `hello`。

## 卸载后插件还有残留

- 静态字段、单例、裸线程会让 ALC 无法回收；在 `OnUnload` 里停线程、退订、清引用。
- 本机库随进程存活，卸载只回收托管 ALC。
- 框架会回收它投递的事件订阅与定时器，插件自有的资源要自己收。
- 无视令牌的钩子只会撞上钩子超时，它本身不挡回收；卸载报告会写明失败在哪一段。
