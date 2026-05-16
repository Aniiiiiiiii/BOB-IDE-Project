import { LogProgressInput } from "../schemas.js";
import { getCurrentTimeString } from "./files.js";

/**
 * Generate a markdown section for a progress log entry
 */
export function generateProgressLogSection(input: LogProgressInput): string {
  const timestamp = getCurrentTimeString();
  const sections: string[] = [];

  // Header with timestamp
  sections.push(`## ${timestamp} - ${input.summary}\n`);

  // Completed tasks
  if (input.completed.length > 0) {
    sections.push("### ✅ Completed");
    input.completed.forEach((item) => {
      sections.push(`- ${item}`);
    });
    sections.push("");
  }

  // Changed files
  if (input.changed_files.length > 0) {
    sections.push("### 📝 Changed Files");
    input.changed_files.forEach((file) => {
      sections.push(`- \`${file}\``);
    });
    sections.push("");
  }

  // Decisions
  if (input.decisions.length > 0) {
    sections.push("### 🎯 Decisions");
    input.decisions.forEach((decision) => {
      sections.push(`- ${decision}`);
    });
    sections.push("");
  }

  // Blockers
  if (input.blockers.length > 0) {
    sections.push("### 🚧 Blockers");
    input.blockers.forEach((blocker) => {
      sections.push(`- ${blocker}`);
    });
    sections.push("");
  }

  // Next steps
  if (input.next_steps.length > 0) {
    sections.push("### 📋 Next Steps");
    input.next_steps.forEach((step) => {
      sections.push(`- ${step}`);
    });
    sections.push("");
  }

  sections.push("---\n");

  return sections.join("\n");
}

/**
 * Generate the initial header for a new devlog file
 */
export function generateDevlogHeader(date: string): string {
  return `# Development Log - ${date}\n\n`;
}

/**
 * Parse markdown content to extract key information
 * Simple extraction of headings and list items
 */
export function extractMarkdownSections(content: string): {
  headings: string[];
  listItems: string[];
} {
  const lines = content.split("\n");
  const headings: string[] = [];
  const listItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Extract headings
    if (trimmed.startsWith("#")) {
      const heading = trimmed.replace(/^#+\s*/, "");
      if (heading) {
        headings.push(heading);
      }
    }
    
    // Extract list items
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const item = trimmed.replace(/^[-*]\s*/, "");
      if (item) {
        listItems.push(item);
      }
    }
  }

  return { headings, listItems };
}
