---
title: 快速开始
description: 装上 HostingShim 与加载器，跑起一个 C# 插件与一个进程外 Node 插件。
---

从一台装好 LeviLamina、Endstone 或自持态 Linux 载体的服务端，到看见第一个插件运行。

## 准备

- Windows x64（LeviLamina 与 Endstone Windows）；Linux x64（Endstone Linux 与自持态）。
- Minecraft 基岩版专用服务器：BDS 1.26.51+（LeviLamina 26.51+）、BDS 1.26.52+（Endstone 0.11+），
  或自持态的 BDS 1.21.3。
- [.NET 10 运行时](https://dotnet.microsoft.com/download)（`Microsoft.NETCore.App`）。
- [lip](https://github.com/LiteLDev/lip)。
- 进程外插件还需要 Node.js 20+ 在 `PATH` 上。

以下安装命令都在**服务端根目录**执行。

## 装 HostingShim 与加载器

无后缀的包是**自持态 Linux** 载体。带父级的服务端用对应的 label：

```powershell
lip install github.com/HosihikariFramework/HostingShim                # 自持态 Linux
lip install github.com/HosihikariFramework/HostingShim#levilamina     # LeviLamina
lip install github.com/HosihikariFramework/HostingShim#endstone       # Endstone Windows / Linux
```

再装本例需要的 C# 加载器：

```powershell
lip install github.com/HosihikariFramework/CSharpLoader
```

顺序是 HostingShim → 加载器 → 插件包。加载器的清单不声明对 HostingShim 的依赖，因为 HostingShim 的载体变体由安装命令选择。

自持态会把 `hosihikari-server` 放在服务端根，插件管理器放在 `plugins/hosihikari/`。通过启动器起服，
它会预加载 HostingShim：

```bash
./hosihikari-server
```

自持态的目标是 BDS 1.21.3，启动器需要 .NET 10 运行时。插件包照旧放在 `plugins/` 下，并且是
预编译程序集包。

## 放一个 C# 插件

从维护中的插件包开始，见[模板](/zh/templates/)。

克隆文档仓并执行：

```powershell
git clone https://github.com/HosihikariFramework/hosihikariframework.github.io
cd hosihikariframework.github.io
$Server = 'C:\bedrock-server'
Copy-Item -Recurse .\examples\hello-csharp "$Server\plugins\hello-csharp"
```

包里有：

```
hello-csharp/
  manifest.json
  main.cs
  hello-csharp.conf
```

启动服务端。日志里应出现 `loaded, package` 与 `enabled, greeting=你好，星光`，数据目录同时写出 `loaded.txt` 与 `enabled.txt`：

```
<服务端>/data/hosihikari/hello-csharp/
```

## 进程外插件

RpcLoader 是官方的进程外加载器：插件在子进程中通过行分隔 JSON-RPC 2.0 与宿主通信，不把源码 AOT 为 IL。

```powershell
lip install github.com/HosihikariFramework/RpcLoader
Copy-Item -Recurse .\examples\hello-node "$Server\plugins\hello-node"
Copy-Item "$Server\plugins\hosihikari-rpc\bindings\node\hosihikari.mjs" "$Server\plugins\hello-node\hosihikari.mjs"
```

`hosihikari.mjs` 是 RpcLoader 随包发布的 Node 绑定。把它放在入口旁边，清单里的命令就能直接运行。启动后日志里应出现 `hello-node` 的 `loaded, package` 与 `enabled, greeting=你好，星光`。

如果目标目录已经存在，先删掉再复制，避免把新文件叠进旧目录。

## 改配置

包内 `<name>.conf` 是作者给的默认值；服务端侧的覆盖放在 `config/hosihikari/`，优先于包内：

```powershell
New-Item -ItemType Directory -Force "$Server\config\hosihikari" | Out-Null
Copy-Item .\examples\hello-csharp\hello-csharp.conf "$Server\config\hosihikari\hello-csharp.conf"
```

改完重启，日志里的 `greeting` 就是覆盖后的值。环境变量也会覆盖同名键。

## 接下来

- [插件包与清单](/zh/plugin-package/)
- [写一个 C# 插件](/zh/authoring-csharp/)
- [进程外插件](/zh/authoring-rpc/)
- [常见问题](/zh/troubleshooting/)
