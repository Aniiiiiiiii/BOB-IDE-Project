# DevChronicle MCP

**Project Memory and Change-Risk Intelligence for AI-Assisted Development**

A local Model Context Protocol (MCP) server that gives IBM Bob persistent project memory and intelligent change-risk analysis by reading Markdown devlogs, ADRs (Architecture Decision Records), README/docs, and git history.

**Built for the IBM Bob Hackathon** - This project demonstrates Bob as the core development assistant with deterministic, local-only tools.

## The Problem

AI coding assistants like IBM Bob are powerful, but they lose project context between sessions. They can't remember:
- Why certain architectural decisions were made
- What technologies were chosen and why
- What changes were attempted and failed
- What patterns the team has established

This leads to:
- ❌ Suggesting changes that contradict previous decisions
- ❌ Repeating failed approaches
- ❌ Breaking established patterns
- ❌ Losing institutional knowledge

## The Solution

DevChronicle MCP gives Bob **persistent project memory** through five core capabilities:

### 1. **`log_progress`** - Development History Tracking
Creates timestamped development progress entries in daily devlog files (`docs/devlog/YYYY-MM-DD.md`).

**Example:**
> "Bob, log today's progress: implemented MCP server, changed src/index.ts and src/tools/*.ts, decided to use Zod for validation, no blockers, next step is testing."

### 2. **`summarize_project_state`** - Project Context Awareness
Returns a structured summary by reading local files (README, devlogs, ADRs, docs, git history).

**Example:**
> "Bob, what's the current state of this project?"

Bob responds with:
- Project name and goal
- Recent progress from devlogs and git
- Known decisions from ADRs
- Open next steps
- Notable files
- Warnings about missing documentation

### 3. **`analyze_change_risk`** - Intelligent Change Analysis
Analyzes whether a planned change conflicts with existing project decisions, ADRs, or critical files.

**Example:**
> "Bob, analyze the risk of replacing Docker-based MCP startup with host npm runtime"

Bob responds with:
- **Risk Level:** HIGH/MEDIUM/LOW
- **Detected Conflicts:** Contradicts ADR 0001 (Docker-First Runtime)
- **Evidence:** Specific references to ADRs, devlogs, or files
- **Recommended Questions:** What to consider before proceeding
- **Safer Alternatives:** Suggested approaches with lower risk

### 4. **`create_adr`** - Architecture Decision Records ⭐ NEW
Creates properly formatted ADR documents in `docs/adr/` with automatic numbering.

**Example:**
> "Bob, create an ADR titled 'Use Docker for MCP Runtime', status accepted, context is we need consistent environment, decision is Docker-first approach, consequences are no host npm needed but requires Docker Desktop"

Bob creates `docs/adr/0001-use-docker-for-mcp-runtime.md` with proper formatting.

### 5. **`recommend_next_features`** - Intelligent Feature Planning ⭐ NEW
Analyzes project state and recommends next features grouped by category.

**Example:**
> "Bob, what features should we work on next?"

Bob responds with recommendations in categories:
- **Reliability:** Error handling, retry logic, validation
- **Demo Polish:** Better output formatting, examples
- **Testing:** Unit tests, integration tests, coverage
- **Documentation:** API docs, troubleshooting guides
- **Future MCP Features:** New tools to build

This gives Bob the ability to:
- ✅ Track development progress over time
- ✅ Remember decisions and context across sessions
- ✅ Understand project state without external databases
- ✅ Detect conflicts with previous decisions **before** making changes
- ✅ Provide informed recommendations based on project history
- ✅ Prevent architectural drift and inconsistencies

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

### 4. Run the Smoke Test

```powershell
docker compose run --rm devchronicle-mcp node scripts/smoke-test.mjs
```

This verifies that:
- The server starts successfully
- All five tools are available: `log_progress`, `summarize_project_state`, `analyze_change_risk`, `create_adr`, `recommend_next_features`

You should see:
```
🧪 Starting MCP server smoke test...
✅ Server started successfully
✅ All expected tools found: [ 'log_progress', 'summarize_project_state', 'analyze_change_risk', 'create_adr', 'recommend_next_features' ]
🎉 Smoke test passed!
```

## How Bob Connects

Bob needs to be configured to start the MCP server through Docker. The project includes **portable launcher scripts** that work across collaborators without hardcoded paths.

📖 **[Docker MCP Setup Guide](docs/DOCKER_MCP_SETUP.md)**

### Quick Configuration (Portable)

The recommended approach uses launcher scripts that automatically resolve the project root:

