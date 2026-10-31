---
title: Updating and rolling back
description: Move to a new release, and get back if it goes wrong.
---

Pieces update independently: the carrier, the plugin manager, the loaders, and the plugin packages. Each is a release archive extracted into the server root. Keep the release tags you installed; the framework does not write a lock file.

## Check what you have

The version of each piece is the release tag you downloaded. Record them before an update:

- the HostingShim release tag for the carrier,
- the PluginManager release tag for the core,
- the loader release tags,
- the plugin packages under `plugins/<name>/`.

## Update

Stop the server, then download the new archives and extract them over the server root, replacing the old files:

- `hosihikari-<carrier>-<platform>-x64.zip` from the [HostingShim releases](https://github.com/HosihikariFramework/HostingShim/releases),
- `hosihikari-core-<version>.zip` from the [Core releases](https://github.com/HosihikariFramework/PluginManager/releases),
- the loader archives from their own releases.

Restart and confirm the log shows the framework taking over.

## Pin a version, or go back

Download the release archive of the version that worked and extract it over the same paths. This is the rollback path. Restart and confirm the log shows the framework taking over again.

## What needs a restart

Everything the framework loads runs inside the server process:

- **The carrier and the plugin manager.** Restart.
- **Loader packages.** They cannot be unloaded at runtime; disabling or upgrading one means a restart.
- **Plugin packages.** Under a parent, the parent can disable, enable, and unload plugins at runtime. Self-hosted has no runtime enable or disable yet: move the package out of `plugins/` and restart. Plugin management commands are planned; until then this is the only path.

## Check compatibility before you update

The release page lists which versions were published together. Two numbers do the actual work:

- **Hosting contract version.** The native carrier and the plugin manager check each other before starting. A mismatch stops the startup sequence; see [Recovery](/framework/server/recovery/).
- **`api_version`.** The plugin manifest declares the contract it was built against. A plugin built for an incompatible line is refused before it runs.

The HostingShim release notes name the core line that release was built against. Read the [release notes](/framework/releases/) for the line you are moving to.

## Update order

When several pieces move at once, update the carrier and the core first, then the loader archives, then the plugin packages. Restart once at the end.
