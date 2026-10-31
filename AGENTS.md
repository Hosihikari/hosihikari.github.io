# AGENTS.md

Online documentation and example plugins for the Hosihikari collection, built with Astro and
Starlight.

## Repository map

- `src/content/docs/` — English pages; `src/content/docs/zh/` mirrors them in Chinese. Every page
  sits under `framework/`, `projection/`, or `seiko/`.
- `astro.config.mjs` — site configuration, redirects, locales, and sidebar.
- `src/components/Header.astro` — the three product links in the site header.
- `examples/` — example plugin packages referenced by the guides.
- `public/` — static assets and the Pages `CNAME`.
- `.github/workflows/deploy.yml` — builds and deploys the site.
- `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md` — repository-specific templates.

## Build and verify

```bash
bun install --frozen-lockfile
bun run build
```

Use `bun run dev` for a local preview. The deploy workflow runs the same install and build commands.

## Invariants

- English lives at the site root; Chinese lives under `/zh/`. Add both versions of every page.
- Every page belongs to one project section: `framework/` (the plugin framework), `projection/`
  (the API projection), or `seiko/` (the package manager). Do not create pages outside them.
- Add sidebar entries and their `zh-CN` translations in `astro.config.mjs`. Keep the product links
  in `src/components/Header.astro` in sync across locales.
- Keep examples and commands aligned with the current release line and package names.
- Document the current major version only. Do not publish cross-major change summaries or
  migration notes, and do not show v0-era information now that v1 is out.
- Do not edit `dist/`, `.astro/`, or `node_modules/`.
- Public default branches are protected. Work on a branch, open a pull request, and squash merge.

## Context

- [Published site](https://hoshi.srcz.one/).
- Design decisions and terminology are kept by maintainers outside the public repositories; ask for
  the relevant decision when changing lifecycle or public API.
