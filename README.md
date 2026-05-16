# DevChronicle MCP

A local Model Context Protocol (MCP) server that gives IBM Bob persistent project memory by reading Markdown devlogs, ADRs (Architecture Decision Records), README/docs, and git history.

**Built for the IBM Bob Hackathon** - This project demonstrates Bob as the core development assistant with deterministic, local-only tools.

## What DevChronicle Does

DevChronicle MCP provides two essential tools for Bob:

1. **`log_progress`** - Creates or appends timestamped development progress entries to daily devlog files (`docs/devlog/YYYY-MM-DD.md`)
2. **`summarize_project_state`** - Returns a structured summary of the current project by reading local files (README, devlogs, ADRs, docs, git history)

This gives Bob the ability to:
- Track development progress over time
- Remember decisions and context across sessions
- Understand project state without external databases
- Provide informed recommendations based on project history

## Prerequisites

- **Docker Desktop** (Windows, macOS, or Linux)
- No Node.js or npm required on the host machine

## Installation & Setup

### 1. Build the Docker Image

```powershell
docker compose build
```

This builds the Node.js environment with all dependencies.

### 2. Install Dependencies (inside Docker)

```powershell
docker compose run --rm devchronicle-mcp npm install
```

### 3. Build the TypeScript Project

```powershell
docker compose run --rm devchronicle-mcp npm run build
```

### 4. Verify the Server Works

```powershell
docker compose run --rm -T devchronicle-mcp node build/index.js
```

You should see:
```
DevChronicle MCP server running on stdio
```

Press `Ctrl+C` to stop.

## How Bob Connects

Bob needs to be configured to start the MCP server through Docker. See the detailed setup guide:

📖 **[Docker MCP Setup Guide](docs/DOCKER_MCP_SETUP.md)**

### Quick Configuration

Copy `.Bob/mcp.docker.example.json` to `.Bob/mcp.json` (or merge with your existing config):

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
      "description": "DevChronicle MCP - Persistent project memory"
    }
  }
}
```

After configuration, restart Bob or reload the MCP configuration.

## Docker Commands Reference

### Development Workflow

```powershell
# Build the Docker image
docker compose build

# Install dependencies
docker compose run --rm devchronicle-mcp npm install

# Build TypeScript
docker compose run --rm devchronicle-mcp npm run build

# Run the MCP server
docker compose run --rm -T devchronicle-mcp node build/index.js

# Watch mode (auto-rebuild on changes)
docker compose run --rm devchronicle-mcp npm run dev
```

### Troubleshooting

```powershell
# Check if Docker is running
docker ps

# View Docker images
docker images | Select-String devchronicle

# Clean up containers
docker compose down

# Rebuild from scratch
docker compose build --no-cache
```

## Example Bob Prompts

### Using `log_progress`

**Prompt:**
> "Bob, log today's progress. I completed the MCP server implementation, changed files include src/index.ts and src/tools/*.ts, decided to use Zod for validation, no blockers, and next steps are to test with real devlogs."

Bob will use the `log_progress` tool to create/append to `docs/devlog/2026-05-16.md` with a structured entry.

**Another example:**
> "Log progress: finished the authentication module, modified auth.ts and middleware.ts, decided to use JWT tokens, blocked by missing test data, next I need to write unit tests."

### Using `summarize_project_state`

**Prompt:**
> "Bob, what's the current state of this project?"

Bob will use `summarize_project_state` to read all available documentation and return:
- Project name and goal
- Recent progress from devlogs and git
- Known decisions from ADRs
- Open next steps
- Notable files
- Any warnings (missing docs, etc.)

**Another example:**
> "Give me a summary of what we've been working on and what decisions have been made."

## Project Structure

```
devchronicle-mcp/
├── .Bob/
│   ├── mcp.json                      # Bob MCP configuration (user-specific)
│   └── mcp.docker.example.json       # Example Docker MCP config
├── docs/
│   ├── DOCKER_MCP_SETUP.md           # Detailed Docker setup guide
│   ├── devlog/                       # Daily development logs (auto-created)
│   └── adr/                          # Architecture Decision Records
├── src/
│   ├── index.ts                      # Main MCP server
│   ├── schemas.ts                    # Zod schemas for tool inputs
│   ├── core/
│   │   ├── files.ts                  # File system utilities
│   │   ├── git.ts                    # Git history reading
│   │   └── markdown.ts               # Markdown generation
│   └── tools/
│       ├── logProgress.ts            # log_progress tool implementation
│       └── summarizeProjectState.ts  # summarize_project_state tool
├── Dockerfile                        # Docker image definition
├── docker-compose.yml                # Docker Compose configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Design Principles

- **Local-only**: No external APIs, cloud services, or databases
- **Deterministic**: Tools produce consistent, predictable outputs
- **Simple**: Focused on Milestone 1 functionality only
- **Bob-centric**: Designed to enhance Bob's capabilities as a development assistant
- **Docker-first**: No host dependencies beyond Docker

## Milestone 1 Scope

This implementation includes only the core functionality:
- ✅ `log_progress` tool with full schema
- ✅ `summarize_project_state` tool
- ✅ Local file operations (no external dependencies)
- ✅ Git history reading
- ✅ Markdown generation
- ✅ Docker-based development and runtime
- ✅ Project-level MCP configuration

**Not included in Milestone 1:**
- Risk analysis tools
- ADR creation tools
- Feature recommendation tools
- UI/dashboards
- Deployment automation

## Why Docker?

This project uses Docker to:
1. **Eliminate host dependencies** - No need to install Node.js/npm on your machine
2. **Ensure consistency** - Same environment for all developers
3. **Simplify setup** - One command to build, one to run
4. **Isolate dependencies** - Keep your host system clean

## License

MIT
