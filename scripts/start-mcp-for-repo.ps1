#!/usr/bin/env pwsh
# Portable MCP launcher for using DevChronicle from any target repository.
# Put an absolute path to this script in another repo's .Bob/mcp.json.
# The repo Bob is opened in becomes the analysis workspace.
# IMPORTANT: Only MCP JSON-RPC protocol should go to stdout.
# All diagnostics/errors must go to stderr.

# Suppress PowerShell's own error formatting.
$ErrorActionPreference = 'SilentlyContinue'

# Capture Bob's current working directory before moving to this MCP project.
$TargetRepo = if ($env:DEVCHRONICLE_WORKSPACE) { $env:DEVCHRONICLE_WORKSPACE } else { (Get-Location).Path }
$TargetName = Split-Path -Leaf $TargetRepo

# Get the directory where this script is located.
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Resolve DevChronicle project root (one level up from scripts/).
$McpRoot = Split-Path -Parent $ScriptDir

# Change to the MCP project root so docker compose uses this compose file.
Set-Location $McpRoot

$ImageName = "devchronicle-mcp:latest"

# Check if Docker is running (redirect check output to stderr).
$null = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    [Console]::Error.WriteLine("Error: Docker is not running. Please start Docker Desktop and try again.")
    exit 1
}

# Check if the Docker image exists.
$imageExists = docker images -q $ImageName 2>&1
if (-not $imageExists) {
    [Console]::Error.WriteLine("Docker image not found. Building...")
    docker compose build *>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        [Console]::Error.WriteLine("Error: Failed to build Docker image")
        exit 1
    }
}

# Launch MCP server with the target repo mounted as the working directory.
# The MCP code stays inside the image at /workspace/build/index.js.
docker run --rm -i `
    -v "${TargetRepo}:/target" `
    -w /target `
    -e GIT_CONFIG_COUNT=1 `
    -e GIT_CONFIG_KEY_0=safe.directory `
    -e GIT_CONFIG_VALUE_0=/target `
    -e DEVCHRONICLE_PROJECT_NAME="$TargetName" `
    $ImageName node /workspace/build/index.js

exit $LASTEXITCODE
