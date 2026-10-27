---
title: 升级与回滚
description: 升到新版本，出问题时回得去。
---

各部分独立升级：载体、插件管理器、加载器、插件包。命令在每个载体上都一样，只有包的标签不同。

## 先看现在装了什么

```bash
lip list
```

已安装的包连同版本一起列出；带标签装的包会显示标签（`HostingShim#levilamina@1.1.0`）。升级前把这行 输出留一份。

## 升级

```bash
lip update github.com/HosihikariFramework/HostingShim#levilamina
```

`lip update` 接受与 `lip install` 相同的包写法，包括 `#variant` 标签。加 `-n` 只预览不执行。

没有 `lip upgrade` 这个命令。

## 锁定版本，或退回去

`lip install` 带显式版本号既能升级也能降级：

```bash
lip install github.com/HosihikariFramework/HostingShim#levilamina@1.1.0
```

这就是回滚路径。装上能用的那版，重启，确认日志里框架重新接管。

## 哪些要重启

框架加载的一切都跑在服务端进程里：

- **载体与插件管理器。** 重启。
- **加载器包。** 运行期不能卸载；停用或升级它们都得重启。
- **插件包。** 父级态下，父级能在运行期停用、启用、卸载插件。自持态没有运行期启停：把包移出 `plugins/` 再重启。

## 升级前对一遍兼容

发布页列出哪些版本是一起发的。真正起作用的是两个号：

- **寄宿契约版本。** 原生载体与插件管理器在启动前互相核对。不一致会中止启动序列，见[故障恢复](/zh/server/recovery/)。
- **`api_version`。** 插件清单声明它按哪条契约构建。不兼容的插件在运行前就被拒绝。

看你正要升到的那条线的[发布记录](/zh/releases/)。

## 升级顺序

几个包一起动时，先升载体——它会把需要的插件管理器作为 lip 依赖带上——再升加载器包，最后升插件包。 最后统一重启一次。
