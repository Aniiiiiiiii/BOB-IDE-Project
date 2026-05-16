# ADR 0001: Docker-First MCP Runtime

## Status

Accepted

## Context

During initial development of DevChronicle MCP for the IBM Bob Hackathon, we encountered an environment issue: npm was not installed on the host machine. The project requires Node.js, TypeScript, and various npm packages to build and run the MCP server.

We needed a solution that would:
- Allow development without requiring Node.js/npm on the host
- Ensure consistent environments across different developers
- Simplify the setup process
- Work reliably with IBM Bob's MCP integration

## Decision

We will use a Docker-first approach for the DevChronicle MCP runtime:

1. **Dockerfile**: Uses official Node 20 Alpine image with all dependencies
2. **docker-compose.yml**: Provides development environment with volume mounts
3. **Bob MCP Configuration**: Uses `docker compose run --rm -T devchronicle-mcp node build/index.js` as the startup command
4. **Build Process**: All npm commands (install, build, test) run inside Docker containers

The `.Bob/mcp.json` configuration specifies:
```json
{
  "command": "docker",
  "args": ["compose", "run", "--rm", "-T", "devchronicle-mcp", "node", "build/index.js"]
}
```

## Consequences

### Positive

- **Zero host dependencies**: Only Docker is required on the host machine
- **Consistent environments**: Same Node version and dependencies for all developers
- **Isolated dependencies**: Project dependencies don't pollute the host system
- **Reproducible builds**: Docker ensures builds work the same everywhere
- **Simple setup**: One command to build, one to run

### Negative

- **Docker required**: Users must have Docker Desktop installed and running
- **Slightly slower**: Docker adds a small overhead compared to native execution
- **Volume complexity**: Need to manage volume mounts for live development

### Neutral

- **Bob integration**: Bob must invoke the MCP server through Docker, which adds complexity to the startup command but works reliably with the `-T` flag to disable TTY
- **Build artifacts**: The `build/` directory is created inside the container but also available on the host through volume mounts

## Implementation Notes

- Use `-T` flag with `docker compose run` to disable pseudo-TTY allocation (required for STDIO)
- Use `--rm` flag to automatically remove containers after they exit
- Mount project directory as volume to allow live development
- Preserve `node_modules` in container using volume override