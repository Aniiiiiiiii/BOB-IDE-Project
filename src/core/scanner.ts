import path from "path";
import { readFileIfExists, listFilesRecursive, fileExists } from "./files.js";

/**
 * Scanner utilities for reading project documentation
 */

export interface ScannedProject {
  readme: string | null;
  agents: string | null;
  devlogs: string[];
  adrs: string[];
  docs: string[];
  packageJson: string | null;
}

/**
 * Scan the project directory for documentation files
 */
export async function scanProjectDocs(): Promise<ScannedProject> {
  const cwd = process.cwd();
  
  // Read README.md
  const readme = await readFileIfExists(path.join(cwd, "README.md"));
  
  // Read AGENTS.md
  const agents = await readFileIfExists(path.join(cwd, "AGENTS.md"));
  
  // Read package.json
  const packageJson = await readFileIfExists(path.join(cwd, "package.json"));
  
  // Read devlogs
  const devlogs: string[] = [];
  const devlogDir = path.join(cwd, "docs", "devlog");
  if (await fileExists(devlogDir)) {
    const devlogFiles = await listFilesRecursive(devlogDir, /\.md$/);
    for (const file of devlogFiles) {
      const content = await readFileIfExists(file);
      if (content) {
        devlogs.push(content);
      }
    }
  }
  
  // Read ADRs
  const adrs: string[] = [];
  const adrDir = path.join(cwd, "docs", "adr");
  if (await fileExists(adrDir)) {
    const adrFiles = await listFilesRecursive(adrDir, /\.md$/);
    for (const file of adrFiles) {
      const content = await readFileIfExists(file);
      if (content) {
        adrs.push(content);
      }
    }
  }
  
  // Read other docs
  const docs: string[] = [];
  const docsDir = path.join(cwd, "docs");
  if (await fileExists(docsDir)) {
    const docFiles = await listFilesRecursive(docsDir, /\.md$/);
    // Filter out devlogs and ADRs
    const otherDocs = docFiles.filter(
      f => !f.includes("devlog") && !f.includes("adr")
    );
    for (const file of otherDocs) {
      const content = await readFileIfExists(file);
      if (content) {
        docs.push(content);
      }
    }
  }
  
  return {
    readme,
    agents,
    devlogs,
    adrs,
    docs,
    packageJson,
  };
}

/**
 * Extract key information from scanned documents
 */
export function extractKeyInfo(scanned: ScannedProject): {
  technologies: string[];
  decisions: string[];
  warnings: string[];
} {
  const technologies: Set<string> = new Set();
  const decisions: string[] = [];
  const warnings: string[] = [];
  
  // Extract technologies from README
  if (scanned.readme) {
    const techKeywords = ["docker", "typescript", "node", "mcp", "zod", "npm"];
    techKeywords.forEach(tech => {
      if (scanned.readme!.toLowerCase().includes(tech)) {
        technologies.add(tech);
      }
    });
  }
  
  // Extract decisions from ADRs
  scanned.adrs.forEach((adr) => {
    const lines = adr.split("\n");
    let title = "";
    let status = "";
    
    lines.forEach((line) => {
      if (line.startsWith("#") && !title) {
        title = line.replace(/^#+\s*/, "").trim();
      }
      if (line.toLowerCase().includes("status:")) {
        status = line.split(":")[1]?.trim() || "";
      }
    });
    
    if (title && status) {
      decisions.push(`${title} (${status})`);
    }
  });
  
  // Check for warnings
  if (!scanned.readme) {
    warnings.push("No README.md found");
  }
  if (scanned.adrs.length === 0) {
    warnings.push("No ADRs found");
  }
  if (scanned.devlogs.length === 0) {
    warnings.push("No devlogs found");
  }
  
  return {
    technologies: Array.from(technologies),
    decisions,
    warnings,
  };
}

// Made with Bob
