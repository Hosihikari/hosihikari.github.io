---
title: MCP server
description: Expose an install root to MCP clients with seiko-mcp.
---

`seiko-mcp` is a stdio MCP server. It uses the same library as `sk`, so it reads and writes the same install root, store, and lock. It ships with the release archives and is installed alongside `sk`.

## Run it

```bash
seiko-mcp --root /path/to/root
```

| Option | Meaning |
| --- | --- |
| `--root <path>` | Default install root. Defaults to the current directory, not the nearest `seiko.conf`. |
| `--allow-mutations` | Register mutating tools. Without it the server is read-only. |
| `--allowed-root <path>` | Repeatable. Mutation roots must be inside one of these directories. |
| `--allowed-store <path>` | Repeatable. With an allowlist active, mutation stores must be the default store or inside one of these directories. |
| `-h`, `--help` | Show usage. |
| `-V`, `--version` | Print the build version. |

The server speaks line-delimited JSON-RPC over stdio and reports protocol version `2025-06-18`. `initialize` returns `serverInfo` with the binary name and the same version as `--version`.

## Tools

Read-only tools:

| Tool | Purpose |
| --- | --- |
| `list` | Installed sei from the lock. |
| `search` | Search sei names in the configured indexes. |
| `info` | Versions, dependencies, and artifact counts. |
| `lock` | Return the current lock file. |
| `source_list` | Configured sources. |
| `config_get` | Read an install-root configuration value. |
| `cache_status` | Store artifact and partial counts. |
| `cache_verify` | Verify stored artifacts. |
| `why` | Dependency chains to a sei. |
| `outdated` | Newer versions in range and overall. |

Mutation tools are registered only with `--allow-mutations`:

| Tool | Purpose |
| --- | --- |
| `add` | Add a direct declaration and sync. |
| `remove` | Remove a direct declaration and sync. |
| `update` | Update direct declarations and sync. |
| `sync` | Resolve and deploy sei. |
| `rollback` | Restore a previous generation. |
| `source_add`, `source_remove` | Edit sources. |
| `config_set` | Write a configuration value. |
| `cache_clean` | Remove unreferenced artifacts. |

Every mutation requires an explicit `root` argument; the server refuses to infer it. Read-only tools accept an optional `root` and are not restricted by the allowlists. With `--allowed-root`, a mutation root must be the allowed directory or lie beneath it, after resolving symlinks. The server takes the same install-root lock as `sk`, so a mutation cannot race a CLI sync.

## Client configuration

Claude Code:

```bash
claude mcp add seiko -- seiko-mcp --root /path/to/root
```

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "seiko": {
      "command": "seiko-mcp",
      "args": ["--root", "/path/to/root"]
    }
  }
}
```

Add `"--allow-mutations"` to `args` when the client should be able to sync or change the root. Start read-only and grant mutations only to clients you trust with the root.

Tool results are JSON text; a failed tool call returns an error result rather than crashing the server. Source credentials are read from the configured environment variables as usual, and tokens are never included in results.
