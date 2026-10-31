---
title: 在 LeviLamina 上安装
description: 在 LeviLamina 服务端上安装框架。
---

LeviLamina 载体以一个 mod 的形式装进去。框架是插件管理器，LeviLamina 是它的父级。

## 环境要求

- Windows x64。
- 基岩版专用服务器 1.26.51 或更新，且已装好可用的 LeviLamina 26.51 或更新。
- .NET 10 运行时。框架把 CLR 托进服务端进程；没有运行时，启动序列会停下来并在日志里说明原因。

## 安装

从 GitHub Release 下载两个归档，并都解压到服务端根目录：

- 来自 [HostingShim 的 Release](https://github.com/HosihikariFramework/HostingShim/releases) 的 `hosihikari-levilamina-windows-x64.zip`。
- 来自 [Core 的 Release](https://github.com/HosihikariFramework/PluginManager/releases) 的 `hosihikari-core-<版本>.zip`。

两者写 `plugins/hosihikari/` 下的不同文件，按文件合并。HostingShim 的发布说明会写明兼容的核心版本线；原生垫片启动时会核对入口契约版本。

然后照常启动服务端。

## 验证

服务端日志里应当能看到框架接管：

- CLR 启动；
- 载体向 LeviLamina 登记；
- LeviLamina 启用它；
- 插件管理器报告它在 `plugins/` 下发现了哪些插件。

这些都没有，就看启动之后紧跟的那行日志。见[故障恢复](/zh/framework/server/recovery/)。

## 文件位置

| 路径 | 内容 |
| --- | --- |
| `plugins/hosihikari/` | 载体、插件管理器与它的依赖。 |
| `plugins/<name>/` | 插件包。 |
| `config/hosihikari/<name>.conf` | 服务端侧的配置覆盖。 |
| `data/hosihikari/<name>/` | 框架交给每个插件的数据目录。 |
| `logs/latest.log` | 服务端与框架日志。 |

## 卸载

停服后删除 `plugins/hosihikari/`。插件包在 `plugins/<name>/` 下，单独移除。`config/hosihikari/` 与 `data/hosihikari/` 里的配置和数据可以保留，也可以一并删除。
