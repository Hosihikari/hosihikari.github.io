---
title: 在 LeviLamina 上安装
description: 在 LeviLamina 服务端上安装框架。
---

LeviLamina 载体以一个 mod 的形式装进去。框架是插件管理器，LeviLamina 是它的父级。

## 环境要求

- Windows x64。
- 基岩版专用服务器 1.26.51 或更新，且已装好可用的 LeviLamina 26.51 或更新。
- [lip](https://github.com/LiteLDev/lip)。
- .NET 10 运行时。框架把 CLR 托进服务端进程；没有运行时，启动序列会停下来并在日志里说明原因。

## 安装

在服务端根目录执行：

```powershell
lip install github.com/HosihikariFramework/HostingShim#levilamina
```

`#levilamina` 标签选择变体。不带后缀的包是 Linux 自持态载体，在这里装不上。这个包依赖插件管理器， lip 会一并装上，落在 `plugins/hosihikari/`。

然后照常启动服务端。

## 验证

服务端日志里应当能看到框架接管：

- CLR 启动；
- 载体向 LeviLamina 登记；
- LeviLamina 启用它；
- 插件管理器报告它在 `plugins/` 下发现了哪些插件。

这些都没有，就看启动之后紧跟的那行日志。见[故障恢复](/zh/server/recovery/)。

## 文件位置

| 路径 | 内容 |
| --- | --- |
| `plugins/hosihikari/` | 载体、插件管理器与它的依赖。 |
| `plugins/<name>/` | 插件包。 |
| `config/hosihikari/<name>.conf` | 服务端侧的配置覆盖。 |
| `data/hosihikari/<name>/` | 框架交给每个插件的数据目录。 |
| `logs/latest.log` | 服务端与框架日志。 |

## 卸载

```powershell
lip uninstall github.com/HosihikariFramework/HostingShim#levilamina
```

标签是包标识的一部分。漏掉标签，lip 会回答「未显式安装」。卸载会连插件管理器依赖一起移除， 还有别的包要用框架时别执行。
