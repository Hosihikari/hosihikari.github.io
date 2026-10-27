---
title: 事件与回调
description: 事件总线、回到宿主的那两个回调，以及调度器。
---

管理器与你的进程之间有三样东西往来：插件发布的事件、它们用的调度器，以及管理器回调你的那两个入口。

## 事件总线

`context.Events` 是 `IEventBus`。整个进程共用一条总线：

```csharp
public interface IEventBus
{
    IDisposable Subscribe<TEvent>(Action<TEvent> handler);
    void Publish<TEvent>(TEvent @event);
}
```

- **分发是同步的，在发布者的线程上。** 订阅者阻塞，发布者就阻塞。
- **抛异常的订阅者被隔离。** 异常被捕获并上报，其余订阅者照常执行。
- **按类型精确匹配。** 用基类实例发布，不会命中按派生类型订阅的 handler。
- **订阅是进程级的。** 插件卸载时框架会替它退订，漏掉 `Dispose` 不会钉住插件——但显式退订仍是好习惯。

宿主可以在同一条总线上发布。载体事件就是这样到达插件的：载体发布，插件订阅，两边都不需要认识对方。

## 调度器

`context.Scheduler` 在线程池上跑任务：

```csharp
IDisposable once = context.Scheduler.ScheduleOnce(TimeSpan.FromSeconds(5), () => { });
IDisposable periodic = context.Scheduler.SchedulePeriodic(TimeSpan.FromMinutes(1), () => { });
```

释放返回的句柄即取消。抛出的异常被捕获并上报，对周期任务来说，不影响后续的次数。

线程池是唯一的保证。"在游戏主线程上跑"是载体的能力，不是框架的——需要它的宿主得通过 `carrierServices` 提供，否则就要接受回调不在主线程上。

总线与调度器都属于插件作用域：卸载时框架先关闸门，之后不再有回调进来，再收回订阅与定时器。

## reportFault

`reportFault` 是构造函数里的回调，接收钩子之外发生的问题：子进程死了、协议出错、包在运行前被管理器拒绝。管理器带着可读的消息调用它。

```csharp
reportFault: entry => logger.LogError("加载问题：{Entry}", entry)
```

把它接到你自己日志的 error 级别。一次故障不会拖垮进程——单个插件失败是被隔离的——但它是"这个插件没在做它该做的事"的唯一信号。

进程内的代码在钩子之外遇到故障，可以自己上报：

```csharp
context.ReportFault("子进程以退出码 1 结束");
```

管理器按故障处理：卸载该插件，卸载成功后再调 `onRemoved`。

## onRemoved

故障插件卸载成功之后，`onRemoved` 带着插件名触发。它存在的意义是让宿主把这条从自己的注册表里摘掉——父级加载器的清单、状态页，任何在跟踪它的地方。

```csharp
onRemoved: name => registry.Remove(name)
```

它不是两件事：

- **不是通用的卸载钩子。** 它只在故障路径上触发，你自己调 `Unload` 时不会。
- **不保证触发。** 卸载失败时插件还在，`onRemoved` 不会跑。

保持它简短且不抛异常。它跑在管理器的卸载路径里。

## 合起来用

拥有事件源的宿主通常这么做：构造管理器时把 `reportFault` 与 `onRemoved` 接到自己的日志与注册表，载体事件经管理器的总线发布，插件在 `OnLoad` 里订阅一次、在 `OnUnload` 里释放。停用只关闭闸门，订阅还留着——在 `OnEnable` 里再订阅一次，每轮启停都会多出一个 handler。在 `OnLoad` 订阅，暂停交给闸门。插件卸载时没退掉的订阅，框架也会收走。
