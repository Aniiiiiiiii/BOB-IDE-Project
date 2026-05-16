#!/usr/bin/env pwsh
# Portable MCP launcher for Windows
# Resolves project root dynamically and launches Docker MCP server
# IMPORTANT: Only MCP JSON-RPC protocol should go to stdout
# All diagnostics/errors must go to stderr

# Suppress PowerShell's own error formatting
$ErrorActionPreference = 'SilentlyContinue'

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Resolve project root (one level up from scripts/)
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project root
Set-Location $ProjectRoot

# Check if Docker is running (redirect check output to stderr)
$null = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    [Console]::Error.WriteLine("Error: Docker is not running. Please start Docker Desktop and try again.")
    exit 1
}

# Check if the Docker image exists
$imageExists = docker images -q devchronicle-mcp-devchronicle-mcp 2>&1
if (-not $imageExists) {
    [Console]::Error.WriteLine("Docker image not found. Building...")
    docker compose build *>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        [Console]::Error.WriteLine("Error: Failed to build Docker image")
        exit 1
    }
}

# Launch MCP server via direct docker run
# This avoids docker compose's container lifecycle output pollution
# -i: Keep STDIN open for STDIO protocol
# --rm: Remove container after exit
# -v: Mount project directory and preserve node_modules
# -w: Set working directory
# CRITICAL: Only this process's stdout should pass through
docker run --rm -i -v "${ProjectRoot}:/workspace" -v /workspace/node_modules -w /workspace devchronicle-mcp-devchronicle-mcp node build/index.js

exit $LASTEXITCODE
