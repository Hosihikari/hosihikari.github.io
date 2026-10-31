---
title: Sources and indexes
description: Point Seiko at an index, combine several, and protect a private one.
---

A source is a static index: a directory or an HTTP(S) location with one `index.json` and one `<sei>.json` per name. Seiko never runs registry code; it fetches files and checks them.

## The official index

`sk init` writes the official index as source `official`:

```hocon
sources = [
  { id = "official", index = "https://raw.githubusercontent.com/Hosihikari/SeiIndex/main/index.json" }
]
```

The URL points at the index file; sibling `sei/<name>.json` files are resolved relative to it.

## Add a source

```bash
sk source add internal https://packages.example.com/seiko/index.json
sk source add local ../my-index/index.json
```

The index path for a local source is a file, not a directory. Relative paths resolve from the install root. `sk source list` prints the current order, and `sk source remove <id>` removes one.

Sources are tried in declaration order. The first source that contains a sei name provides all versions of that sei; later sources are not merged into it. There is no `priority` field: reorder the `sources` array to change precedence.

## Private sources

Private sources use a host-keyed bearer token. The destination host selects the environment variable; `seiko.conf` cannot name one:

```hocon
sources = [
  {
    id = "private",
    index = "https://packages.example.com/seiko/index.json",
    tokenHosts = ["cdn.example.com"]
  }
]
```

Set `SEIKO_TOKEN_<HOST>`: ASCII letters and digits are kept uppercase, and every other UTF-8 byte is written as `_XX`. For `packages.example.com` the variable is `SEIKO_TOKEN_PACKAGES_2EEXAMPLE_2ECOM`. Tokens are only sent over HTTPS to the index host or to hosts listed in `tokenHosts`. Artifacts on any other host never receive a token, so public or third-party download hosts stay unauthenticated.

## Index layout

```
index.json
sei/
  hosihikari.json
  hello-csharp.json
```

`index.json` lists names for search:

```json
{
  "schemaVersion": 1,
  "generatedBy": "SeiIndex maintainers",
  "sei": ["hello-csharp", "hosihikari"]
}
```

Each `sei/<name>.json` holds every version of that name, with artifacts and dependencies. The format is described in [Publishing a sei](/seiko/publishing/).

Indexes are append-only: new versions are added, old versions are never edited or removed. A version can be retired with `yanked: true` (hidden from new resolutions, still usable for lock replay) or `deprecated` (a migration message).

## Search and inspect

```bash
sk search hosihikari
sk info hosihikari
sk outdated
```

`search`, `info`, and `outdated` read the same sources. `sk info` shows versions, dependencies, yank/deprecated state, and artifact counts.

## Validate an index

```bash
sk index verify . --check-artifacts --strict
```

Without arguments, the command validates the current directory. `--check-artifacts` downloads every artifact and verifies its size, SHA-256, and embedded `sei.json`; `--strict` also fails on warnings. The SeiIndex CI runs the same command before merging a submission.

`--proxy` applies to index and artifact requests. Index responses are cached for the duration of one command; run the command again to see a new index revision.
