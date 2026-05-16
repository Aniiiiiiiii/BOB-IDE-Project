# ADR 0002: STDIO MCP Server

## Status

Accepted

## Context

IBM Bob needs to communicate with the DevChronicle MCP server to access tools for logging progress, summarizing project state, and analyzing change risks. The Model Context Protocol (MCP) supports multiple transport mechanisms:

1. **STDIO (Standard Input/Output)**: Server reads from stdin and writes to stdout
2. **HTTP/SSE**: Server runs as HTTP endpoint with Server-Sent Events
3. **WebSocket**: Server uses WebSocket for bidirectional communication

We needed to choose a transport that would:
- Work reliably with IBM Bob's MCP client
- Be simple to implement and debug
- Work well with Docker containers
- Avoid network complexity and port management
- Support local-only operation (no external network access)

## Decision

We will use STDIO as the transport mechanism for the DevChronicle MCP server:

1. **Server Implementation**: Uses `StdioServerTransport` from `@modelcontextprotocol/sdk`
2. **Communication**: Server reads JSON-RPC messages from stdin, writes responses to stdout
3. **Logging**: Server logs to stderr (not stdout) to avoid interfering with protocol messages
4. **Docker Integration**: Use `-T` flag with `docker compose run` to disable TTY allocation

The server startup code:
```typescript
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("DevChronicle MCP server running on stdio");
```

## Consequences

### Positive

- **Simple**: No network configuration, ports, or HTTP servers required
- **Secure**: No network exposure, all communication is local
- **Reliable**: Direct process communication is more reliable than network protocols
- **Debuggable**: Easy to test with manual JSON input/output
- **Docker-friendly**: STDIO works naturally with Docker containers

### Negative

- **Single client**: STDIO only supports one client at a time (not an issue for Bob)
- **Process-bound**: Server must be started for each Bob session
- **No persistence**: Server state is lost when process exits (acceptable for our use case)

### Neutral

- **TTY handling**: Must use `-T` flag with Docker to disable pseudo-TTY, which would interfere with STDIO protocol
- **Logging**: Must use stderr for all logging to keep stdout clean for protocol messages

## Implementation Notes

- All server logs use `console.error()` to write to stderr
- Bob's MCP client handles starting/stopping the server process
- The `-T` flag in Docker command is critical: `docker compose run --rm -T devchronicle-mcp node build/index.js`
- Server responds to standard MCP protocol messages: `initialize`, `tools/list`, `tools/call`

## Alternatives Considered

### HTTP/SSE Server

**Pros**: Could support multiple clients, persistent server process
**Cons**: Requires port management, network configuration, more complex setup
**Rejected**: Unnecessary complexity for single-client local use case

### WebSocket Server

**Pros**: Bidirectional communication, could support real-time updates
**Cons**: Requires port management, more complex protocol handling
**Rejected**: STDIO is simpler and sufficient for our needs