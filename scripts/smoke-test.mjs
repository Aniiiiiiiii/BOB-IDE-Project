#!/usr/bin/env node

/**
 * Simple smoke test for DevChronicle MCP server
 * Verifies that the server starts and exposes the expected tools
 */

import { spawn } from 'child_process';

const TIMEOUT_MS = 5000;
const EXPECTED_TOOLS = ['log_progress', 'summarize_project_state'];

console.log('🧪 Starting MCP server smoke test...\n');

const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';
let testPassed = false;

// Collect stderr (where the server logs)
server.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// Collect stdout
server.stdout.on('data', (data) => {
  output += data.toString();
});

// Set timeout
const timeout = setTimeout(() => {
  if (!testPassed) {
    console.error('❌ Test timed out after', TIMEOUT_MS, 'ms');
    server.kill();
    process.exit(1);
  }
}, TIMEOUT_MS);

// Wait a bit for server to start
setTimeout(() => {
  // Send a tools/list request
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };
  
  server.stdin.write(JSON.stringify(request) + '\n');
  
  // Wait for response
  setTimeout(() => {
    try {
      // Check if server started
      if (errorOutput.includes('DevChronicle MCP server running on stdio')) {
        console.log('✅ Server started successfully');
      } else {
        console.error('❌ Server did not start properly');
        console.error('stderr:', errorOutput);
        server.kill();
        clearTimeout(timeout);
        process.exit(1);
      }
      
      // Parse response
      const lines = output.split('\n').filter(l => l.trim());
      let foundTools = [];
      
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.result && response.result.tools) {
            foundTools = response.result.tools.map(t => t.name);
            break;
          }
        } catch (e) {
          // Skip non-JSON lines
        }
      }
      
      // Verify tools
      const missingTools = EXPECTED_TOOLS.filter(t => !foundTools.includes(t));
      const extraTools = foundTools.filter(t => !EXPECTED_TOOLS.includes(t));
      
      if (missingTools.length > 0) {
        console.error('❌ Missing expected tools:', missingTools);
        server.kill();
        clearTimeout(timeout);
        process.exit(1);
      }
      
      if (extraTools.length > 0) {
        console.error('❌ Unexpected extra tools found:', extraTools);
        server.kill();
        clearTimeout(timeout);
        process.exit(1);
      }
      
      console.log('✅ All expected tools found:', foundTools);
      console.log('\n🎉 Smoke test passed!');
      
      testPassed = true;
      server.kill();
      clearTimeout(timeout);
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      console.error('stdout:', output);
      console.error('stderr:', errorOutput);
      server.kill();
      clearTimeout(timeout);
      process.exit(1);
    }
  }, 2000);
}, 1000);

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  clearTimeout(timeout);
  process.exit(1);
});

// Made with Bob
