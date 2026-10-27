---
title: Events and callbacks
description: The event bus, the two callbacks into your host, and the scheduler.
---

Three things travel between the manager and your process: events plugins publish, the scheduler they use, and the two callbacks the manager calls back into you.

## The event bus

`context.Events` is an `IEventBus`. One bus, shared by every plugin in the process:

```csharp
public interface IEventBus
{
    IDisposable Subscribe<TEvent>(Action<TEvent> handler);
    void Publish<TEvent>(TEvent @event);
}
```

- **Dispatch is synchronous, on the publisher's thread.** A subscriber that blocks blocks the publisher.
- **A subscriber that throws is contained.** The exception is caught and reported; the remaining subscribers still run.
- **Matching is by the exact type.** Publishing a base-class instance does not reach handlers subscribed to a derived type.
- **Subscriptions are process-wide.** The framework unsubscribes a plugin's subscriptions on unload, so a forgotten `Dispose` does not pin the plugin — but unsubscribing explicitly is still the right habit.

The host can publish on the same bus. That is how carrier events reach plugins: the carrier publishes, plugins subscribe, and neither side needs to know the other.

## The scheduler

`context.Scheduler` runs work on the thread pool:

```csharp
IDisposable once = context.Scheduler.ScheduleOnce(TimeSpan.FromSeconds(5), () => { });
IDisposable periodic = context.Scheduler.SchedulePeriodic(TimeSpan.FromMinutes(1), () => { });
```

Releasing the returned handle cancels. Work that throws is caught and reported, and for a periodic task it does not stop the following runs.

The thread pool is the only guarantee. "Runs on the game's main thread" is a carrier capability, not a framework one — a host that needs it must supply it through `carrierServices` or accept that callbacks are not on the main thread.

Both the bus and the scheduler are per-plugin-scope: on unload the framework closes the gate first, so no further callbacks arrive, then releases the subscriptions and timers.

## reportFault

`reportFault` is the constructor callback for problems that happen outside a plugin hook: a child process that died, a protocol error, a package the manager refused before it ran. The manager calls it with a readable message.

```csharp
reportFault: entry => logger.LogError("Load problem: {Entry}", entry)
```

Send it to your log at error level. A fault is not fatal to the process — one plugin failing is contained — but it is the only signal that a plugin is not doing what it was loaded for.

In-process code that hits a fault outside a hook can report it itself:

```csharp
context.ReportFault("child process exited with code 1");
```

The manager treats that as a fault: it unloads the plugin and, if the unload succeeds, calls `onRemoved`.

## onRemoved

`onRemoved` fires after a failed plugin has been unloaded successfully, with the plugin's name. It exists so the host can drop the plugin from its own registry — the parent loader's list, a status page, whatever tracks it.

```csharp
onRemoved: name => registry.Remove(name)
```

Two things it is not:

- **Not a general unload hook.** It fires on the fault path, not when you call `Unload` yourself.
- **Not guaranteed to fire.** If the unload fails, the plugin is still there and `onRemoved` does not run.

Keep it short and non-throwing. It runs inside the manager's unload path.

## Putting them together

A host that owns an event source typically does this: build the manager with `reportFault` and `onRemoved` wired to its own log and registry, publish carrier events through the manager's bus, and let plugins subscribe in `OnEnable` and drop their subscriptions in `OnUnload`. The framework closes the gate on disable, so a disabled plugin stops receiving events without needing to unsubscribe.
