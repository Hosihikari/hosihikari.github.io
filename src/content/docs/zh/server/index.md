---
title: 运行服务器
description: 在基岩版专用服务器上安装框架，并把它维护下去。
---

这一节写给跑服务器的人：选载体、装上去，以及之后怎么过日子。插件本身怎么写在[写插件](/zh/develop/)。

## 步骤

1. [选择载体](/zh/server/carriers/) —— 框架进入服务端的三条通道，以及各自要付什么代价。
2. 装上去：[LeviLamina](/zh/server/install/levilamina/)、[Endstone](/zh/server/install/endstone/)，
   或[自持态 Linux 载体](/zh/server/install/selfhosted/)。
3. 把插件放进 `plugins/`，启动服务端。
4. 维护：[升级](/zh/server/updating/)、[备份](/zh/server/backup/)，出问题时看[故障恢复](/zh/server/recovery/)。

先记住一件事：框架让插件跑在服务端进程里，权限与服务端相同。它让插件之间相互隔离，不是一个沙箱。
