import path from "path";
import { CreateAdrInput } from "../schemas.js";
import {
  ensureDir,
  getTodayDateString,
  listFilesRecursive,
  writeFile,
  fileExists,
} from "../core/files.js";

/**
 * Create an Architecture Decision Record (ADR) in docs/adr/
 * Format: NNNN-kebab-case-title.md
 */
export async function createAdr(input: CreateAdrInput): Promise<{
  path: string;
  summary: string;
}> {
  // Ensure the ADR directory exists
  const adrDir = path.join(process.cwd(), "docs", "adr");
  await ensureDir(adrDir);

  // Find the next ADR number by scanning existing ADRs
  const existingAdrs = await listFilesRecursive(adrDir, /\.md$/);
  let nextNumber = 1;

  for (const adrPath of existingAdrs) {
    const filename = path.basename(adrPath);
    const match = filename.match(/^(\d{4})-/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= nextNumber) {
        nextNumber = num + 1;
      }
    }
  }

  // Convert title to kebab-case
  const kebabTitle = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Format the ADR number with leading zeros
  const adrNumber = String(nextNumber).padStart(4, "0");
  const filename = `${adrNumber}-${kebabTitle}.md`;
  const filePath = path.join(adrDir, filename);

  // Check if file already exists (shouldn't happen, but be safe)
  if (await fileExists(filePath)) {
    throw new Error(`ADR file already exists: ${filename}`);
  }

  // Get today's date
  const dateString = getTodayDateString();

  // Generate ADR content
  const content = generateAdrContent(
    adrNumber,
    input.title,
    dateString,
    input.status,
    input.context,
    input.decision,
    input.consequences
  );

  // Write the ADR file
  await writeFile(filePath, content);

  return {
    path: filePath,
    summary: `Created ADR ${adrNumber}: ${input.title} (${input.status})`,
  };
}

/**
 * Generate the markdown content for an ADR
 */
function generateAdrContent(
  number: string,
  title: string,
  date: string,
  status: string,
  context: string,
  decision: string,
  consequences: string[]
): string {
  const sections: string[] = [];

  sections.push(`# ${number}. ${title}\n`);
  sections.push(`**Date:** ${date}\n`);
  sections.push(`**Status:** ${status}\n`);
  sections.push(`## Context\n`);
  sections.push(`${context}\n`);
  sections.push(`## Decision\n`);
  sections.push(`${decision}\n`);
  sections.push(`## Consequences\n`);

  consequences.forEach((consequence) => {
    sections.push(`- ${consequence}`);
  });

  sections.push("");

  return sections.join("\n");
}

// Made with Bob
