---
title: Running a server
description: Install the framework on a Bedrock Dedicated Server, then keep it running.
---

You are the one who runs the server. This section covers picking a carrier, installing it, and living with it afterwards; writing the plugins themselves is in [Develop](/develop/).

## Steps

1. [Pick a carrier](/server/carriers/) — the three runtime environments the framework supports, and what each one costs you.
2. Install it: [LeviLamina](/server/install/levilamina/), [Endstone](/server/install/endstone/), or the [self-hosted Linux carrier](/server/install/selfhosted/).
3. Put plugins under `plugins/` and start the server.
4. Keep it alive: [updating](/server/updating/), [backup](/server/backup/), and [recovery](/server/recovery/) when something breaks.

By hand rather than by reading: the framework runs plugins inside the server process, with the same privileges as the server. It isolates plugins from each other; it is not a sandbox.
