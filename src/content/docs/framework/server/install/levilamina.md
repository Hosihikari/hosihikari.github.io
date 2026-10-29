---
title: Installing on LeviLamina
description: Install the framework on a LeviLamina server.
---

The LeviLamina carrier installs as a mod. The framework is the plugin manager; LeviLamina is its parent.

## Requirements

- Windows x64.
- Bedrock Dedicated Server 1.26.51 or newer, with LeviLamina 26.51 or newer installed and working.
- [lip](https://github.com/LiteLDev/lip).
- The .NET 10 runtime. The framework hosts the CLR inside the server process; without the runtime the startup sequence stops and says so in the log.

## Install

Run this in the server root:

```bash
lip install github.com/HosihikariFramework/HostingShim#levilamina
```

The `#levilamina` label selects the variant. The suffix-less package is the Linux self-hosted carrier and will not work here. The package depends on the plugin manager, so lip installs that too, under `plugins/hosihikari/`.

Then start the server as usual.

## Verify

The server log should show the framework taking over:

- the CLR starts,
- the carrier registers with LeviLamina,
- LeviLamina enables it,
- the plugin manager reports the plugins it found under `plugins/`.

If none of that appears, the log line right after startup tells you why. See [Recovery](/framework/server/recovery/).

## Where things live

| Path | What |
| --- | --- |
| `plugins/hosihikari/` | The carrier, the plugin manager and its dependencies. |
| `plugins/<name>/` | Plugin packages. |
| `config/hosihikari/<name>.conf` | Server-side configuration overrides. |
| `data/hosihikari/<name>/` | Data the framework hands to each plugin. |
| `logs/latest.log` | Server and framework log. |

## Uninstall

```bash
lip uninstall github.com/HosihikariFramework/HostingShim#levilamina
```

The label is part of the package identity. Without it lip answers that the package is not explicitly installed. Uninstalling also removes the plugin manager dependency, so do not run it while you still need the framework for other packages.
