# Hosihikari Framework documentation

[English](README.md) | [简体中文](README.zh_hans.md)

Online documentation: <https://hosihikariframework.github.io/>

This repository holds the Starlight site, the bilingual documentation, and the example plugins. The site is deployed to GitHub Pages from `main`.

## Requirements

- [Bun](https://bun.sh/) 1.4 or newer.

## Development

```bash
bun install
bun run dev
```

The dev server prints the local URL. Build and preview with:

```bash
bun run build
bun run preview
```

## Layout

| Path | Contents |
|---|---|
| `src/content/docs/` | English documentation (root locale). |
| `src/content/docs/zh/` | Simplified Chinese documentation. |
| `examples/` | Example plugins used by the quick start. |
| `astro.config.mjs` | Site configuration and the bilingual sidebar. |
| `patches/` | Dependency patches applied by Bun. |

Pages are Markdown or MDX with Starlight frontmatter. Navigation labels live in `astro.config.mjs`; a sidebar item uses `slug` so the same entry resolves to the English and Chinese pages.

## License

Documentation prose and images are licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), see [LICENSE.md](LICENSE.md).
Code examples, snippets in the documentation, and the site source are MIT-0, see
[LICENSE-CODE.md](LICENSE-CODE.md). Third-party dependencies and fonts keep their own licenses.
