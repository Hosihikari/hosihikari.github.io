---
title: Embedding the manager
description: Host Hosihikari.PluginManager inside your own process.
---

You are embedding PluginManager in a host you control, rather than installing a carrier. The manager gives you discovery, dependency ordering, isolation, and lifecycle; you supply the carrier services and drive start and stop.

## Steps

- [Getting started](/embed/getting-started/) — add the package and stand up a minimal host.
- [Carrier services](/embed/carrier-services/) — what the host must supply, and how loaders register.
- [Lifecycle](/embed/lifecycle/) — `Load`, `Enable`, `Disable`, `Unload`, and the status snapshot.
- [Events and callbacks](/embed/events-and-callbacks/) — the event bus, the scheduler, `reportFault`, `onRemoved`.

Writing the plugins themselves is in [Develop](/develop/).
