#!/bin/sh
# Portable MCP launcher for Linux/macOS
# Resolves project root dynamically and launches Docker MCP server
# IMPORTANT: Only MCP JSON-RPC protocol should go to stdout
# All diagnostics/errors must go to stderr

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Resolve project root (one level up from scripts/)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

IMAGE_NAME="devchronicle-mcp:latest"

# Check if Docker is running (all output to stderr)
if ! docker ps >/dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again." >&2
    exit 1
fi

# Check if the Docker image exists, build if not
if ! docker images -q "$IMAGE_NAME" 2>/dev/null | grep -q .; then
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
# -v: Mount target repository for analysis
# -w: Set working directory to the target repository
# CRITICAL: Only this process's stdout should pass through
exec docker run --rm -i \
    -v "$PROJECT_ROOT:/target" \
    -w /target \
    -e GIT_CONFIG_COUNT=1 \
    -e GIT_CONFIG_KEY_0=safe.directory \
    -e GIT_CONFIG_VALUE_0=/target \
    -e DEVCHRONICLE_PROJECT_NAME="$PROJECT_NAME" \
    "$IMAGE_NAME" node /workspace/build/index.js
