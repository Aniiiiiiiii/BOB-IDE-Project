import path from "path";
import { FeatureRecommendations } from "../schemas.js";
import { readFileIfExists, listFilesRecursive } from "../core/files.js";
import { extractMarkdownSections } from "../core/markdown.js";

/**
 * Recommend next features based on project state
 * Analyzes README, devlogs, ADRs, package.json, and src/tools
 */
export async function recommendNextFeatures(): Promise<FeatureRecommendations> {
  const recommendations: FeatureRecommendations = {
    reliability: [],
    demo_polish: [],
    testing: [],
    documentation: [],
    future_mcp_features: [],
  };

  // Read key project files
  const readme = await readFileIfExists(path.join(process.cwd(), "README.md"));
  const packageJson = await readFileIfExists(path.join(process.cwd(), "package.json"));
  
  // Scan devlogs
  const devlogDir = path.join(process.cwd(), "docs", "devlog");
  const devlogs = await listFilesRecursive(devlogDir, /\.md$/);
  
  // Scan ADRs
  const adrDir = path.join(process.cwd(), "docs", "adr");
  const adrs = await listFilesRecursive(adrDir, /\.md$/);
  
  // Scan tools
  const toolsDir = path.join(process.cwd(), "src", "tools");
  const tools = await listFilesRecursive(toolsDir, /\.ts$/);

  // Analyze README for missing sections
  if (readme) {
    const { headings } = extractMarkdownSections(readme);
    
    if (!headings.some(h => h.toLowerCase().includes("troubleshoot"))) {
      recommendations.documentation.push("Add troubleshooting section to README");
    }
    
    if (!headings.some(h => h.toLowerCase().includes("example"))) {
      recommendations.demo_polish.push("Add usage examples to README");
    }
    
    if (!headings.some(h => h.toLowerCase().includes("contribut"))) {
      recommendations.documentation.push("Add contributing guidelines");
    }
  }

  // Check for test coverage
  if (packageJson) {
    const pkg = JSON.parse(packageJson);
    const hasTestScript = pkg.scripts && pkg.scripts.test;
    const hasJest = pkg.devDependencies && (pkg.devDependencies.jest || pkg.devDependencies.vitest);
    
    if (!hasTestScript) {
      recommendations.testing.push("Add test script to package.json");
    }
    
    if (!hasJest) {
      recommendations.testing.push("Add testing framework (Jest or Vitest)");
    }
    
    // Check for linting
    const hasLint = pkg.scripts && pkg.scripts.lint;
    if (!hasLint) {
      recommendations.reliability.push("Add ESLint for code quality");
    }
  }

  // Check for test files
  const testFiles = await listFilesRecursive(process.cwd(), /\.(test|spec)\.(ts|js)$/);
  if (testFiles.length === 0) {
    recommendations.testing.push("Create unit tests for core functions");
    recommendations.testing.push("Create integration tests for MCP tools");
  }

  // Analyze devlogs for patterns
  let hasRecentBlockers = false;
  for (const devlogPath of devlogs.slice(-3)) { // Check last 3 devlogs
    const content = await readFileIfExists(devlogPath);
    if (content && content.includes("🚧 Blockers")) {
      hasRecentBlockers = true;
      break;
    }
  }
  
  if (hasRecentBlockers) {
    recommendations.reliability.push("Review and resolve recent blockers from devlogs");
  }

  // Check ADR coverage
  if (adrs.length === 0) {
    recommendations.documentation.push("Create ADRs for key architectural decisions");
  } else if (adrs.length < 3) {
    recommendations.documentation.push("Document more architectural decisions as ADRs");
  }

  // Analyze existing tools for patterns
  const toolNames = tools.map(t => path.basename(t, ".ts"));
  
  // Suggest reliability improvements
  if (!toolNames.includes("validateInput")) {
    recommendations.reliability.push("Add input validation helpers");
  }
  
  recommendations.reliability.push("Add error recovery mechanisms");
  recommendations.reliability.push("Implement retry logic for file operations");

  // Demo polish suggestions
  recommendations.demo_polish.push("Create interactive demo script");
  recommendations.demo_polish.push("Add ASCII art or visual separators in output");
  recommendations.demo_polish.push("Improve tool output formatting");

  // Testing suggestions
  if (testFiles.length < tools.length) {
    recommendations.testing.push("Achieve 100% tool coverage with tests");
  }
  recommendations.testing.push("Add smoke tests for all MCP tools");
  recommendations.testing.push("Create end-to-end test scenarios");

  // Documentation suggestions
  recommendations.documentation.push("Add inline code documentation");
  recommendations.documentation.push("Create API reference documentation");
  recommendations.documentation.push("Document error codes and messages");

  // Future MCP feature suggestions
  recommendations.future_mcp_features.push("Add tool for generating project reports");
  recommendations.future_mcp_features.push("Add tool for analyzing code complexity");
  recommendations.future_mcp_features.push("Add tool for tracking technical debt");
  recommendations.future_mcp_features.push("Add tool for dependency analysis");
  recommendations.future_mcp_features.push("Add tool for generating changelogs");

  // Prioritize based on project state
  // If no tests exist, prioritize testing
  if (testFiles.length === 0) {
    recommendations.testing.unshift("⚠️ PRIORITY: No tests found - start with basic test setup");
  }

  // If no ADRs exist, prioritize documentation
  if (adrs.length === 0) {
    recommendations.documentation.unshift("⚠️ PRIORITY: No ADRs found - document key decisions");
  }

  return recommendations;
}

// Made with Bob
