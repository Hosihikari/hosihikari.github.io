---
title: 安装 Seiko
description: 安装 sk 与 seiko-mcp，校验下载，并升级或卸载。
---

Seiko 发布两个 NativeAOT 二进制：CLI `sk` 与 MCP server `seiko-mcp`。两者都不需要 .NET 运行时。

## 要求

- Windows x64、arm64 或 x86。
- Linux x64、arm64 或 arm，支持 glibc（Ubuntu 22.04 及以上）与 musl。
- macOS x64 或 arm64。

二进制未做代码签名。在 macOS 或 Windows 上手动下载可能触发 Gatekeeper 或 SmartScreen；推荐用安装器直接使用 Release 资产。

## 安装

Linux 与 macOS：

```bash
curl -fsSL https://github.com/Hosihikari/Seiko/releases/latest/download/install.sh | sh
```

Windows PowerShell：

```powershell
irm https://github.com/Hosihikari/Seiko/releases/latest/download/install.ps1 | iex
```

安装器选择最新稳定版，用 `SHA256SUMS` 校验归档，把两个二进制装到 Unix 的 `~/.local/bin` 或 Windows 的 `%LOCALAPPDATA%\Seiko\bin`。默认不改 `PATH`；传 `--modify-path`（PowerShell 为 `-ModifyPath`）才会追加，否则只打印需要添加的行。

## 钉版本或换目录

Unix：

```bash
curl -fsSL https://github.com/Hosihikari/Seiko/releases/latest/download/install.sh \
  | sh -s -- --version v0.2.1 --dir "$HOME/bin"
```

PowerShell：

```powershell
irm https://github.com/Hosihikari/Seiko/releases/latest/download/install.ps1 -OutFile install.ps1
./install.ps1 -Version v0.2.1 -Dir "$env:USERPROFILE\bin"
```

`--dry-run`（PowerShell 为 `-DryRun`）只解析版本与摘要并打印计划，不写任何文件。`--base-url` 是给镜像用的高级选项。

## 校验

```bash
sk --version
seiko-mcp --version
```

手动下载的归档与安装器做同样的检查：

```bash
gh attestation verify sk-0.2.1-linux-x64.tar.gz --repo Hosihikari/Seiko
sha256sum -c SHA256SUMS --ignore-missing
```

| 资产 | 内容 |
| --- | --- |
| `sk-<version>-<rid>.zip` / `.tar.gz` | `sk`、`seiko-mcp` 与 `LICENSE.md` |
| `sk-<version>-<rid>-symbols.zip` / `.tar.gz` | 两个二进制的调试符号 |
| `SHA256SUMS` | 所有 Release 资产的摘要 |
| `install.sh`、`install.ps1` | 安装脚本 |

`<rid>` 是 `win-x64`、`win-arm64`、`win-x86`、`linux-x64`、`linux-arm64`、`linux-arm`、`linux-musl-x64`、`linux-musl-arm64`、`linux-musl-arm`、`osx-x64` 或 `osx-arm64`。

## 升级与卸载

重跑安装器即升级；它会替换两个二进制。卸载删除 `sk` 与 `seiko-mcp`（Windows 为 `sk.exe` 与 `seiko-mcp.exe`），如果曾加入 `PATH` 再删掉对应目录。

删除二进制不会动安装根或存储。安装根是你运行 `sk init` 的目录；存储在 Windows 上是 `%LOCALAPPDATA%\seiko\store`，其他平台是 `~/.cache/seiko`。只有在没有安装根还需要其中的构件或回滚代时才删除存储。
