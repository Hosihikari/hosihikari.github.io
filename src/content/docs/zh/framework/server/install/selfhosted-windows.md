---
title: 安装自持态载体（Windows）
description: 安装自持态 Windows 载体。
---

自持态 Windows 载体没有父级加载器。启动器挂起启动原版 `bedrock_server.exe`，注入原生垫片，调用它的导出入口，再恢复服务端运行；CLR 与插件管理器因此在服务端 `main` 之前起来。

## 环境要求

- Windows x64。
- 基岩版专用服务器 **1.21.3.01**。载体只针对这个版本，与自持态 Linux 的上限相同。
- 机器上装有 **.NET 10 运行时**。

## 安装

从 GitHub Release 下载两个归档，并都解压到服务端根目录：

- 来自 [HostingShim 的 Release](https://github.com/HosihikariFramework/HostingShim/releases) 的 `hosihikari-selfhosted-windows-x64.zip`。
- 来自 [Core 的 Release](https://github.com/HosihikariFramework/PluginManager/releases) 的 `hosihikari-core-<版本>.zip`。

载体归档写 `hosihikari-server.exe` 与 `plugins/hosihikari/` 下的原生垫片；核心归档把插件管理器加进同一个目录。垫片静态链接 nethost，不需要 `nethost.dll`。

## 启动

通过启动器启动，不要直接跑 `bedrock_server.exe`：

```powershell
.\hosihikari-server.exe
```

启动器从同一个目录启动 `bedrock_server.exe`，所以在服务端根目录运行它。`--` 之后的参数原样传给服务端。

## 这里的插件包

`plugins/` 下的每个插件都在服务端启动前加载并启用。目前没有运行期启停：现在停用一个插件就是把它的包移出 `plugins/` 再重启。插件管理命令计划基于投影的命令 MCAPI 与插件管理器 API 实现。

源码插件也能跑：把对应的加载器 Release 归档（[C#](/zh/framework/develop/authoring-csharp/) 或 [F#](/zh/framework/develop/authoring-fsharp/)）和载体一起装上。

## 验证

启动器控制台与服务端日志里应当能看到 CLR 启动、载体接管、插件管理器报告在 `plugins/` 下发现了什么。启动器立刻退出的话，第一行就写着原因——通常是缺运行时或缺 `bedrock_server.exe`。见 [故障恢复](/zh/framework/server/recovery/)。

## 文件位置

| 路径 | 内容 |
| --- | --- |
| `hosihikari-server.exe` | 启动器；用它代替 `bedrock_server.exe`。 |
| `plugins/hosihikari/hosihikari.dll` | 被注入的垫片。 |
| `plugins/hosihikari/` | 载体与插件管理器。 |
| `plugins/<name>/` | 插件包。 |
| `config/hosihikari/<name>.conf` | 服务端侧的配置覆盖。 |
| `data/hosihikari/<name>/` | 框架交给每个插件的数据目录。 |

## 卸载

停服后删除 `hosihikari-server.exe` 与 `plugins/hosihikari/`。`plugins/<name>/` 下的插件包单独移除。`config/hosihikari/` 与 `data/hosihikari/` 里的配置和数据可以保留，也可以一并删除。
