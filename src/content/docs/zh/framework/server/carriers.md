---
title: 选择载体
description: 框架支持的三种载体环境，以及各自要付什么代价。
---

**载体**是一套具体的运行环境，由三个分量确定：平台、父级插件加载器（自持态没有），以及原生 API 提供方——LeviLamina 的 LLAPI、Endstone 的 API、自持态 BDS 1.21.3 的 MCAPI。框架只依赖平台与父级加载器；原生 API 一侧由投影提供。先选载体再动手装；三条载体的安装步骤不一样，不能互换。

| 载体 | 平台 | 父级 | BDS |
| --- | --- | --- | --- |
| [LeviLamina](/zh/framework/server/install/levilamina/) | Windows x64 | LeviLamina | 1.26.51+，配 LeviLamina 26.51+ |
| [Endstone](/zh/framework/server/install/endstone/) | Windows x64、Linux x64 | Endstone | 1.26.52+，配 Endstone 0.11+ |
| [自持态](/zh/framework/server/install/selfhosted/) | Linux x64 | 无 | 1.21.3 |

## 父级态与自持态

在 **LeviLamina** 或 **Endstone** 之下，框架是别人插件系统里的一个插件管理器。发现、启用、停用、卸载 都由父级发起，我们再把这些调用转给管理的插件。已经在跑那个加载器，就选它；Windows 上也只有这两个选择。

**自持态**没有父级：框架就是最外层的插件系统。它是唯一能在原版 BDS 上直接跑的载体，也是最受约束的一个：

- 启动器只跑一个 BDS 版本：1.21.3。
- 服务端需要安装 **.NET 10 运行时**。父级态同样需要——定位运行时的代码在共用的原生层里——只是在父级下容易被忽略。
- 目前没有运行期启停。`plugins/` 下的插件包在服务端 `main` 之前加载并启用，现在"禁用"意味着把包移走再重启。插件管理命令计划基于投影的命令 MCAPI 与插件管理器 API 实现；在那之前这是唯一的办法。父级态则由父级自己的注册表驱动启停，那两个调用正常工作。

## 怎么定

- **已经在跑 LeviLamina 或 Endstone。** 用对应载体，别的组合不受支持。
- **Windows、没有加载器。** LeviLamina 与 Endstone 都可以，都是 Windows x64。
- **Linux、没有加载器、BDS 1.21.3。** 自持态。
- **Linux、没有加载器、更新的 BDS。** 走 Endstone 载体。

## 载体不改变的东西

插件包在每个载体上都一样：`plugins/` 下的一个目录，带 `manifest.json`。插件契约、生命周期、隔离模型 也都一样。把插件包在载体之间搬动不需要重新构建。

插件管理器本身是载体包的 lip 依赖，随它一起装上，不需要单独安装。
