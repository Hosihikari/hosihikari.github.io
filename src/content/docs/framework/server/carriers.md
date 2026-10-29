---
title: Choosing a carrier
description: The three carrier environments the framework supports, and what each one costs.
---

A **carrier** is a concrete runtime environment, fixed by three components: the platform, the parent plugin loader (none in the self-hosted case), and the native API provider — LLAPI for LeviLamina, the Endstone API for Endstone, and MCAPI for the self-hosted BDS 1.21.3. The framework depends only on the platform and the parent loader; the native API side comes from the projection. Pick the carrier before you install anything; the install steps differ per carrier and are not interchangeable.

| Carrier | Platform | Parent | BDS |
| --- | --- | --- | --- |
| [LeviLamina](/framework/server/install/levilamina/) | Windows x64 | LeviLamina | 1.26.51+ with LeviLamina 26.51+ |
| [Endstone](/framework/server/install/endstone/) | Windows x64, Linux x64 | Endstone | 1.26.52+ with Endstone 0.11+ |
| [Self-hosted](/framework/server/install/selfhosted/) | Linux x64 | none | 1.21.3 |

## Parented or self-hosted

Under **LeviLamina** or **Endstone**, the framework is a plugin manager inside someone else's plugin system. The parent discovers, enables, disables, and unloads us; we pass those calls to the plugins we manage. This is the choice when you already run that loader, and it is the only choice on Windows.

The **self-hosted** carrier has no parent: the framework is the outermost plugin system. It is the only carrier that runs on stock BDS without a third-party loader, and it is also the most constrained one:

- The launcher runs one BDS version, 1.21.3.
- The server needs the **.NET 10 runtime** installed. So do the parented carriers — the runtime lookup lives in shared native code — but under a parent it is easy to overlook.
- There is no runtime enable or disable yet. A plugin package under `plugins/` loads and enables before the server's `main`; today "disabling" it means moving the package out and restarting. Plugin management commands are planned on top of the projection's command MCAPI and the plugin manager API; until they land, that is the only way. Under a parent, the parent's own registry drives enable and disable, and those calls work normally.

## What decides it

- **You already run LeviLamina or Endstone.** Use that carrier; nothing else is supported for it.
- **Windows without a loader.** LeviLamina and Endstone are both options; both are Windows x64.
- **Linux without a loader, BDS 1.21.3.** Self-hosted.
- **Linux without a loader, newer BDS.** Use the Endstone carrier.

## What a carrier does not change

Plugin packages are identical on every carrier: a directory under `plugins/` with a `manifest.json`. The plugin contract, the lifecycle, and the isolation model are the same. Moving a plugin package between carriers does not need a rebuild.

The plugin manager itself is installed as a lip dependency of the carrier package; you do not install it separately.
