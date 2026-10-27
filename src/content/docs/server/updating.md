---
title: Updating and rolling back
description: Move to a new release, and get back if it goes wrong.
---

Pieces update independently: the carrier, the plugin manager, the loaders, and the plugin packages. The commands are the same on every carrier; only the package label changes.

## Check what you have

```powershell
lip list
```

The installed packages appear with their versions, and packages installed by label show the label (`HostingShim#levilamina@1.1.0`). Keep this output before an update.

## Update

```powershell
lip update github.com/HosihikariFramework/HostingShim#levilamina
```

`lip update` takes the same package syntax as `lip install`, including the `#variant` label. Use `-n` to see what would change without doing it.

There is no `lip upgrade`; that command does not exist.

## Pin a version, or go back

`lip install` with an explicit version both upgrades and downgrades:

```powershell
lip install github.com/HosihikariFramework/HostingShim#levilamina@1.1.0
```

This is the rollback path. Install the version that worked, restart, and confirm the log shows the framework taking over again.

## What needs a restart

Everything the framework loads runs inside the server process:

- **The carrier and the plugin manager.** Restart.
- **Loader packages.** They cannot be unloaded at runtime; disabling or upgrading one means a restart.
- **Plugin packages.** Under a parent, the parent can disable, enable, and unload plugins at runtime. Self-hosted has no runtime enable or disable: move the package out of `plugins/` and restart.

## Check compatibility before you update

The release page lists which versions were published together. Two numbers do the actual work:

- **Hosting contract version.** The native carrier and the plugin manager check each other before starting. A mismatch stops the startup sequence; see [Recovery](/server/recovery/).
- **`api_version`.** The plugin manifest declares the contract it was built against. A plugin built for an incompatible line is refused before it runs.

Read the [release notes](/releases/) for the line you are moving to.

## Update order

When several packages move at once, update the carrier first — it pulls the plugin manager it needs as a lip dependency — then the loader packages, then the plugin packages. Restart once at the end.
