# Hosihikari documentation

[English](README.md) | [简体中文](README.zh_hans.md)

Online documentation: <https://hoshi.srcz.one/>

This repository holds the Starlight site, the bilingual documentation for the Hosihikari collection, and the example plugins. The site is deployed to GitHub Pages from `main`.

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
| `src/content/docs/framework/` | Framework pages: server, plugin authoring, and embedding. |
| `src/content/docs/projection/` | Projection overview. |
| `src/content/docs/seiko/` | Seiko overview. |
| `src/content/docs/zh/` | Simplified Chinese documentation, mirroring the same sections. |
| `examples/` | Example plugins referenced by the guides. |
| `astro.config.mjs` | Site configuration, redirects, and the bilingual sidebar. |
| `patches/` | Dependency patches applied by Bun. |

Pages are Markdown or MDX with Starlight frontmatter. Every page belongs to one project section and lives under its directory. Header links live in `src/components/Header.astro`; sidebar labels live in `astro.config.mjs`, and a sidebar item uses `slug` so the same entry resolves to the English and Chinese pages.

## License

Documentation prose and images are licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), see [LICENSE.md](LICENSE.md).
Code examples, snippets in the documentation, and the site source are MIT-0, see
[LICENSE-CODE.md](LICENSE-CODE.md). Third-party dependencies and fonts keep their own licenses.
