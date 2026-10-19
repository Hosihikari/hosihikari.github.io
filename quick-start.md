# 快速开始

从一台装好 LeviLamina 或 Endstone 的服务端，到看见第一个插件运行。

## 准备

- Windows x64。
- Minecraft 基岩版专用服务器：BDS 1.26.51+（LeviLamina 26.51+）或 BDS 1.26.52+（Endstone 0.11+）。
- [.NET 10 运行时](https://dotnet.microsoft.com/download)（`Microsoft.NETCore.App`）。
- [lip](https://github.com/LiteLDev/lip)。
- 进程外示例还需要 Node.js 20+ 在 `PATH` 上。

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

再装本例需要的两个 Provider：

```powershell
lip install github.com/HosihikariFramework/CSharpProvider
lip install github.com/HosihikariFramework/RpcProvider
```

顺序是 Shim → Provider → 插件包。Provider 的清单不声明对 Shim 的依赖，因为 Shim 的载体变体由安装命令选择。

## 放一个 C# 插件

在 Docs 仓根执行：

```powershell
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

启动服务端。日志里应出现 `已载入，包目录` 与 `已启用，greeting=你好，星光`，数据目录同时写出 `loaded.txt` 与 `enabled.txt`：

```
<服务端>/data/hosihikari/hello-csharp/
```

## 放一个进程外插件

```powershell
Copy-Item -Recurse .\examples\hello-node "$Server\plugins\hello-node"
Copy-Item "$Server\plugins\hosihikari-rpc\bindings\node\hosihikari.mjs" "$Server\plugins\hello-node\hosihikari.mjs"
```

`hosihikari.mjs` 是 Provider 随包发布的 Node 绑定；把它放在入口旁边，清单里的命令就能直接运行。启动后日志里应出现 `hello-node` 的 `已载入，包目录` 与 `已启用，greeting=你好，星光`。

如果目标目录已经存在，先删掉再复制，避免把新文件叠进旧目录。

## 改配置

包内 `<name>.conf` 是作者给的默认值；服务端侧的覆盖放在 `config/hosihikari/`，优先于包内：

```powershell
New-Item -ItemType Directory -Force "$Server\config\hosihikari" | Out-Null
Copy-Item .\examples\hello-csharp\hello-csharp.conf "$Server\config\hosihikari\hello-csharp.conf"
```

改完重启，日志里的 `greeting` 就是覆盖后的值。环境变量也会覆盖同名键。

## Endstone 的运行时路径

Endstone CLI 会把子进程的 `PATH` 换成 Python 的 `sys.path`。如果日志报找不到 `node`，把清单里的 `command` 改成绝对路径：

```json
"command": "[\"C:/Program Files/nodejs/node.exe\", \"./hosihikari.mjs\", \"./main.mjs\"]"
```

`command` 是编码成字符串的 JSON 数组。用正斜杠可以少一层转义。

## 接下来

- [插件包与清单](plugin-package.md)
- [写一个 C# 插件](authoring-csharp.md)
- [写一个进程外插件](authoring-rpc.md)
- [常见问题](troubleshooting.md)
