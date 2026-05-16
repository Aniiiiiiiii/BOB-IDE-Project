#!/bin/sh
# Portable MCP launcher for Linux/macOS
# Resolves project root dynamically and launches Docker Compose MCP server

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Resolve project root (one level up from scripts/)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root to ensure docker-compose.yml is found
cd "$PROJECT_ROOT" || exit 1

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again." >&2
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found in project root: $PROJECT_ROOT" >&2
    exit 1
fi

# Launch MCP server via Docker Compose
# -T flag disables TTY for STDIO compatibility
# --rm removes container after exit
exec docker compose run --rm -T devchronicle-mcp node build/index.js

# Made with Bob
