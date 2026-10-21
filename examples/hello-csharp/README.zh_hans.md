# hello-csharp

[English](README.md) | [简体中文](README.zh_hans.md)

一个最小的 C# 插件：载入与启用时写日志和数据文件，并读取分层后的 `greeting`。进程内加载器把源码 AOT 为 IL；插件在 ALC 里作为 CLR 代码运行。

## 安装

在文档仓根执行：

```powershell
git clone https://github.com/HosihikariFramework/hosihikariframework.github.io
cd hosihikariframework.github.io
# 以 LeviLamina 为例；其他载体用 #endstone 或无后缀自持态
lip install github.com/HosihikariFramework/HostingShim#levilamina
lip install github.com/HosihikariFramework/CSharpLoader
$Server = 'C:\bedrock-server'
Copy-Item -Recurse .\examples\hello-csharp "$Server\plugins\hello-csharp"
```

目标目录名必须是 `hello-csharp`。

## 文件

- `manifest.json`：`loader` 是 `csharp`，依赖 `hosihikari` 与 `hosihikari-csharp`。
- `main.cs`：入口类型 `HelloPlugin`。
- `hello-csharp.conf`：包内默认配置。

## 预期

日志出现 `loaded, package` 与 `enabled, greeting=你好，星光`；数据写在 `data/hosihikari/hello-csharp/`。
