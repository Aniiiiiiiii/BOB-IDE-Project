# Docker MCP Setup for IBM Bob

This document explains how to configure IBM Bob to use the DevChronicle MCP server running in Docker.

## Background

The DevChronicle MCP server runs as a local STDIO server. Since the host machine doesn't have Node.js/npm installed, we use Docker to run the server. Bob needs to be configured to start the MCP server through Docker.

## Configuration Options

### Option 1: Docker Compose (Recommended)

Update your `.Bob/mcp.json` to use Docker Compose:

```json
{
  "mcpServers": {
    "devchronicle": {
      "command": "docker",
      "args": [
        "compose",
        "run",
        "--rm",
        "-T",
        "devchronicle-mcp",
        "node",
        "build/index.js"
      ],
      "cwd": ".",
      "description": "DevChronicle MCP - Persistent project memory through devlogs, ADRs, and git history"
    }
  }
}
```

**Flags explained:**
- `--rm`: Remove container after it exits
- `-T`: Disable pseudo-TTY allocation (required for STDIO)
- `devchronicle-mcp`: Service name from docker-compose.yml
- `node build/index.js`: Command to run the MCP server

### Option 2: Direct Docker Run

If Docker Compose doesn't work with Bob's MCP launcher, use direct Docker:

```json
{
  "mcpServers": {
    "devchronicle": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-v",
        ".:/workspace",
        "-w",
        "/workspace",
        "devchronicle-mcp",
        "node",
        "build/index.js"
      ],
      "cwd": ".",
      "description": "DevChronicle MCP - Persistent project memory through devlogs, ADRs, and git history"
    }
  }
}
```

**Flags explained:**
- `--rm`: Remove container after it exits
- `-i`: Keep STDIN open (required for STDIO)
- `-v .:/workspace`: Mount current directory
- `-w /workspace`: Set working directory
- `devchronicle-mcp`: Image name

## Prerequisites

1. **Build the Docker image first:**
   ```powershell
   docker compose build
   ```

2. **Verify the build:**
   ```powershell
   docker compose run --rm devchronicle-mcp npm run build
   ```

3. **Test the server manually:**
   ```powershell
   docker compose run --rm -T devchronicle-mcp node build/index.js
   ```
   
   The server should start and output:
   ```
   DevChronicle MCP server running on stdio
   ```

## Troubleshooting

### Bob can't start the MCP server

1. **Check Docker is running:**
   ```powershell
   docker ps
   ```

2. **Verify the image exists:**
   ```powershell
   docker images | Select-String devchronicle
   ```

3. **Test the command manually:**
   ```powershell
   docker compose run --rm -T devchronicle-mcp node build/index.js
   ```

### STDIO communication issues

- Ensure `-T` flag is used with `docker compose run` (disables TTY)
- Ensure `-i` flag is used with `docker run` (keeps STDIN open)
- Don't use `tty: true` in docker-compose.yml

### Permission issues on Windows

If you get permission errors accessing files:
1. Ensure Docker Desktop has access to the project directory
2. Check Docker Desktop Settings → Resources → File Sharing

## Updating the Configuration

After modifying `.Bob/mcp.json`:
1. Restart Bob or reload the MCP configuration
2. Bob should automatically discover the two tools:
   - `log_progress`
   - `summarize_project_state`

## Verifying Bob Integration

Ask Bob:
> "What MCP tools do you have available?"

Bob should list:
- `log_progress` - Create or append development progress logs
- `summarize_project_state` - Return structured project summary

Then test:
> "Summarize the current project state"

Bob should use the `summarize_project_state` tool and return project information.