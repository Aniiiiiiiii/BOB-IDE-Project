#!/usr/bin/env pwsh
# Portable MCP launcher for Windows
# Resolves project root dynamically and launches Docker Compose MCP server

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Resolve project root (one level up from scripts/)
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project root to ensure docker-compose.yml is found
Push-Location $ProjectRoot

try {
    # Check if Docker is running
    $dockerRunning = docker ps 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    }

    # Check if docker-compose.yml exists
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Error "docker-compose.yml not found in project root: $ProjectRoot"
        exit 1
    }

    # Launch MCP server via Docker Compose
    # -T flag disables TTY for STDIO compatibility
    # --rm removes container after exit
    docker compose run --rm -T devchronicle-mcp node build/index.js
    
    $exitCode = $LASTEXITCODE
    Pop-Location
    exit $exitCode
}
catch {
    Write-Error "Failed to start MCP server: $_"
    Pop-Location
    exit 1
}

# Made with Bob
