---
title: 在 Endstone 上安装
description: 在 Endstone 服务端上安装框架。
---

Endstone 载体以一个 Endstone 插件的形式装进去。框架是插件管理器，Endstone 是它的父级。

## 环境要求

- Windows x64 或 Linux x64。
- 基岩版专用服务器 1.26.52 或更新，且已装好可用的 Endstone 0.11 或更新。
- [lip](https://github.com/LiteLDev/lip)。
- .NET 10 运行时。框架把 CLR 托进服务端进程；没有运行时，启动序列会停下来并在日志里说明原因。

## 安装

在服务端根目录执行：

```bash
lip install github.com/HosihikariFramework/HostingShim#endstone
```

`#endstone` 标签选择变体，lip 按服务端平台取 Windows 或 Linux 的包。不带后缀的包是 Linux 自持态载体， 在这里装不上。这个包依赖插件管理器，lip 会一并装上，落在 `plugins/hosihikari/`。

通过 Endstone 的 CLI 启动服务端——Endstone 就是这样把运行时注入原版服务端二进制的：

```bash
endstone -s <服务端根目录>
```

## 验证

日志里应当能看到 CLR 启动、载体作为 Endstone 插件登记、Endstone 启用它，以及插件管理器报告在 `plugins/` 下发现了什么。都没有就看[故障恢复](/zh/framework/server/recovery/)。

## 两处 Endstone 特有的细节

- **插件名会被规范化。** Endstone 只接受 `^[a-z0-9_]+$`，且不允许以 `endstone` 开头。名为 `Bar` 的插件 在 Endstone 眼里是 `bar`；框架仍按清单名记录它。按名字操作插件的命令要用 Endstone 的写法。
- **nethost 库必须能被解析。** Windows 上 `nethost.dll` 放在 `bedrock_server.exe` 旁边；Linux 上 `libnethost.so` 放在插件旁边，靠 `$ORIGIN` 找到。包会处理好，只有手工部署时才需要在意。

## 文件位置

| 路径 | 内容 |
| --- | --- |
| `plugins/hosihikari.dll` / `plugins/hosihikari.so` | 载体本身；Endstone 按文件加载插件。 |
| `plugins/hosihikari/` | 插件管理器与它的依赖。 |
| `plugins/<name>/` | 插件包。 |
| `config/hosihikari/<name>.conf` | 服务端侧的配置覆盖。 |
| `data/hosihikari/<name>/` | 框架交给每个插件的数据目录。 |
| `logs/latest.log` | 服务端与框架日志。 |

## 卸载

```bash
lip uninstall github.com/HosihikariFramework/HostingShim#endstone
```

标签是包标识的一部分。漏掉标签，lip 会回答未显式安装。
