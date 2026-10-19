---
title: 快速开始
description: 装上 Shim 与 Provider，跑起一个 C# 插件与一个进程外 Node 插件。
---

# 快速开始

从一台装好 LeviLamina 或 Endstone 的服务端，到看见第一个插件运行。

## 准备

- Windows x64。
- Minecraft 基岩版专用服务器：BDS 1.26.51+（LeviLamina 26.51+）或 BDS 1.26.52+（Endstone 0.11+）。
- [.NET 10 运行时](https://dotnet.microsoft.com/download)（`Microsoft.NETCore.App`）。
- [lip](https://github.com/LiteLDev/lip)。
- 进程外例外示例还需要 Node.js 20+ 在 `PATH` 上。

以下安装命令都在**服务端根目录**执行。

## 装 Shim 与 Provider

LeviLamina：

```powershell
lip install github.com/HosihikariFramework/Shim
```

Endstone：

```powershell
lip install github.com/HosihikariFramework/Shim#endstone
```

再装本例需要的 C# Provider：

```powershell
lip install github.com/HosihikariFramework/CSharpProvider
```

顺序是 Shim → Provider → 插件包。Provider 的清单不声明对 Shim 的依赖，因为 Shim 的载体变体由安装命令选择。

## 放一个 C# 插件

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

## 例外：进程外桥

RpcProvider 是 AOT/ALC/CLR 规则的唯一例外，也是一等成员：插件在子进程中运行，通过行分隔 JSON-RPC 2.0 over stdio 与宿主通信。

```powershell
lip install github.com/HosihikariFramework/RpcProvider
Copy-Item -Recurse .\examples\hello-node "$Server\plugins\hello-node"
Copy-Item "$Server\plugins\hosihikari-rpc\bindings\node\hosihikari.mjs" "$Server\plugins\hello-node\hosihikari.mjs"
```

`hosihikari.mjs` 是 RpcProvider 随包发布的 Node 绑定。把它放在入口旁边，清单里的命令就能直接运行。启动后日志里应出现 `hello-node` 的 `loaded, package` 与 `enabled, greeting=你好，星光`。

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
- [进程外桥（例外）](/zh/authoring-rpc/)
- [常见问题](/zh/troubleshooting/)
