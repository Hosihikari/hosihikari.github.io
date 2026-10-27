# 星光框架文档

[English](README.md) | [简体中文](README.zh_hans.md)

在线文档：<https://hf.srcz.one/zh/>

本仓包含 Starlight 站点、双语文档与示例插件。站点从 `main` 发布到 GitHub Pages。

## 环境

- [Bun](https://bun.sh/) 1.4 或更新版本。

## 本地开发

```bash
bun install
bun run dev
```

开发服务器会打印本地地址。构建与预览：

```bash
bun run build
bun run preview
```

## 目录

| 路径 | 内容 |
|---|---|
| `src/content/docs/` | 英文文档（根区域）。 |
| `src/content/docs/server/` | 面向服主与运维的页面。 |
| `src/content/docs/develop/` | 面向插件作者的页面。 |
| `src/content/docs/embed/` | 面向内嵌 PluginManager 的宿主的页面。 |
| `src/content/docs/zh/` | 简体中文文档，按同样分区镜像。 |
| `examples/` | 文档引用的示例插件。 |
| `astro.config.mjs` | 站点配置、顶栏链接与双语侧边栏。 |
| `patches/` | Bun 应用的依赖补丁。 |

页面是带 Starlight frontmatter 的 Markdown 或 MDX。每页属于三个读者分区之一，放在对应目录下。顶栏链接（`navLinks`）与侧边栏标签在 `astro.config.mjs` 里；侧边栏条目用 `slug`，同一条目会解析到英文与中文页面。

## 许可

文档正文与图片使用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)，见
[LICENSE.md](LICENSE.md)。代码示例、文档中的代码片段与站点源码使用 MIT-0，见
[LICENSE-CODE.md](LICENSE-CODE.md)。第三方依赖与字体保留各自的许可。
