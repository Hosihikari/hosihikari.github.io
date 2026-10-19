---
title: Troubleshooting
description: Common errors and where to look.
---

## The log reports `api 不匹配` or `format_version 不匹配`

The plugin was built against another contract. The current contract is `api` 2 and manifest `format_version` 1; rebuild with Abstractions 0.7.0. Editing the number in the manifest does not change the type surface.

## The log reports `没有能处理 provider=... 的 Provider`

The matching provider is not installed or not enabled, or the plugin does not depend on it. Source plugins install `CSharpProvider` / `FSharpProvider` and list `hosihikari-csharp` / `hosihikari-fsharp` in `dependencies`; the RPC exception installs `RpcProvider` and lists `hosihikari-rpc`.

## The log reports `清单 name 必须等于目录名`

The directory name and `name` must match exactly; rename one of them.

## The log reports `entry 必须是包内相对路径`

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

## The out-of-process bridge (the exception) does not start

- The executable is not on `PATH`: the log shows a spawn failure or the process exits immediately.
- Endstone: the CLI replaces the child `PATH`; use an absolute path in `command`.
- The plugin writes non-protocol output to stdout: stdout carries JSON-RPC; logs go to stderr or `logInfo`.

## Nothing is reclaimed after unload

- Static fields, singletons, and raw threads keep the ALC alive; stop threads, unsubscribe, and clear references in `OnUnload`.
- Native libraries live for the process; unload reclaims the managed ALC only.
- The framework reclaims its own event subscriptions and timers; plugin-owned resources are the plugin's job.
