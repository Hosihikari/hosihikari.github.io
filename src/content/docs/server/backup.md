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

The last three are the framework's. `plugins/` is worth backing up even though it can be reinstalled:
the exact package versions on a working server are part of what you are preserving.

## Take one while the server is down

Stop the server, copy the paths above, start it again. This is the only method that cannot catch a
half-written world.

## Take one while the server is running

BDS can flush the world on demand. In the server console:

```
save hold
save query
save resume
```

`save hold` pauses world writes and lets you copy; `save query` reports which files are safe and their
lengths; `save resume` releases the hold. Copy `worlds/` between `hold` and `resume`, then copy the
framework paths normally — they are plain directories and are not covered by the world flush.

## Restore

1. Stop the server.
2. Replace `worlds/`, `keys/`, and `allowlist.json` with the copies.
3. Replace `plugins/`, `config/hosihikari/`, and `data/hosihikari/`.
4. Start the server and check the log for the framework taking over and for the plugin list.

Restoring an older `plugins/` alongside a newer framework is the usual cause of a plugin being
refused on `api_version`. Restore the framework and plugins from the same date.

## What a backup does not cover

- The BDS binary and its own files. Keep the server archive you installed from.
- The .NET runtime. Reinstall it rather than copying it.
- Anything a plugin writes outside `data/hosihikari/`. That path is the contract; a plugin that writes
  elsewhere is outside it, and you would need to know that plugin's layout.
