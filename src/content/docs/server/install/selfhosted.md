---
title: Installing the self-hosted carrier
description: Install the self-hosted Linux carrier.
---

The self-hosted carrier has no parent loader: it preloads the framework into a stock Bedrock
Dedicated Server. It is the only carrier that runs without LeviLamina or Endstone.

## Requirements

- Linux x64.
- Bedrock Dedicated Server **1.21.3**. The launcher targets that version.
- The **.NET 10 runtime** on the machine.
- [lip](https://github.com/LiteLDev/lip).

## Install

Run this in the server root:

```bash
lip install github.com/HosihikariFramework/HostingShim
```

The suffix-less package is the self-hosted carrier. The package depends on the plugin manager, so lip
installs that too, under `plugins/hosihikari/`.

The install script marks the launcher executable. If lip was run with `--ignore-scripts`, set it
yourself:

```bash
chmod +x hosihikari-server
```

## Run

Start the server through the launcher, not through `bedrock_server` directly:

```bash
./hosihikari-server
```

The launcher changes into the server directory and preloads the carrier, which starts the CLR and the
plugin manager before the server's `main`.

## Plugin packages here

Every plugin under `plugins/` loads and enables before the server starts. There is no runtime enable
or disable: to stop using a plugin, move its package out of `plugins/` and restart. This is a property
of the carrier, not of the plugin.

Only precompiled assembly packages run here. A source plugin needs a loader package
([C#](/develop/authoring-csharp/) or [F#](/develop/authoring-fsharp/)), and those exist for the
parented carriers.

## Verify

The launcher's output and the server log should show the CLR starting, the carrier taking over, and
the plugin manager reporting what it found under `plugins/`. If the launcher exits immediately, its
first line says why — usually a missing runtime or a missing `bedrock_server`. See
[Recovery](/server/recovery/).

## Where things live

| Path | What |
| --- | --- |
| `hosihikari-server` | The launcher; run this instead of `bedrock_server`. |
| `plugins/hosihikari/` | The carrier and the plugin manager. |
| `plugins/<name>/` | Plugin packages. |
| `config/hosihikari/<name>.conf` | Server-side configuration overrides. |
| `data/hosihikari/<name>/` | Data the framework hands to each plugin. |

## Uninstall

```bash
lip uninstall github.com/HosihikariFramework/HostingShim
```
