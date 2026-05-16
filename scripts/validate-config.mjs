#!/usr/bin/env node

/**
 * Validate DevChronicle MCP configuration files
 * Ensures .Bob/mcp.json is valid JSON and properly configured for Docker
 */

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Validating MCP configuration...\n');

let hasErrors = false;

// Validate .Bob/mcp.json
try {
  const mcpConfigPath = join(process.cwd(), '.Bob', 'mcp.json');
  const mcpConfigContent = readFileSync(mcpConfigPath, 'utf-8');
  
  // Parse as JSON
  let mcpConfig;
  try {
    mcpConfig = JSON.parse(mcpConfigContent);
    console.log('✅ .Bob/mcp.json is valid JSON');
  } catch (parseError) {
    console.error('❌ .Bob/mcp.json contains invalid JSON syntax');
    console.error('   Error:', parseError.message);
    hasErrors = true;
  }
  
  if (mcpConfig) {
    // Check structure
    if (!mcpConfig.mcpServers) {
      console.error('❌ .Bob/mcp.json missing "mcpServers" property');
      hasErrors = true;
    } else if (!mcpConfig.mcpServers.devchronicle) {
      console.error('❌ .Bob/mcp.json missing "mcpServers.devchronicle" server');
      hasErrors = true;
    } else {
      console.log('✅ .Bob/mcp.json has mcpServers.devchronicle');
      
      const devchronicle = mcpConfig.mcpServers.devchronicle;
      
      // Check command
      if (devchronicle.command !== 'docker') {
        console.error('❌ .Bob/mcp.json command should be "docker", got:', devchronicle.command);
        hasErrors = true;
      } else {
        console.log('✅ .Bob/mcp.json command is "docker"');
      }
      
      // Check args
      if (!Array.isArray(devchronicle.args)) {
        console.error('❌ .Bob/mcp.json args should be an array');
        hasErrors = true;
      } else {
        const requiredArgs = ['compose', 'run', '--rm', '-T', 'devchronicle-mcp', 'node', 'build/index.js'];
        const argsString = devchronicle.args.join(' ');
        
        let missingArgs = [];
        for (const arg of requiredArgs) {
          if (!devchronicle.args.includes(arg)) {
            missingArgs.push(arg);
          }
        }
        
        if (missingArgs.length > 0) {
          console.error('❌ .Bob/mcp.json args missing required arguments:', missingArgs);
          hasErrors = true;
        } else {
          console.log('✅ .Bob/mcp.json args include all required Docker compose arguments');
        }
      }
      
      // Check cwd
      if (devchronicle.cwd !== '.') {
        console.warn('⚠️  .Bob/mcp.json cwd is not "." - this may cause issues');
      } else {
        console.log('✅ .Bob/mcp.json cwd is "."');
      }
    }
  }
} catch (error) {
  console.error('❌ Failed to read .Bob/mcp.json:', error.message);
  hasErrors = true;
}

// Validate .Bob/mcp.docker.example.json if it exists
try {
  const examplePath = join(process.cwd(), '.Bob', 'mcp.docker.example.json');
  const exampleContent = readFileSync(examplePath, 'utf-8');
  
  try {
    JSON.parse(exampleContent);
    console.log('✅ .Bob/mcp.docker.example.json is valid JSON');
  } catch (parseError) {
    console.error('❌ .Bob/mcp.docker.example.json contains invalid JSON syntax');
    console.error('   Error:', parseError.message);
    hasErrors = true;
  }
} catch (error) {
  // File doesn't exist, that's okay
  console.log('ℹ️  .Bob/mcp.docker.example.json not found (optional)');
}

// Final result
console.log();
if (hasErrors) {
  console.error('❌ Configuration validation failed');
  process.exit(1);
} else {
  console.log('🎉 Configuration validation passed!');
  process.exit(0);
}

// Made with Bob
