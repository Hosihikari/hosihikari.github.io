---
title: Troubleshooting
description: Read Seiko errors, inspect a root, and recover a damaged store or deployment.
---

Start with `sk doctor`. It checks the declaration, lock, store, deployment state, and partial downloads, and prints a finding code for anything that needs attention. `--clean` removes leftover partial downloads.

## Error codes

Every `sk` failure carries one of these codes; with `--json` it is in `error.code`.

| Code | Typical cause | What to do |
| --- | --- | --- |
| `usage` | Bad arguments or an invalid version range. | Check `sk <command> --help`. |
| `config` | Missing or invalid `seiko.conf`, or a source without `id`/`index`. | Run `sk init` or fix the file. |
| `source` | Index missing, invalid, or an HTTP failure while reading it. | Check the source path/URL and credentials. |
| `resolve` | No version satisfies the graph, or a version conflict. | Inspect with `sk why` and `sk info`; loosen a range. |
| `download` | Network or HTTP failure while fetching an artifact. | Retry, set `--proxy`, or lower `--jobs`. |
| `checksum` | Artifact bytes do not match the recorded SHA-256 or store digest. | See “Corrupted store” below. |
| `deploy` | Unsafe path, symlink, invalid mode, or a failed transaction. | Remove the offending path; inspect `.seiko/` state. |
| `lock` | Lock missing, out of date, or inconsistent with the declaration. | Run a normal `sk sync`, or restore the expected source. |
| `io` | Filesystem or process-lock failure. | Check permissions, free space, and other running `sk` processes. |
| `internal` | Unexpected failure. | Re-run with `-v` and report the stack trace. |

## Common cases

### “missing seiko.conf; run `sk init` or pass `--root`”

You are outside an install root. Run `sk init` in the directory you want, or pass `--root <path>`. Commands search upward from the current directory for the nearest `seiko.conf`.

### A sei is not found

Confirm the name exists in one of the configured indexes with `sk search <term>`. Sources are tried in order and the first one containing the name provides all its versions; a later source cannot fill in a name the first source already has. Private sources also need their token environment variable set.

### Versions do not resolve

`sk why <name>` shows the chains that put a sei in the graph, and `sk info <name>` shows available versions and dependencies. The usual fixes are widening a range in `seiko.conf`, updating a dependency, or allowing a prerelease with `--pre` when the range does not already name one.

### `--frozen` fails

`--frozen` requires `seiko.lock.json`, requires the declared direct set to equal the lock's direct entries, and replays each sei from the source id recorded in the lock. If a direct sei was added, removed, or the source was renamed, run a normal `sk sync` to write a new lock. Commit the lock with the declaration.

### `--locked` says the lock is out of date

The resolver produced a different lock than the committed one. Run `sk sync` to review and accept the update, then commit `seiko.lock.json`. Keep `--locked` in CI so an uncommitted change fails instead of slipping through.

### Corrupted store

`sk cache verify` re-hashes stored payload files; `sk doctor` reports store findings. If one artifact is damaged, remove that artifact's directory (named by its SHA-256) from the store and run `sk sync --frozen`; Seiko downloads it again. `sk cache clean` only removes artifacts no root references, so it will not repair a damaged artifact that the lock still needs.

### Deployed files changed

Do not edit deployed payload files in place. On a reflink or hardlink deployment, an edit also changes the shared store, and the next sync or `sk cache verify` rejects it. Change the source package, publish a new version, and sync again. If a file was changed accidentally, remove the artifact from the store and replay the lock.

### Unsafe path or symlink errors

Seiko refuses to write through symlinks or reparse points and reserves `seiko.conf`, `seiko.lock.json`, and `.seiko/` for itself. Remove the symlink or conflicting file from the install root and retry. An artifact that tries to deploy outside the root is invalid; fix the package instead of the root.

### Interrupted downloads

Partial files live under `<store>/.partial` and resume automatically. `sk doctor` reports them; `sk doctor --clean` deletes them. A proxy can be passed per command with `--proxy`, and concurrency can be lowered with `--jobs`.

### Rollback failed

`sk rollback` needs the artifacts of the target generation to still exist in the store. If `cache clean` ran from another root, a retained generation may have lost its payload; run `sk sync --frozen` at the current lock or publish the missing artifact again. Check what generations exist under `.seiko/generations/`.

## Reporting a bug

Run the failing command with `-v` and include the command, `sk --version`, `sk doctor` output, and the relevant part of `seiko.conf` with credentials removed. File issues at [Hosihikari/Seiko](https://github.com/Hosihikari/Seiko/issues).
