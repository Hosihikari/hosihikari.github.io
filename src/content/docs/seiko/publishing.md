---
title: Publishing a sei
description: Package an artifact and submit its version to the official index.
---

A sei is a zip whose root contains `sei.json` and the payload. Publishing means hosting that zip at a stable URL and submitting a matching version entry to an index.

## Build the artifact

```
hello-csharp.zip
  sei.json
  plugins/hello-csharp/manifest.json
  plugins/hello-csharp/main.cs
  plugins/hello-csharp/start.sh
```

The zip root must contain exactly one `sei.json`. Everything else is payload; paths are deployed relative to the install root, so a payload path `plugins/hello-csharp/manifest.json` becomes `<root>/plugins/hello-csharp/manifest.json`. Seiko does not read `manifest.json`; it belongs to whatever loads the plugin. For the Hosihikari Framework's plugin package contract, see [Plugin packages](/framework/develop/plugin-package/).

`sei.json` describes the package:

```json
{
  "schemaVersion": 1,
  "name": "hello-csharp",
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari", "version": "[1.1.0,1.2.0)" }
  ],
  "layout": "root",
  "modes": { "plugins/hello-csharp/start.sh": "0755" }
}
```

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Currently `1`. |
| `name` | Sei name; must match the index file and be path-safe. |
| `version` | NuGet SemVer version. Pre-releases use a suffix such as `1.3.0-beta.1`. |
| `dependencies` | Names with optional version ranges; resolved by the same rules as declarations. |
| `selectors` | Optional artifact selection; see below. |
| `layout` | `root` (or omitted). Only root layout is supported. |
| `modes` | Optional map of payload path to Unix mode; Windows ignores it. |

## Selectors

A version may publish several artifacts, each with a different `selectors` object:

- `rid` matches the target platform, such as `win-x64` or `linux-arm64`.
- Any other key names a sei that must be present in the dependency graph. For example, `{ "carrier": "levilamina" }` matches when a sei named `levilamina` is in the graph.
- All pairs must match. Among matching artifacts, the one with the most selector keys wins; equal specificity is an ambiguity error.

Omit `selectors` for a platform-independent artifact. Two artifacts in one version cannot have identical selectors.

## Host the artifact

Put the zip on a stable, public HTTPS URL. A GitHub Release asset pinned to a tag is the simplest choice; object storage and static sites work too. The URL must stay downloadable for as long as the version exists, because index validation and every future install fetch it again.

## Write the index entry

The index keeps one file per name. A version entry looks like this:

```json
{
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari", "version": "[1.1.0,1.2.0)" }
  ],
  "artifacts": [
    {
      "layout": "root",
      "source": {
        "url": "https://github.com/example/hello-csharp/releases/download/v1.0.0/hello-csharp.zip",
        "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "size": 12345
      }
    }
  ]
}
```

`sha256` is the digest of the exact zip, 64 lowercase hexadecimal characters; `size` is its byte length. The entry's `version`, `dependencies`, `selectors`, and `layout` must match the embedded `sei.json`; CI downloads the artifact and checks both, so a mismatch is rejected.

## Submit to the official index

The official index is [Hosihikari/SeiIndex](https://github.com/Hosihikari/SeiIndex). Submit through its issue form, not a pull request:

1. Open https://github.com/Hosihikari/SeiIndex/issues/new?template=sei-submission.yml.
2. Enter the sei name and the complete version entry JSON.
3. An account with write access to SeiIndex is processed automatically; other authors need a maintainer to add the `index-submission` label.

The index bot appends the entry, opens a pull request, approves the validation run GitHub holds for it, and enables auto-merge. The pull request merges only when validation passes, and the bot closes the issue after the merge. Validation downloads every artifact, checks its size and SHA-256, and compares the embedded `sei.json`.

Before submitting, run the same check locally against a checkout of the index:

```bash
sk index verify . --check-artifacts --strict
```

## Rules

- **Versions are immutable.** Add new versions; never edit or delete an existing one.
- **Only `yanked` and `deprecated` may change** in an existing version. `yanked: true` hides it from new resolutions but keeps lock replay working; `deprecated` is a human-readable migration message.
- **Never delete a sei or a version.** Yanking or deprecating is the retirement path.
- **The name list in `index.json` may only grow.**

The same layout works for a private index; Seiko only needs an HTTPS URL or a local directory and the same `sei/<name>.json` files.
