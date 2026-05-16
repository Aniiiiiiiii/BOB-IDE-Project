#!/usr/bin/env pwsh
# Portable MCP launcher for Windows
# Resolves project root dynamically and launches Docker MCP server

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Resolve project root (one level up from scripts/)
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project root
Push-Location $ProjectRoot

try {
    # Check if Docker is running
    $dockerRunning = docker ps 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    }

    # Check if the Docker image exists, build if not
    $imageExists = docker images -q devchronicle-mcp-devchronicle-mcp 2>$null
    if (-not $imageExists) {
        Write-Error "Docker image not found. Building..."
        docker compose build 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build Docker image"
            exit 1
        }
    }

    # Launch MCP server via direct docker run
    # This avoids docker compose's container lifecycle output pollution
    # -i: Keep STDIN open for STDIO protocol
    # --rm: Remove container after exit
    # -v: Mount project directory and preserve node_modules
    # -w: Set working directory
    docker run --rm -i -v "${ProjectRoot}:/workspace" -v /workspace/node_modules -w /workspace devchronicle-mcp-devchronicle-mcp node build/index.js
    
    $exitCode = $LASTEXITCODE
    Pop-Location
    exit $exitCode
}
catch {
    Write-Error "Failed to start MCP server: $_"
    Pop-Location
    exit 1
}
