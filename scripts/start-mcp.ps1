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
$ProjectName = Split-Path -Leaf $ProjectRoot

# Change to project root
Set-Location $ProjectRoot

$ImageName = "devchronicle-mcp:latest"

# Check if Docker is running (redirect check output to stderr)
$null = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    [Console]::Error.WriteLine("Error: Docker is not running. Please start Docker Desktop and try again.")
    exit 1
}

# Check if the Docker image exists
$imageExists = docker images -q $ImageName 2>&1
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
# -v: Mount target repository for analysis
# -w: Set working directory to the target repository
# CRITICAL: Only this process's stdout should pass through
docker run --rm -i `
    -v "${ProjectRoot}:/target" `
    -w /target `
    -e GIT_CONFIG_COUNT=1 `
    -e GIT_CONFIG_KEY_0=safe.directory `
    -e GIT_CONFIG_VALUE_0=/target `
    -e DEVCHRONICLE_PROJECT_NAME="$ProjectName" `
    $ImageName node /workspace/build/index.js

exit $LASTEXITCODE
