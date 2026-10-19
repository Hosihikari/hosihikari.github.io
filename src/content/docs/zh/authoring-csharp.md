---
title: C# 插件
description: 写一个由 Provider 在装载时编译的 C# 源码插件。
---

# 写一个 C# 插件

C# 直接跑在 CLR 上，`Hosihikari.PluginProvider.CSharp` 在装载时用 Roslyn 把 `.cs` 编成程序集，再放进插件自己的 collectible ALC。作者交的是源码，拿到的是与其他程序集插件一样的隔离与卸载承诺。这是一等 Provider：在插件开始运行前把源码 AOT 为 IL；核心把 IL 装进 collectible ALC，插件本身是普通 CLR 代码。

## 准备

```powershell
lip install github.com/HosihikariFramework/Shim
lip install github.com/HosihikariFramework/CSharpProvider
```

## 包结构

```
plugins/hello-csharp/
  manifest.json
  main.cs
  hello-csharp.conf
```

清单：

```json
{
  "name": "hello-csharp",
  "entry": "main.cs",
  "type": "hosihikari",
  "version": "1.0.0",
  "dependencies": [
    { "name": "hosihikari" },
    { "name": "hosihikari-csharp" }
  ],
  "extraInfo": { "api": "2", "format_version": "1", "provider": "csharp" }
}
```

## 入口

文件里定义一个实现 `IPlugin`、有无参构造的类型；Provider 找到它并实例化。

```csharp
using System.IO;
using Hosihikari;
using Microsoft.Extensions.Logging;

public sealed class HelloPlugin : IPlugin
{
    private IPluginContext _context = null!;

    public void OnLoad(IPluginContext context)
    {
        _context = context;
        context.Logger.LogInformation("loaded, package {Dir}", context.PackageDirectory);
        File.WriteAllText(Path.Combine(context.DataDirectory, "loaded.txt"), "loaded");
    }

    public PluginHookResult OnEnable()
    {
        var greeting = _context.Configuration["greeting"];
        _context.Logger.LogInformation("enabled, greeting={Greeting}", greeting);
        File.WriteAllText(Path.Combine(_context.DataDirectory, "enabled.txt"), greeting ?? "");
        return PluginHookResult.Allow();
    }

    public PluginHookResult OnDisable() => PluginHookResult.Allow();

    public void OnUnload() { }
}
```

`using Microsoft.Extensions.Logging;` 不能省：`LogInformation` 是扩展方法。

## 编译与缓存

- 装载时编译；源码插件不需要 csproj。
- 产物按内容寻址缓存到 `data/hosihikari/<name>/bin/<哈希>/`，旁边有校验和与 portable PDB。
- 源码、包内私有 DLL、Roslyn 版本或运行时版本变化会换哈希。
- 包根目录里的私有 DLL 参与编译引用，运行时也从包目录解析。
- 本机库放在包根或 `runtimes/<当前可移植 RID>/native/`，RID 目录优先。

## 配置

包内默认 `hello-csharp.conf`：

```text
greeting = "你好，星光"
```

服务端覆盖放 `config/hosihikari/hello-csharp.conf`；环境变量同名键也参与覆盖。

## 事件与定时器

`context.Events` 与 `context.Scheduler` 由框架提供。停用会先关闭闸门，事件与定时器回调停止投递；周期任务在 `OnEnable` 里启动。

## 程序集插件

已经有编好的 DLL 时，把 DLL 放进包，清单的 `provider` 写 `assembly`，`entry` 指向 DLL。程序集上声明入口：

```csharp
[assembly: EntryPoint<HelloPlugin>]
```

工程引用契约并排除运行期资产，避免把第二份契约带进插件包：

```xml
<PackageReference Include="Hosihikari.Abstractions" Version="[0.7.0]" ExcludeAssets="runtime" />
```

程序集里应当恰好有一个 `EntryPoint<T>`；入口类型实现 `IPlugin` 且有无参构造。

## 部署与验证

把目录放到 `plugins/`，启动服务端。日志里应出现 `loaded, package` 与 `enabled`；数据目录里出现 `loaded.txt` 与 `enabled.txt`。卸载时框架会把插件从 ALC 放下，并做回收验证。
