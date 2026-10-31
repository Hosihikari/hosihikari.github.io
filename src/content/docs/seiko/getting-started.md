---
title: Getting started
description: Create an install root, add a sei, and replay the lock.
---

An install root is a directory with `seiko.conf`. Everything Seiko deploys stays inside it.

## Create an install root

```bash
mkdir my-root
cd my-root
sk init
sk add hosihikari
```

`sk init` writes a `seiko.conf` template with the official index as source `official` and empty `sei` and `components` lists. It does not resolve or install anything.

`sk add hosihikari` adds a direct declaration and syncs immediately:

```
resolved 1 sei, deployed 29 file(s)
  hosihikari 1.2.0 (direct)
```

Files land according to the artifact's layout. For `hosihikari` they go under `plugins/hosihikari/`; Seiko does not interpret what is there. Valuable output like `manifest.json` is payload, not something Seiko reads.

## Find the root

Most commands accept `--root <path>`. Without it, `sk` walks up from the current directory and uses the nearest directory containing `seiko.conf`, falling back to the current directory. `sk init` always uses the current directory unless `--root` is passed, and refuses to overwrite an existing `seiko.conf`.

## Inspect what you have

```bash
sk list                 # installed sei from the lock
sk why hosihikari       # why it is in the graph
sk outdated             # newer versions in range and overall
sk info hosihikari      # versions, dependencies, artifact count
```

`sk list` reads `seiko.lock.json`, not the configuration, so it also works after the declaration has drifted.

## Keep the lock

`seiko.lock.json` records the exact versions, sources, artifact digests, and selectors that were deployed. Commit it with `seiko.conf`.

```bash
sk sync --frozen        # replay the lock without resolving
sk sync --locked        # resolve, but fail if the lock would change
```

`--frozen` requires the declaration's direct set to match the lock's direct entries; it never rewrites the lock. `--locked` is the CI check: it resolves normally and fails when the result differs from the committed lock. `sk install` is an alias for `sk sync`.

## Change the declaration

```bash
sk add hello-csharp@1.2.0          # direct declaration, range 1.2.0 or newer
sk remove hello-csharp             # remove the declaration and sync
sk update                          # update all direct declarations within their ranges
sk update hosihikari --latest      # pin the direct range to the latest version
sk rollback                        # restore the previous generation
sk rollback --to 1                 # restore a specific generation
```

`sk add`, `sk remove`, `sk update`, and `sk sync` are all deployments: each one writes a new generation, and `sk rollback` can return to an earlier one.

Prerelease versions are skipped unless `--pre` is passed or the declared range itself names a prerelease. Add `--latest-installable` to `sk sync`, `sk add`, or `sk update` to skip versions that have no artifact for the resolved graph; the default remains the highest version. See [Commands](/seiko/commands/) for the options of every command.
