#!/bin/sh
# Portable MCP launcher for using DevChronicle from any target repository.
# Put an absolute path to this script in another repo's .Bob/mcp.json.
# The repo Bob is opened in becomes the analysis workspace.
# IMPORTANT: Only MCP JSON-RPC protocol should go to stdout.
# All diagnostics/errors must go to stderr.

# Capture Bob's current working directory before moving to this MCP project.
TARGET_REPO="${DEVCHRONICLE_WORKSPACE:-$(pwd)}"
TARGET_NAME="$(basename "$TARGET_REPO")"

# Get the directory where this script is located.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Resolve DevChronicle project root (one level up from scripts/).
MCP_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to the MCP project root so docker compose uses this compose file.
cd "$MCP_ROOT" || exit 1

IMAGE_NAME="devchronicle-mcp:latest"

# Check if Docker is running (all output to stderr).
if ! docker ps >/dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again." >&2
    exit 1
fi

# Check if the Docker image exists, build if not.
if ! docker images -q "$IMAGE_NAME" 2>/dev/null | grep -q .; then
    echo "Docker image not found. Building..." >&2
    docker compose build >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Error: Failed to build Docker image" >&2
        exit 1
    fi
fi

# Launch MCP server with the target repo mounted as the working directory.
# The MCP code stays inside the image at /workspace/build/index.js.
exec docker run --rm -i \
    -v "$TARGET_REPO:/target" \
    -w /target \
    -e GIT_CONFIG_COUNT=1 \
    -e GIT_CONFIG_KEY_0=safe.directory \
    -e GIT_CONFIG_VALUE_0=/target \
    -e DEVCHRONICLE_PROJECT_NAME="$TARGET_NAME" \
    "$IMAGE_NAME" node /workspace/build/index.js
