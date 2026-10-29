---
title: 内嵌管理器
description: 在你自己的进程里承载 Hosihikari.PluginManager。
---

这一节写给你：有一个自己掌控的宿主进程，要把 PluginManager 嵌进去。管理器提供发现、依赖排序、隔离与生命周期；载体服务由你提供，启停也由你驱动。

## 步骤

- [开始内嵌](/zh/framework/embed/getting-started/) —— 加包，立一个最小宿主。
- [载体服务](/zh/framework/embed/carrier-services/) —— 宿主必须提供什么，加载器怎么登记。
- [生命周期](/zh/framework/embed/lifecycle/) —— `Load`、`Enable`、`Disable`、`Unload` 与状态快照。
- [事件与回调](/zh/framework/embed/events-and-callbacks/) —— 事件总线、调度器、`reportFault`、`onRemoved`。

插件本身怎么写在[写插件](/zh/framework/develop/)。
