---
title: 备份与还原
description: 保存世界与框架状态，以及把它们放回去。
---

值得留的备份有两半：游戏自己的，和插件自己的。

## 备份什么

| 路径 | 内容 | 什么时候会变 |
| --- | --- | --- |
| `worlds/` | 所有世界，一个 `level-name` 一个目录 | 玩家在线时持续变化 |
| `keys/server_identity_key.pem` | 服务端身份钥 | 一次 |
| `allowlist.json` | 白名单 | 改名单时 |
| `plugins/` | 插件包，含 `plugins/hosihikari/` | 安装与升级时 |
| `config/hosihikari/` | 服务端侧的配置覆盖 | 改配置时 |
| `data/hosihikari/` | 框架交给插件的数据 | 插件运行时 |

后三项是框架的。`plugins/` 虽然能重装，也值得备份：一台能跑的服务端上装的到底是哪几个版本的包，
本身就是你要保住的东西。

## 停服备份

停服，拷上表路径，再启动。这是唯一不会拍到半个世界的做法。

## 运行中备份

BDS 可以按需刷盘。在服务端控制台里：

```
save hold
save query
save resume
```

`save hold` 暂停世界写入并允许拷贝；`save query` 报告哪些文件可以安全拷、长度多少；`save resume`
解除暂停。在 `hold` 与 `resume` 之间拷 `worlds/`，框架那几个路径照常拷——它们是普通目录，不受世界刷盘覆盖。

## 还原

1. 停服。
2. 用备份替换 `worlds/`、`keys/` 与 `allowlist.json`。
3. 替换 `plugins/`、`config/hosihikari/` 与 `data/hosihikari/`。
4. 启动，看日志里框架是否重新接管、插件列表是否正确。

把旧的 `plugins/` 配上新框架，是插件因 `api_version` 被拒绝的常见原因。框架与插件用同一天的备份还原。

## 备份覆盖不到的东西

- BDS 本体与它自己的文件。留着你安装时用的那份服务端压缩包。
- .NET 运行时。重装，不要拷贝。
- 插件写在 `data/hosihikari/` 之外的东西。那个路径是契约；写到别处的插件在契约之外，得知道它自己的布局。
