---
title: Installing Seiko
description: Install sk and seiko-mcp, verify the download, and upgrade or remove them.
---

Seiko ships as two NativeAOT binaries: `sk`, the CLI, and `seiko-mcp`, the MCP server. Neither needs a .NET runtime.

## Requirements

- Windows x64, arm64, or x86.
- Linux x64, arm64, or arm on glibc (Ubuntu 22.04 or newer) or musl.
- macOS x64 or arm64.

The binaries are not code-signed. A browser download on macOS or Windows may trigger Gatekeeper or SmartScreen; the installer uses the release assets directly and is the recommended path.

## Install

Linux and macOS:

```bash
curl -fsSL https://github.com/Hosihikari/Seiko/releases/latest/download/install.sh | sh
```

Windows PowerShell:

```powershell
irm https://github.com/Hosihikari/Seiko/releases/latest/download/install.ps1 | iex
```

The installer selects the latest stable release, verifies the archive against `SHA256SUMS`, and installs both binaries to `~/.local/bin` on Unix or `%LOCALAPPDATA%\Seiko\bin` on Windows. It does not modify `PATH` unless `--modify-path` (PowerShell: `-ModifyPath`) is passed; otherwise it prints the line to add.

## Pin a version or choose a directory

Unix:

```bash
curl -fsSL https://github.com/Hosihikari/Seiko/releases/latest/download/install.sh \
  | sh -s -- --version v0.2.1 --dir "$HOME/bin"
```

PowerShell:

```powershell
irm https://github.com/Hosihikari/Seiko/releases/latest/download/install.ps1 -OutFile install.ps1
./install.ps1 -Version v0.2.1 -Dir "$env:USERPROFILE\bin"
```

`--dry-run` (PowerShell: `-DryRun`) resolves the release and checksum and prints the plan without writing anything. `--base-url` is an advanced option for mirrors.

## Verify

```bash
sk --version
seiko-mcp --version
```

Manual downloads are checked the same way as the installer:

```bash
gh attestation verify sk-0.2.1-linux-x64.tar.gz --repo Hosihikari/Seiko
sha256sum -c SHA256SUMS --ignore-missing
```

| Asset | Contents |
| --- | --- |
| `sk-<version>-<rid>.zip` / `.tar.gz` | `sk`, `seiko-mcp`, and `LICENSE.md` |
| `sk-<version>-<rid>-symbols.zip` / `.tar.gz` | Debug symbols for both binaries |
| `SHA256SUMS` | Checksums for every release asset |
| `install.sh`, `install.ps1` | Installers |

`<rid>` is one of `win-x64`, `win-arm64`, `win-x86`, `linux-x64`, `linux-arm64`, `linux-arm`, `linux-musl-x64`, `linux-musl-arm64`, `linux-musl-arm`, `osx-x64`, or `osx-arm64`.

## Upgrade and uninstall

Re-run the installer to upgrade; it replaces both binaries. Uninstall by deleting `sk` and `seiko-mcp` (Windows: `sk.exe` and `seiko-mcp.exe`) and removing the install directory from `PATH` if you added it.

Removing the binaries does not touch install roots or the store. Install roots are wherever you ran `sk init`. The store lives at `%LOCALAPPDATA%\seiko\store` on Windows and `~/.cache/seiko` elsewhere; delete it only when no install root needs its artifacts or rollback generations.
