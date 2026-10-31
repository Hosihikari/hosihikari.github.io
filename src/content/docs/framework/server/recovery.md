---
title: Recovery
description: Read the logs, rule plugins out, and report what broke.
---

Start with the carrier's log, then remove plugins until the server comes up.

## Where the logs are

| Carrier | Log | Crash data |
| --- | --- | --- |
| LeviLamina | `logs/latest.log` | `logs/crash/` — `trace_*.log` and `minidump_*.dmp` |
| Endstone | `logs/latest.log`, plus rotated `logs/YYYY-MM-DD-N.log.gz` | `.sentry-native/` |
| Self-hosted | The launcher's output, and the server's own log | — |

Under LeviLamina the log is shared: server lines and framework lines land in the same file. Under Endstone the rotation limit is 1000 files; under LeviLamina it is configured in `plugins/LeviLamina/config/Config.json`.

## The framework did not start

The startup sequence reports its result, and the carrier writes it to the log rather than exiting the process. Look for a hex code:

| Code in the log | Meaning |
| --- | --- |
| `0xFFFFFFFE` | The plugin manager is missing the hosting-contract entry point. |
| `0xFFFFFFFD` | The hosting-contract version of the carrier and the plugin manager do not match. |

These are the return values `-2` and `-3` printed as unsigned. Neither is a process exit code: the server keeps running, with the framework absent. Fix the mismatch — usually a half-finished update — and restart. See [Updating](/framework/server/updating/).

A missing .NET 10 runtime fails earlier and differently: the runtime lookup returns its own error before any of the above.

## A plugin did not load

The plugin manager reports each package it refused and why. The common causes:

- **The directory name and the manifest `name` disagree.** They must be equal.
- **A declared dependency is absent.** The plugin is skipped, not loaded partially.
- **`api_version` is not compatible** with this framework line.
- **No loader claims the package.** A source plugin needs its loader package installed; under a parent this is the most common reason a package from another server does not run.

## Rule plugins out

When the server will not start and you do not know which plugin is responsible, take them all out:

1. Stop the server.
2. Move the plugin directories under `plugins/` somewhere else, but keep the infrastructure:
   - always keep `plugins/hosihikari/` — that is the framework itself;
   - under LeviLamina also keep `plugins/LeviLamina/` — that is the parent loader, installed into the same folder;
   - under Endstone the parent is not under `plugins/`, so nothing else needs keeping.
3. Start the server. If it comes up, the framework is fine and one of the packages is the problem.
4. Move packages back in halves, restarting between rounds, until the server fails. The last batch contains the culprit.
5. Leave the culprit out and report it.

Removing the parent loader along with the plugins cannot tell you anything: without a parent there is nothing to activate the framework, and the server fails for a reason that has nothing to do with the plugins. This works on every carrier. Self-hosted has no runtime enable or disable yet, so a restart per round is required there too — the same procedure applies.

## A plugin will not unload

Unload is verified: the framework asks the loader to confirm the assembly load context was reclaimed, and waits up to 30 seconds by default. If the wait times out, the unload is recorded as a failure and the plugin stays in the `Detached` slot — it is not reported as gone. Common causes are static state, live threads, and references the plugin kept in `OnUnload`. See [Plugin packages](/framework/develop/plugin-package/).

## What to include in a report

- The release tags of the framework and loaders, and each plugin's manifest `version`.
- The carrier and the BDS version.
- The log lines around the failure, from `logs/latest.log`.
- Any crash files from the paths above.
- What you changed just before it broke — an update, a new plugin, a configuration edit.

Remove server IPs, player names, and world data before posting. Report a vulnerability through the private form in the owning repository, not a public issue; see the repository's security policy.
