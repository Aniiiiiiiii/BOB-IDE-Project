# Docker MCP Setup for IBM Bob

This document explains how to configure IBM Bob to use the DevChronicle MCP server running in Docker.

## Background

The DevChronicle MCP server runs as a local STDIO server. Since the host machine doesn't have Node.js/npm installed, we use Docker to run the server. Bob needs to be configured to start the MCP server through Docker.

## Portable Launcher Scripts (Recommended)

The project includes portable launcher scripts that automatically resolve the project root and start the MCP server via Docker Compose. This approach is **collaborator-safe** and works regardless of where the repository is cloned.

### Windows Configuration

Update your `.Bob/mcp.json`:

```json
{
  "mcpServers": {
    "devchronicle": {
      "command": "powershell",
      "args": [
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        "scripts/start-mcp.ps1"
      ],
      "description": "DevChronicle MCP - Persistent project memory through devlogs, ADRs, and git history"
    }
  }
}
```

### Linux/macOS Configuration

Update your `.Bob/mcp.json`:

```json
{
  "mcpServers": {
    "devchronicle": {
      "command": "sh",
      "args": [
        "scripts/start-mcp.sh"
      ],
      "description": "DevChronicle MCP - Persistent project memory through devlogs, ADRs, and git history"
    }
  }
}
```

### Why Launcher Scripts?

The launcher scripts provide several benefits:

1. **No hardcoded paths** - Scripts dynamically resolve the project root
2. **Collaborator-safe** - Works on any machine without editing config files
3. **OneDrive/Unicode safe** - Handles complex paths correctly
4. **Error handling** - Checks if Docker is running before attempting to start
5. **Portable** - `.Bob/mcp.json` can be shared across the team

## Alternative: Direct Docker Commands

If you prefer not to use launcher scripts, you can configure Bob to call Docker directly:

### Option 1: Docker Compose (Direct)

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

**Note:** This requires `cwd` to be set correctly and may not work if Bob's working directory differs from the project root.

**Flags explained:**
- `--rm`: Remove container after it exits
- `-T`: Disable pseudo-TTY allocation (required for STDIO)
- `devchronicle-mcp`: Service name from docker-compose.yml
- `node build/index.js`: Command to run the MCP server

### Option 2: Direct Docker Run

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

**Note:** This also requires correct `cwd` and may have path resolution issues.

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
   
   If this fails, start Docker Desktop and wait for it to fully initialize.

2. **Verify the image exists:**
   ```powershell
   docker images | Select-String devchronicle
   ```
   
   If the image doesn't exist, build it:
   ```powershell
   docker compose build
   ```

3. **Test the launcher script manually:**
   
   **Windows:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/start-mcp.ps1
   ```
   
   **Linux/macOS:**
   ```bash
   sh scripts/start-mcp.sh
   ```
   
   You should see: `DevChronicle MCP server running on stdio`

4. **Test Docker Compose directly:**
   ```powershell
   docker compose run --rm -T devchronicle-mcp node build/index.js
   ```

### PowerShell Execution Policy Issues

If you get "execution policy" errors on Windows:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or use the `-ExecutionPolicy Bypass` flag (already included in the config).

### OneDrive/Unicode Path Issues

The launcher scripts handle OneDrive and Unicode paths correctly by:
- Dynamically resolving the project root
- Using PowerShell's path resolution on Windows
- Changing to the project directory before running Docker

If you still have issues:
1. Ensure Docker Desktop has access to OneDrive folders
2. Check Docker Desktop Settings → Resources → File Sharing
3. Try cloning the repo to a path without Unicode characters (e.g., `C:\Projects\devchronicle-mcp`)

### STDIO communication issues

- Ensure `-T` flag is used with `docker compose run` (disables TTY)
- Ensure `-i` flag is used with `docker run` (keeps STDIN open)
- Don't use `tty: true` in docker-compose.yml
- The launcher scripts handle this automatically

### Docker Compose not found

If you get "docker: 'compose' is not a docker command":

1. Update Docker Desktop to the latest version (includes Compose V2)
2. Or install Docker Compose separately: https://docs.docker.com/compose/install/

### Permission issues on Windows

If you get permission errors accessing files:
1. Ensure Docker Desktop has access to the project directory
2. Check Docker Desktop Settings → Resources → File Sharing
3. Add the project directory to the allowed paths

## Updating the Configuration

After modifying `.Bob/mcp.json`:
1. Restart Bob or reload the MCP configuration
2. Bob should automatically discover all five tools:
   - `log_progress`
   - `summarize_project_state`
   - `analyze_change_risk`
   - `create_adr`
   - `recommend_next_features`

## Verifying Bob Integration

Ask Bob:
> "What MCP tools do you have available?"

Bob should list all five tools.

Then test:
> "Summarize the current project state"

Bob should use the `summarize_project_state` tool and return project information.