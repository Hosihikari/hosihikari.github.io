---
title: Commands
description: The sk command surface, its options, and its machine-readable output.
---

Every command runs against one install root and one store. `sk --help` lists the commands, and `sk <command> --help` lists the options for one command.

## Global options

| Option | Meaning |
| --- | --- |
| `--json` | Emit a single JSON document on stdout. |
| `-v`, `--verbose` | Show debug logs and full stack traces. |
| `-q`, `--quiet` | Suppress progress and non-error output. |

Progress bars appear only when stdout is an interactive terminal, and never with `--json`.

## Common options

| Option | Commands | Meaning |
| --- | --- | --- |
| `--root <path>` | most | Install root. Defaults to the nearest `seiko.conf` above the current directory. |
| `--store <path>` | deployment and cache | Store directory. Defaults to `SEIKO_STORE`, then the platform store path. |
| `--proxy <url>` | network commands | HTTP proxy. Defaults to the system proxy. |
| `--jobs <n>` | `sync`, `add`, `remove`, `update` | Maximum concurrent HTTP requests; default 4. |
| `--pre` | resolution commands | Allow prerelease versions. |
| `--latest-installable` | `sync`, `add`, `update` | Skip versions with no artifact for the resolved graph; the default is the highest version. |
| `--allow-critical` | `sync`, `add`, `remove`, `update` | Allow resolving versions with a critical advisory; otherwise they are skipped with a warning. |

## Lifecycle

### `sk init [--root <path>]`

Write a `seiko.conf` template with the official index and empty `sei` and `components` lists. Refuses to overwrite an existing file.

### `sk sync [options]`

Resolve the declaration and deploy it. Alias: `sk install`.

| Option | Meaning |
| --- | --- |
| `--frozen` | Replay `seiko.lock.json` without resolving; the declared direct set must match the lock. |
| `--locked` | Resolve, but fail if the result differs from the existing lock. |
| `--pre` | Allow prerelease versions. |
| `--latest-installable` | Skip versions without a matching artifact; incompatible with `--frozen`. |
| `--allow-critical` | Allow resolving versions with a critical advisory. |

`--frozen` and `--locked` are mutually exclusive. `--frozen` does not rewrite the lock.

`sync`, `add`, and `update` print warnings when they select a deprecated version or replay a locked yanked or critical version. They also warn when a critical version matches the requested range but is skipped; skipped yanked versions stay silent. `--json` carries the same messages in `data.warnings`.

### `sk add <name[@range]>`

Add a direct declaration to `sei` and sync. A bare `1.2.0` means 1.2.0 or newer; use `[1.2.0]` to pin exactly. `--latest-installable` applies to the sync; `--allow-critical` permits a version with a critical advisory.

### `sk remove <name>`

Remove a direct declaration from `sei` or `components` and sync the rest.

### `sk update [name] [--latest]`

Re-resolve direct declarations, preferring newer versions within their ranges. With `name`, only that declaration; without, all of them. `--latest` rewrites the selected direct ranges to the latest version (`[x.y.z]`); `--latest-installable` skips versions with no matching artifact; `--allow-critical` permits a version with a critical advisory.

### `sk rollback [--to <generation>] [--proxy <url>]`

Restore the previous deployment generation, or the one named by `--to`. Generations are recorded under `.seiko/generations/`. If the target generation's artifacts are missing or corrupt, rollback downloads them again from the configured sources.

## Inspect

| Command | Meaning |
| --- | --- |
| `sk list` | Installed sei from the lock. |
| `sk why <name>` | Dependency chains that bring a sei into the graph. |
| `sk outdated [--pre]` | Newer versions in range, overall, and latest installable. |
| `sk search <term>` | Search sei names in the configured indexes. |
| `sk info <name>` | Versions, dependencies, and artifact counts for one sei. |
| `sk doctor [--clean]` | Check the lock, store, deployment, and partial downloads; `--clean` deletes all partial downloads. |

## Sources and configuration

| Command | Meaning |
| --- | --- |
| `sk source list` | Sources in declaration order. |
| `sk source add <id> <index> [--token-host <host>]...` | Append a source; `--token-host` is repeatable. Private-source tokens come from `SEIKO_TOKEN_<HOST>`. |
| `sk source remove <id>` | Remove a source. |
| `sk config get <key>` | Read `rid`. |
| `sk config set <key> <value>` | Write a value; an empty value removes the key. |

`config` currently exposes `rid`. Sources are stored in `seiko.conf` and edited in place.

## Store

| Command | Meaning |
| --- | --- |
| `sk cache status` | Artifact and partial-download counts. |
| `sk cache verify` | Verify stored payload files against their digests. |
| `sk cache clean` | Remove artifacts not referenced by any registered install root's lock or its retained rollback generations. |

`cache clean` needs a root only to resolve the store; it protects every registered root, not just the one passed. Sync and rollback re-download artifacts whose digest metadata or payload is missing or corrupt; `cache verify` only reports.

## Index authoring

```bash
sk index verify [path] [--check-artifacts] [--strict] [--proxy <url>]
```

Validates an index directory: schema, names, versions, artifact URLs, and SHA-256 values. `--check-artifacts` also downloads every artifact and checks its size, digest, and embedded `sei.json`; `--strict` treats warnings as errors. The path defaults to the current directory. Append-only changes are checked by the index repository's CI, not by this command.

## Version ranges

Declarations and dependencies use NuGet SemVer ranges.

| Range | Meaning |
| --- | --- |
| omitted, `*`, or `""` | Any stable version. |
| `1.2.3` | 1.2.3 or newer. |
| `[1.2.3]` | Exactly 1.2.3. |
| `[1.0.0,2.0.0)` | 1.0.0 inclusive through 2.0.0 exclusive. |

Prerelease versions are excluded unless `--pre` is passed or the range itself names a prerelease, such as `[1.2.0-beta,2.0.0)`.

## Exit codes and JSON

| Exit | Meaning |
| --- | --- |
| `0` | Success. |
| `1` | Runtime failure. |
| `2` | Usage error. |

`--json` emits `{"schemaVersion":1,"command":"...","data":...}` on success and `{"schemaVersion":1,"command":"...","error":{"code":"...","message":"..."}}` on failure. Error codes are `usage`, `config`, `source`, `resolve`, `download`, `checksum`, `deploy`, `lock`, `io`, and `internal`; see [Troubleshooting](/seiko/troubleshooting/).
