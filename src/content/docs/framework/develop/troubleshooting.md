---
title: Troubleshooting
description: Common errors and where to look.
---

## The log reports `apiVersion mismatch` or `schemaVersion mismatch`

The plugin was built against another contract. The current contract is `apiVersion` 3 and manifest `schemaVersion` 1; rebuild with Hosihikari.Plugin.Abstractions 3.0.0. Editing the number in the manifest does not change the type surface.

## The log reports `legacy package (manifest.json only, ...)`

The package is a 1.x package. Run the `hosihikari-pack migrate` command the line prints, then rebuild and repack; see [Migrate from 1.x to 2.0](/framework/migrate/v2/).

## The log reports the manifest still uses an old field

The reader stopped accepting the 1.x key names: `extraInfo.api` becomes `extraInfo.api_version`, `extraInfo.provider` becomes `loader`, and `extraInfo.format_version` becomes `manifest_version`. In `hosihikari.json` everything is top-level except the pack settings, which belong under `pack`; `extraInfo.api_version` and `extraInfo.manifest_version` alone still parse as a fallback.

## The log reports `no loader handles loader=...`

The matching loader is not installed or not enabled, or the plugin does not depend on it. Source plugins install the C# loader / F# loader package and list `hosihikari-csharp` / `hosihikari-fsharp` in `dependencies`; out-of-process plugins install the RPC loader and list `hosihikari-rpc`.

## The log reports `manifest name must equal the directory name`

The directory name and `name` must match exactly; rename one of them.

## The log reports `entry must be a relative path inside the package`

`entry` must point inside the package; remove absolute paths and `..`.

## The plugin loads but receives no events or timers before enable

The framework opens the scope gate after a successful `OnEnable`. Periodic work registered in `OnLoad` starts receiving callbacks only after enable; start periodic work in `OnEnable`.

## Configuration does not take effect

- The package default is `<name>.conf`, matching the plugin name.
- The server override is `config/hosihikari/<name>.conf`.
- Environment variables override the same keys; key matching is case-insensitive.
- Layering goes through the framework's provider chain; HOCON `include` does not apply.

## Where does data go?

`data/hosihikari/<name>/`. `ctx.DataDirectory` (Node/Python) or `context.DataDirectory` (.NET) points there.

## An out-of-process plugin does not start

- The executable is not on `PATH`: the log shows a spawn failure or the process exits immediately.
- Endstone: the CLI replaces the child `PATH`; use an absolute path in `pack.command`.
- The plugin writes non-protocol output to stdout: stdout carries JSON-RPC; logs go to stderr or `logInfo`.
- The protocol definition was copied from a 1.x loader: the handshake protocol is version 2, so a stale definition fails `hello`.

## Nothing is reclaimed after unload

- Static fields, singletons, and raw threads keep the ALC alive; stop threads, unsubscribe, and clear references in `OnUnload`.
- Native libraries live for the process; unload reclaims the managed ALC only.
- The framework reclaims its own event subscriptions and timers; plugin-owned resources are the plugin's job.
- A hook that ignores the token only reaches the hook timeout; it does not by itself block reclamation. The unload report says which stage failed.
