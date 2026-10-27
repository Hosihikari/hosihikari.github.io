---
title: Backup and restore
description: Save the world and the framework state, and put them back.
---

A backup worth keeping has two halves: what the game owns, and what the plugins own.

## What to back up

| Path | What | Changes when |
| --- | --- | --- |
| `worlds/` | Every world, one directory per `level-name` | Continuously while players are online |
| `keys/server_identity_key.pem` | The server's identity key | Once |
| `allowlist.json` | The allow list | On allowlist edits |
| `plugins/` | Plugin packages, including `plugins/hosihikari/` | On install and update |
| `config/hosihikari/` | Server-side configuration overrides | On configuration edits |
| `data/hosihikari/` | Data the framework hands to plugins | While plugins run |

The last three are the framework's. `plugins/` is worth backing up even though it can be reinstalled: the exact package versions on a working server are part of what you are preserving.

## Take one while the server is down

Stop the server, copy the paths above, start it again. This is the only method that cannot catch a half-written world.

## Take one while the server is running

BDS can prepare a consistent copy of the world on demand. In the server console:

```
save hold
save query
```

`save hold` only *asks* the server to prepare; it returns immediately and the preparation runs in the background. Call `save query` repeatedly until it answers with a file list. Until then it reports that preparation is still in progress, and the files are not yet safe to copy.

The successful `save query` answer lists every file to copy and the length of each one. Copy exactly those files — not the whole `worlds/` directory — and **truncate each copied file to the length the server gave**. The server keeps running during the copy, so a file can grow while you read it; the truncation is what makes the copy match the snapshot.

When the copy is finished, release the hold:

```
save resume
```

Then copy the framework paths normally. They are plain directories and are not covered by the world flush.

## Restore

1. Stop the server.
2. Replace `worlds/`, `keys/`, and `allowlist.json` with the copies.
3. Replace `plugins/`, `config/hosihikari/`, and `data/hosihikari/`.
4. Start the server and check the log for the framework taking over and for the plugin list.

Restoring an older `plugins/` alongside a newer framework is the usual cause of a plugin being refused on `api_version`. Restore the framework and plugins from the same date.

## What a backup does not cover

- The BDS binary and its own files. Keep the server archive you installed from.
- The .NET runtime. Reinstall it rather than copying it.
- Anything a plugin writes outside `data/hosihikari/`. That path is the contract; a plugin that writes elsewhere is outside it, and you would need to know that plugin's layout.
