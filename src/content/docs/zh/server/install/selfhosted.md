---
title: 安装自持态载体
description: 安装自持态 Linux 载体。
---

自持态载体没有父级加载器：它把框架预加载进原版基岩版专用服务器。它是唯一不需要 LeviLamina 或 Endstone 就能跑的载体。

## 环境要求

- Linux x64。
- 基岩版专用服务器 **1.21.3**。启动器只针对这个版本。
- 机器上装有 **.NET 10 运行时**。
- [lip](https://github.com/LiteLDev/lip)。

## 安装

在服务端根目录执行：

```bash
lip install github.com/HosihikariFramework/HostingShim
```

不带后缀的包就是自持态载体。它依赖插件管理器，lip 会一并装上，落在 `plugins/hosihikari/`。

安装脚本会给启动器加可执行位。如果 lip 带了 `--ignore-scripts`，自己加：

```bash
chmod +x hosihikari-server
```

## 启动

通过启动器启动，不要直接跑 `bedrock_server`：

```bash
./hosihikari-server
```

启动器会切到服务端目录并预加载载体，后者在服务端 `main` 之前启动 CLR 与插件管理器。

## 这里的插件包

`plugins/` 下的每个插件都在服务端启动前加载并启用。没有运行期启停：停用一个插件就是把它的包移出 `plugins/` 再重启。这是载体的性质，不是插件的。

这里只跑预编译程序集插件。源码插件需要加载器包（[C#](/zh/develop/authoring-csharp/) 或 [F#](/zh/develop/authoring-fsharp/)），那是给父级态准备的。

## 验证

启动器输出与服务端日志里应当能看到 CLR 启动、载体接管、插件管理器报告在 `plugins/` 下发现了什么。 启动器立刻退出的话，第一行就写着原因——通常是缺运行时或缺 `bedrock_server`。见 [故障恢复](/zh/server/recovery/)。

## 文件位置

| 路径 | 内容 |
| --- | --- |
| `hosihikari-server` | 启动器；用它代替 `bedrock_server`。 |
| `plugins/hosihikari/` | 载体与插件管理器。 |
| `plugins/<name>/` | 插件包。 |
| `config/hosihikari/<name>.conf` | 服务端侧的配置覆盖。 |
| `data/hosihikari/<name>/` | 框架交给每个插件的数据目录。 |

## 卸载

```bash
lip uninstall github.com/HosihikariFramework/HostingShim
```