**Windows** - Copy to `.Bob/mcp.json`:

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
      "description": "DevChronicle MCP - Persistent project memory"
    }
  }
}
```

**Linux/macOS** - Copy to `.Bob/mcp.json`:

```json
{
  "mcpServers": {
    "devchronicle": {
      "command": "sh",
      "args": [
        "scripts/start-mcp.sh"
      ],
      "description": "DevChronicle MCP - Persistent project memory"
    }
  }
}
```

**Why launcher scripts?**
- ✅ No hardcoded absolute paths
- ✅ Works on any machine without editing config
- ✅ Handles OneDrive/Unicode paths correctly
- ✅ Team-shareable `.Bob/mcp.json`

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

### Using `analyze_change_risk` ⭐ NEW

**Prompt:**
> "Bob, analyze the risk of replacing Docker-based MCP startup with host npm runtime"

Bob will use `analyze_change_risk` to check for conflicts and return:
- **Risk Level:** HIGH (contradicts ADR 0001: Docker-First Runtime)
- **Detected Conflicts:** Lists specific conflicts with ADRs or decisions
- **Evidence:** References to relevant ADRs, devlogs, or files
- **Recommended Questions:** What to consider before proceeding
- **Safer Alternatives:** Suggested lower-risk approaches

**Another example:**
> "Bob, I'm planning to change these files: .Bob/mcp.json, docker-compose.yml. What's the risk?"

**More examples:**
> "Analyze the risk of migrating from TypeScript to JavaScript"
> "What's the risk of removing the STDIO transport?"

📖 **[See full demo with examples](docs/examples/change-risk-demo.md)**

## Project Structure

```
devchronicle-mcp/
├── .Bob/
│   ├── mcp.json                      # Bob MCP configuration (user-specific)
│   └── mcp.docker.example.json       # Example Docker MCP config
├── docs/
│   ├── DEMO_SCRIPT.md                # 3-minute demo script
│   ├── DOCKER_MCP_SETUP.md           # Detailed Docker setup guide
│   ├── SUBMISSION_CHECKLIST.md       # Hackathon submission guide
│   ├── devlog/                       # Daily development logs (auto-created)
│   ├── adr/                          # Architecture Decision Records
│   └── examples/                     # Demo examples and use cases
├── src/
│   ├── index.ts                      # Main MCP server
│   ├── schemas.ts                    # Zod schemas for tool inputs
│   ├── core/
│   │   ├── files.ts                  # File system utilities
│   │   ├── git.ts                    # Git history reading
│   │   ├── markdown.ts               # Markdown generation
│   │   ├── scanner.ts                # Project documentation scanner
│   │   └── riskRules.ts              # Risk analysis rules engine
│   └── tools/
│       ├── logProgress.ts            # log_progress tool
│       ├── summarizeProjectState.ts  # summarize_project_state tool
│       └── analyzeChangeRisk.ts      # analyze_change_risk tool
├── scripts/
│   ├── smoke-test.mjs                # Automated smoke test
│   └── validate-config.mjs           # MCP config validator
├── Dockerfile                        # Docker image definition
├── docker-compose.yml                # Docker Compose configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Design Principles

- **Local-only**: No external APIs, cloud services, or databases
- **Deterministic**: Tools produce consistent, predictable outputs
- **Bob-centric**: Designed to enhance Bob's capabilities as a development assistant
- **Docker-first**: No host dependencies beyond Docker
- **Hackathon-focused**: Core functionality without unnecessary complexity

## Current MVP Scope

**Current Tools:**
- ✅ **`log_progress`** - Track development progress in daily devlogs
- ✅ **`summarize_project_state`** - Understand project context from docs and git
- ✅ **`analyze_change_risk`** - Detect conflicts with previous decisions

**Implementation Features:**
- ✅ Local file operations (no external dependencies)
- ✅ Git history reading
- ✅ Markdown generation
- ✅ Docker-based development and runtime
- ✅ Project-level MCP configuration

## MCP STDIO Architecture

This MCP server uses the STDIO transport protocol, which has strict requirements:

### Critical STDIO Constraints

**stdout = ONLY JSON-RPC protocol messages**
- The MCP protocol requires stdout to contain ONLY JSON-RPC formatted messages
- Any non-protocol text on stdout will cause protocol errors in Bob

**stderr = All logs, diagnostics, and status messages**
- Startup messages: "DevChronicle MCP server running on stdio"
- Error messages and diagnostics
- Docker/container lifecycle messages

### Why Launcher Scripts?

The launcher scripts (`scripts/start-mcp.ps1` and `scripts/start-mcp.sh`) ensure clean STDIO separation:

1. **Portable path resolution** - No hardcoded absolute paths
2. **Docker runtime isolation** - Uses `docker run` instead of `docker compose` to avoid lifecycle output
3. **stderr routing** - All diagnostic messages go to stderr using `[Console]::Error.WriteLine()` (PowerShell) or `>&2` (shell)
4. **Clean stdout passthrough** - Only the MCP server's JSON-RPC messages reach stdout

### Runtime Flow

```
Bob IDE
  → PowerShell/Shell launcher script
    → docker run (with STDIO passthrough)
      → node build/index.js (MCP server)
        → stdout: JSON-RPC only
        → stderr: logs/diagnostics
```

- ✅ 5 deterministic risk analysis rules
- ✅ ADR integration (2 example ADRs included)
- ✅ Comprehensive validation pipeline

**Future Enhancements (Not Yet Implemented):**
- `create_adr` tool for creating new ADRs
- `recommend_next_features` tool for suggesting next steps
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
