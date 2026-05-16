import path from "path";
import { ProjectStateSummary } from "../schemas.js";
import { readFileIfExists, listFilesRecursive, fileExists } from "../core/files.js";
import { extractMarkdownSections } from "../core/markdown.js";
import { getRecentCommits, isGitRepository } from "../core/git.js";

/**
 * Summarize the current project state by reading local files
 */
export async function summarizeProjectState(): Promise<ProjectStateSummary> {
  const cwd = process.cwd();
  const summary: ProjectStateSummary = {
    project_name: path.basename(cwd),
    apparent_goal: "",
    recent_progress: [],
    known_decisions: [],
    open_next_steps: [],
    notable_files: [],
    warnings: [],
  };

  // Read README.md
  const readmePath = path.join(cwd, "README.md");
  const readmeContent = await readFileIfExists(readmePath);
  if (readmeContent) {
    summary.notable_files.push("README.md");
    // Extract first paragraph as apparent goal
    const lines = readmeContent.split("\n").filter((l) => l.trim().length > 0);
    for (const line of lines) {
      if (!line.startsWith("#") && line.length > 20) {
        summary.apparent_goal = line.trim();
        break;
      }
    }
  } else {
    summary.warnings.push("No README.md found");
  }

  // Read AGENTS.md
  const agentsPath = path.join(cwd, "AGENTS.md");
  const agentsContent = await readFileIfExists(agentsPath);
  if (agentsContent) {
    summary.notable_files.push("AGENTS.md");
  }

  // Read devlogs
  const devlogDir = path.join(cwd, "docs", "devlog");
  const devlogExists = await fileExists(devlogDir);
  if (devlogExists) {
    const devlogFiles = await listFilesRecursive(devlogDir, /\.md$/);
    devlogFiles.sort().reverse(); // Most recent first
    
    for (const file of devlogFiles.slice(0, 3)) {
      // Read last 3 devlogs
      const content = await readFileIfExists(file);
      if (content) {
        const { headings, listItems } = extractMarkdownSections(content);
        summary.recent_progress.push(
          ...headings.slice(0, 5).map((h) => `${path.basename(file)}: ${h}`)
        );
        
        // Extract next steps from list items
        listItems.forEach((item) => {
          if (
            item.toLowerCase().includes("next") ||
            item.toLowerCase().includes("todo") ||
            item.toLowerCase().includes("plan")
          ) {
            summary.open_next_steps.push(item);
          }
        });
      }
    }
    
    if (devlogFiles.length > 0) {
      summary.notable_files.push(`docs/devlog/ (${devlogFiles.length} files)`);
    }
  }

  // Read ADRs
  const adrDir = path.join(cwd, "docs", "adr");
  const adrExists = await fileExists(adrDir);
  if (adrExists) {
    const adrFiles = await listFilesRecursive(adrDir, /\.md$/);
    
    for (const file of adrFiles) {
      const content = await readFileIfExists(file);
      if (content) {
        const { headings } = extractMarkdownSections(content);
        if (headings.length > 0) {
          summary.known_decisions.push(`${path.basename(file)}: ${headings[0]}`);
        }
      }
    }
    
    if (adrFiles.length > 0) {
      summary.notable_files.push(`docs/adr/ (${adrFiles.length} files)`);
    }
  }

  // Read other docs
  const docsDir = path.join(cwd, "docs");
  const docsExists = await fileExists(docsDir);
  if (docsExists) {
    const docFiles = await listFilesRecursive(docsDir, /\.md$/);
    const otherDocs = docFiles.filter(
      (f) => !f.includes("devlog") && !f.includes("adr")
    );
    
    if (otherDocs.length > 0) {
      summary.notable_files.push(`docs/ (${otherDocs.length} other files)`);
    }
  }

  // Get git history
  const isGit = await isGitRepository();
  if (isGit) {
    const commits = await getRecentCommits(15);
    if (commits.length > 0) {
      summary.recent_progress.push(
        ...commits.slice(0, 5).map((c) => `Git: ${c}`)
      );
    }
  } else {
    summary.warnings.push("Not a git repository");
  }

  // Add warnings if no progress found
  if (summary.recent_progress.length === 0) {
    summary.warnings.push("No recent progress found in devlogs or git history");
  }

  if (summary.known_decisions.length === 0) {
    summary.warnings.push("No ADRs found");
  }

  return summary;
}
