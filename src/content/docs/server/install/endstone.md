---
title: Installing on Endstone
description: Install the framework on an Endstone server.
---

The Endstone carrier installs as an Endstone plugin. The framework is the plugin manager; Endstone is its parent.

## Requirements

- Windows x64 or Linux x64.
- Bedrock Dedicated Server 1.26.52 or newer, with Endstone 0.11 or newer installed and working.
- [lip](https://github.com/LiteLDev/lip).
- The .NET 10 runtime. The framework hosts the CLR inside the server process; without the runtime the startup sequence stops and says so in the log.

## Install

Run this in the server root:

```bash
lip install github.com/HosihikariFramework/HostingShim#endstone
```

The `#endstone` label selects the variant; lip picks the Windows or Linux archive from the server's platform. The suffix-less package is the Linux self-hosted carrier and will not work here. The package depends on the plugin manager, so lip installs that too, under `plugins/hosihikari/`.

Start the server through the Endstone CLI, which is how Endstone injects its runtime into the vanilla server binary:

```bash
endstone -s <server root>
```

## Verify

The server log should show the CLR starting, the carrier registering as an Endstone plugin, Endstone enabling it, and the plugin manager reporting what it found under `plugins/`. If none of that appears, see [Recovery](/server/recovery/).

## Two Endstone-specific details

- **Plugin names are normalised.** Endstone accepts `^[a-z0-9_]+$` and forbids a leading `endstone`. A plugin named `Bar` appears to Endstone as `bar`; the framework still tracks it by its manifest name. Commands that address plugins by name take the Endstone spelling.
- **The nethost library must be resolvable.** On Windows `nethost.dll` sits next to `bedrock_server.exe`; on Linux `libnethost.so` sits next to the plugin and is found through `$ORIGIN`. The package handles this; it matters only when you deploy by hand.

## Where things live

| Path | What |
| --- | --- |
| `plugins/hosihikari.dll` / `plugins/hosihikari.so` | The carrier itself; Endstone loads plugins by file. |
| `plugins/hosihikari/` | The plugin manager and its dependencies. |
| `plugins/<name>/` | Plugin packages. |
| `config/hosihikari/<name>.conf` | Server-side configuration overrides. |
| `data/hosihikari/<name>/` | Data the framework hands to each plugin. |
| `logs/latest.log` | Server and framework log. |

## Uninstall

```bash
lip uninstall github.com/HosihikariFramework/HostingShim#endstone
```

The label is part of the package identity. Without it lip answers that the package is not explicitly installed.
