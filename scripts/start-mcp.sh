#!/bin/sh
# Portable MCP launcher for Linux/macOS
# Resolves project root dynamically and launches Docker MCP server
# IMPORTANT: Only MCP JSON-RPC protocol should go to stdout
# All diagnostics/errors must go to stderr

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Resolve project root (one level up from scripts/)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

# Check if Docker is running (all output to stderr)
if ! docker ps >/dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again." >&2
    exit 1
fi

# Check if the Docker image exists, build if not
if ! docker images -q devchronicle-mcp-devchronicle-mcp 2>/dev/null | grep -q .; then
    echo "Docker image not found. Building..." >&2
    docker compose build >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Error: Failed to build Docker image" >&2
        exit 1
    fi
fi

# Launch MCP server via direct docker run
# This avoids docker compose's container lifecycle output pollution
# -i: Keep STDIN open for STDIO protocol
# --rm: Remove container after exit
# -v: Mount project directory and preserve node_modules
# -w: Set working directory
# CRITICAL: Only this process's stdout should pass through
exec docker run --rm -i -v "$PROJECT_ROOT:/workspace" -v /workspace/node_modules -w /workspace devchronicle-mcp-devchronicle-mcp node build/index.js
