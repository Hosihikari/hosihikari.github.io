---
title: Store and deployment
description: Where artifacts live, how payloads reach the install root, and how rollback works.
---

Seiko separates downloading from deploying. Artifacts are unpacked once into a shared, content-addressed store; each install root then links or copies the payload files it needs.

## The store

| Platform | Default store |
| --- | --- |
| Windows | `%LOCALAPPDATA%\seiko\store` |
| Linux, macOS | `~/.cache/seiko` |

Set `SEIKO_STORE` to change it globally, or pass `--store <path>` to a command. Several install roots can share one store.

An artifact is stored under its SHA-256. The store also keeps:

| Path | Purpose |
| --- | --- |
| `<sha>/` | The extracted artifact |
| `.meta/<sha>.json` | Per-file digests recorded at extraction |
| `.partial/` | Incomplete downloads, resumable across processes |
| `.locks/` | Per-artifact download locks |

Downloads use a global request budget (`--jobs`, default 4), retries with backoff, and Range chunks for large files when the server supports them. An interrupted download resumes from `.partial` on the next run.

Seiko extracts zip artifacts. The store is content-addressed, so an artifact that changes upstream is a different store entry. If a digest record or payload file is missing or corrupt, `sk sync` replaces the artifact under its lock and downloads it again; `sk cache verify` only reports.

Extraction is bounded: at most 100,000 entries, 1 GiB per entry, and 4 GiB in total. Artifacts that exceed a limit are rejected and their temporary files are removed.

## Deployment

For each resolved sei, Seiko reads the artifact's `sei.json`, selects the matching artifact for the root's `rid`, and deploys its payload according to `layout` (`root` means paths are relative to the install root). The artifact's `sei.json` and a package-root `tooth.json` are not deployed.

Payload files are placed with the cheapest available mechanism, in this order:

1. **Reflink** on filesystems that support it (APFS, btrfs, XFS).
2. **Hardlink** when source and target are on the same volume.
3. **Copy** otherwise.

Reflinked and hardlinked files share storage with the store. Reflink writes are copy-on-write: editing a deployed file leaves the store unchanged. A hardlinked edit does change the store, and the next `sk sync` or `sk cache verify` rejects the artifact. Do not edit deployed payload files in place; change the source package and publish a new version instead.

Unix modes from `sei.json` are applied after deployment; Windows ignores them. Only `0000–0777` is accepted: setuid, setgid, and sticky bits are rejected before files change. Seiko refuses to write through symlinks or reparse points, and reserves the control paths `seiko.conf`, `seiko.lock.json`, and `.seiko/` for itself.

## Generations and rollback

Every deployment records a generation inside the root:

```
.seiko/
  state.json
  generations/
    1/
      state.json
      lock.json
  installed/
    hosihikari/1.2.0/sei.json
```

`sk rollback` restores the previous generation; `sk rollback --to <n>` restores a specific one. If the target generation's artifacts are missing or corrupt, rollback downloads them again from the configured sources (`--proxy` is supported). `sk cache clean` keeps artifacts referenced by retained generations.

A deployment is transactional: files, state, lock, and the generation directory are written through a journal, and a failure restores the previous deployment. If a run is interrupted, the next command recovers or discards the unfinished transaction before doing anything else.

## Cache maintenance

```bash
sk cache status        # artifact and partial counts
sk cache verify        # re-hash stored payload files
sk cache clean         # drop unreferenced artifacts
```

`cache clean` holds the registry lock and the install locks of every registered root, so it never removes an artifact that any root's current lock or retained rollback generations still need.

## Doctor

```bash
sk doctor
sk doctor --clean
```

`doctor` checks that the lock matches the declaration, that the store still has the referenced artifacts, that the deployment state is consistent, and whether partial downloads are lying around. `--clean` removes all partial downloads. See [Troubleshooting](/seiko/troubleshooting/) for the error codes.
