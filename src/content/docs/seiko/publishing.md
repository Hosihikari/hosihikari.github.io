---
title: Publishing a sei
description: Package an artifact and submit its version to the official index.
---

A sei is a zip whose root contains `sei.json` and the payload. Publishing means hosting that zip at a stable URL and submitting a matching version entry to an index.

## Build the artifact

```
hello-seiko.zip
  sei.json
  plugins/hello-seiko/manifest.json
  plugins/hello-seiko/main.cs
  plugins/hello-seiko/start.sh
```

The zip root must contain exactly one `sei.json`. Everything else is payload; paths are deployed relative to the install root, so a payload path `plugins/hello-seiko/manifest.json` becomes `<root>/plugins/hello-seiko/manifest.json`. Seiko does not read `manifest.json`; it belongs to whatever loads the plugin. For the Hosihikari Framework's plugin package contract, see [Plugin packages](/framework/develop/plugin-package/).

Artifacts are bounded: at most 100,000 entries, 1 GiB per entry, and 4 GiB in total.

`sei.json` describes the package:

```json
{
  "schemaVersion": 2,
  "name": "hello-seiko",
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari", "version": "[1.1.0,1.2.0)" }
  ],
  "prerequisites": [],
  "optionalPeers": [],
  "conflicts": [],
  "artifact": {
    "rid": "linux-x64",
    "dependencies": [],
    "prerequisites": [],
    "optionalPeers": [],
    "conflicts": [],
    "layout": "root",
    "modes": { "plugins/hello-seiko/start.sh": "0755" }
  }
}
```

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Must be `2` in 0.3. |
| `name` | Sei name; must match the index file and be path-safe. |
| `version` | NuGet SemVer version. Pre-releases use a suffix such as `1.3.0-beta.1`. |
| `dependencies` | Names with optional version ranges; resolved by the same rules as declarations. |
| `prerequisites`, `optionalPeers`, `conflicts` | The other version-level relations; see [Relations](/seiko/publishing/#relations). |
| `artifact` | The current artifact only: `rid`, its own relations, `layout`, and `modes`. |

## Relations

The version-level relations constrain the whole version; the same fields inside `artifact` constrain only that artifact. Both scopes apply together.

| Field | Meaning |
| --- | --- |
| `dependencies` | Must be installed; the target joins the graph. |
| `prerequisites` | Must already be in the graph; does not add it. Used to select artifacts. |
| `optionalPeers` | May be absent; when present its version must match. |
| `conflicts` | A matching target may not be present. |

An artifact is chosen by `rid` plus its `prerequisites`: an artifact whose prerequisites are not satisfied cannot be selected. Among selectable artifacts, the one with the most satisfied prerequisites wins; equal specificity is an ambiguity error. Because `prerequisites` do not add anything, the sei naming the condition must be declared or pulled in by a dependency.

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
  "prerequisites": [],
  "optionalPeers": [],
  "conflicts": [],
  "artifacts": [
    {
      "rid": "linux-x64",
      "dependencies": [],
      "prerequisites": [
        { "name": "hosihikari-hosting-levilamina", "version": "*" }
      ],
      "optionalPeers": [],
      "conflicts": [],
      "layout": "root",
      "source": {
        "url": "https://github.com/example/hello-seiko/releases/download/v1.0.0/hello-seiko.zip",
        "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "size": 12345
      }
    }
  ]
}
```

`sha256` is the digest of the exact zip, 64 lowercase hexadecimal characters; `size` is its byte length. The entry's relations, `rid`, `layout`, and `modes` must match the embedded `sei.json`; CI downloads the artifact and checks both, so a mismatch is rejected.

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

## Retirement fields

A version entry may carry:

```json
{
  "version": "1.2.3",
  "yanked": true,
  "deprecated": "use 2.x instead",
  "advisory": { "severity": "critical", "url": "https://example.com/advisories/1" }
}
```

- `yanked` hides the version from new resolution; lock replay still works.
- `deprecated` is shown when the version is selected or queried.
- `advisory.severity` is `low`, `moderate`, `high`, or `critical`. A `critical` version is skipped by new resolution unless the user passes `--allow-critical`; lock replay is allowed and warns.

A sei file may also carry `unlisted: true`, which hides it from `sk search` while keeping direct resolution and lock replay working, and a package-level `deprecated` message inherited by versions that do not set their own.

## Rules

- **Versions are immutable.** Add new versions; never edit or delete an existing one.
- **Only `yanked`, `deprecated`, and `advisory` may change** in an existing version. Package-level `unlisted` and `deprecated` may also change. `yanked: true` hides it from new resolutions but keeps lock replay working; `deprecated` is a human-readable migration message.
- **Never delete a sei or a version.** Yanking or deprecating is the retirement path.
- **The name list in `index.json` may only grow.**

The same layout works for a private index; Seiko only needs an HTTPS URL or a local directory and the same `sei/<name>.json` files.
