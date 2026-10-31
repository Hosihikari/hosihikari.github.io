---
title: Declaration and lock
description: What seiko.conf contains, how versions are expressed, and what seiko.lock.json records.
---

An install root has two Seiko files: `seiko.conf`, the declaration you edit, and `seiko.lock.json`, the resolved result you commit.

## seiko.conf

```hocon
# The official index; remove it or add sources to use other seis.
sources = [
  { id = "official", index = "https://raw.githubusercontent.com/Hosihikari/SeiIndex/main/index.json" }
]

# Optional; defaults to the current platform.
rid = "linux-x64"

sei = [
  { name = "hosihikari" },
  { name = "hello-csharp", version = "[1.0.0,2.0.0)" }
]

components = []
```

| Field | Meaning |
| --- | --- |
| `sources[].id` | Name used by the lock and the resolver; must be unique. |
| `sources[].index` | HTTPS URL of `index.json`, or a local path to the index file (relative paths resolve from the install root). |
| `sources[].tokenHosts` | Extra HTTPS hosts allowed to receive their host-keyed token. |
| `rid` | Target platform written into the lock; defaults to the running platform. |
| `sei[].name` | Direct sei name. |
| `sei[].version` | NuGet version range; omitted or `*` means any stable version. |
| `components[]` | The same shape as `sei`, kept as a separate group for environment packages. |

`components` is only a grouping: entries resolve exactly like `sei` entries, and both are direct declarations. `sk add` writes to `sei` and refuses a name that is already declared in `components`.

`seiko.conf` is HOCON. `#` starts a comment, and quoted strings are usually optional. The file must declare at least one source before resolving.

## Version ranges

| Value | Meaning |
| --- | --- |
| omitted, `*`, `""` | Any stable version. |
| `1.2.3` | 1.2.3 or newer. |
| `[1.2.3]` | Exactly 1.2.3. |
| `[1.0.0,2.0.0)` | 1.0.0 inclusive through 2.0.0 exclusive. |

The resolver prefers the locked version when it still satisfies every constraint, then the highest stable version. Prerelease versions are excluded unless `--pre` is passed or a range names a prerelease explicitly.

## seiko.lock.json

```json
{
  "schemaVersion": 1,
  "target": { "rid": "linux-x64" },
  "sources": ["official"],
  "sei": [
    {
      "name": "hosihikari",
      "version": "1.2.0",
      "source": "official",
      "direct": true,
      "artifact": {
        "sha256": "a65309e97137560672f74998c4895877b85a4a76cb618d173049b75ea5f51afc"
      },
      "dependencies": []
    }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `target.rid` | Platform used to select artifacts. |
| `sources` | Source ids in declaration order. |
| `sei[].source` | The source that provided this sei; replay uses the same source id. |
| `sei[].direct` | Whether this sei is a direct declaration. |
| `sei[].artifact.sha256` | Digest of the selected artifact. |
| `sei[].artifact.selectors` | The selectors that chose the artifact, when any. |
| `sei[].dependencies` | Logical dependencies declared by the sei. |

The lock is deterministic and machine-written. Do not edit it by hand; change `seiko.conf` or run an update instead.

## Replay

- `sk sync --frozen` replays the lock without resolving. The declared direct set must equal the lock's direct entries, and each entry's source, selectors, and dependencies must still match the index.
- `sk sync --locked` resolves normally and fails if the resulting lock differs from the committed one.
- Normal `sk sync` resolves, deploys, and rewrites the lock.

In CI, commit `seiko.conf` and `seiko.lock.json`, run `sk sync --frozen` to deploy the exact reviewed tree, and keep a normal `sk sync` elsewhere to pick up updates.
