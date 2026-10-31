---
title: 升级与回滚
description: 升到新版本，出问题时回得去。
---

各部分独立升级：载体、插件管理器、加载器、插件包。每一份都是解压到服务端根目录的 Release 归档。把装过的 Release 标签记下来；框架不写锁文件。

## 先看现在装了什么

每一部分的版本就是你下载的 Release 标签。升级前记下来：

- 载体的 HostingShim Release 标签；
- 核心的 PluginManager Release 标签；
- 各加载器的 Release 标签；
- `plugins/<name>/` 下的插件包。

## 升级

停服，下载新的归档并在服务端根目录解压，覆盖旧文件：

- 来自 [HostingShim 的 Release](https://github.com/HosihikariFramework/HostingShim/releases) 的 `hosihikari-<载体>-<平台>-x64.zip`；
- 来自 [Core 的 Release](https://github.com/HosihikariFramework/PluginManager/releases) 的 `hosihikari-core-<版本>.zip`；
- 各加载器自己 Release 里的归档。

重启，确认日志里框架重新接管。

## 锁定版本，或退回去

下载能用的那个版本的 Release 归档，解压到同样的路径。这就是回滚路径。重启，确认日志里框架重新接管。

## 哪些要重启

框架加载的一切都跑在服务端进程里：

- **载体与插件管理器。** 重启。
- **加载器包。** 运行期不能卸载；停用或升级它们都得重启。
- **插件包。** 父级态下，父级能在运行期停用、启用、卸载插件。自持态目前没有运行期启停：把包移出 `plugins/` 再重启。插件管理命令已在计划中，落地前这是唯一路径。

## 升级前对一遍兼容

发布页列出哪些版本是一起发的。真正起作用的是两个号：

- **寄宿契约版本。** 原生载体与插件管理器在启动前互相核对。不一致会中止启动序列，见[故障恢复](/zh/framework/server/recovery/)。
- **`api_version`。** 插件清单声明它按哪条契约构建。不兼容的插件在运行前就被拒绝。

HostingShim 的发布说明会写明那一版按哪条核心版本线构建。看你正要升到的那条线的[发布记录](/zh/framework/releases/)。

## 升级顺序

几部分一起动时，先升载体与核心，再升加载器归档，最后升插件包。最后统一重启一次。
