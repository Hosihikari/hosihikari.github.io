---
title: Running a server
description: Install the framework on a Bedrock Dedicated Server, then keep it running.
---

You are the one who runs the server. This section covers picking a carrier, installing it, and living with it afterwards; writing the plugins themselves is in [Develop](/framework/develop/).

## Steps

1. [Pick a carrier](/framework/server/carriers/) — the runtime environments the framework supports, and what each one costs you.
2. Install it: [LeviLamina](/framework/server/install/levilamina/), [Endstone](/framework/server/install/endstone/), [self-hosted Linux](/framework/server/install/selfhosted/), or [self-hosted Windows](/framework/server/install/selfhosted-windows/).
3. Put plugins under `plugins/` and start the server.
4. Keep it alive: [updating](/framework/server/updating/), [backup](/framework/server/backup/), and [recovery](/framework/server/recovery/) when something breaks.

By hand rather than by reading: the framework runs plugins inside the server process, with the same privileges as the server. It isolates plugins from each other; it is not a sandbox.

## Language

Messages from the core and the loaders — logs, load reports, and unload failures — are available in Arabic, Simplified Chinese, English, French, Russian, and Spanish. The server's UI culture selects the language; English is the fallback, and every Chinese variant (including Traditional Chinese) uses the Simplified Chinese resources. The culture comes from the host operating system, so no configuration is needed. Native carrier messages are Chinese: the LeviLamina carrier follows the parent's language, the Endstone carrier and the self-hosted launcher stay Chinese.
