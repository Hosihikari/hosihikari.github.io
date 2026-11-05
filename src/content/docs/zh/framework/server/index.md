---
title: 运行服务器
description: 在基岩版专用服务器上安装框架，并把它维护下去。
---

这一节写给跑服务器的人：选载体、装上去，以及之后怎么过日子。插件本身怎么写在[写插件](/zh/framework/develop/)。

## 步骤

1. [选择载体](/zh/framework/server/carriers/) —— 框架支持哪些运行环境，以及各自要付什么代价。
2. 装上去：[LeviLamina](/zh/framework/server/install/levilamina/)、[Endstone](/zh/framework/server/install/endstone/)、[自持态 Linux](/zh/framework/server/install/selfhosted/) 或[自持态 Windows](/zh/framework/server/install/selfhosted-windows/)。
3. 把插件放进 `plugins/`，启动服务端。
4. 维护：[升级](/zh/framework/server/updating/)、[备份](/zh/framework/server/backup/)，出问题时看[故障恢复](/zh/framework/server/recovery/)。

先记住一件事：框架让插件跑在服务端进程里，权限与服务端相同。它让插件之间相互隔离，不是一个沙箱。

## 语言

核心与加载器的消息 —— 日志、加载报告与卸载失败原因 —— 提供阿拉伯语、简体中文、英语、法语、俄语与西班牙语。服务端的 UI 文化决定语言，英文是兜底；中文的各种变体（包括繁体中文）都回退到简体中文资源。文化来自宿主操作系统，无需配置。载体的原生消息仍是中文：LeviLamina 载体跟随父级的语言，Endstone 载体与自持态启动器保持中文。
