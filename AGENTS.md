# AGENTS.md

Online documentation and example plugins for the Hosihikari Framework, built with Astro and
Starlight.

## Repository map

- `src/content/docs/` — English pages; `src/content/docs/zh/` mirrors them in Chinese.
- `astro.config.mjs` — site configuration, locales, sidebar, and integrations.
- `examples/` — example plugin packages referenced by the guides.
- `public/` — static assets.
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
- Add sidebar entries and their `zh-CN` translations in `astro.config.mjs`.
- Keep examples and commands aligned with the current release line and package names.
- Do not edit `dist/`, `.astro/`, or `node_modules/`.
- Public default branches are protected. Work on a branch, open a pull request, and squash merge.

## Context

- [Published site](https://hf.srcz.one/).
- [Design record](https://github.com/HosihikariFramework/Design) — GLOSSARY and ADRs.
