import path from "path";
import { LogProgressInput } from "../schemas.js";
import {
  ensureDir,
  getTodayDateString,
  readFileIfExists,
  writeFile,
  appendFile,
} from "../core/files.js";
import {
  generateProgressLogSection,
  generateDevlogHeader,
} from "../core/markdown.js";

/**
 * Log development progress to a daily devlog file
 * Creates or appends to docs/devlog/YYYY-MM-DD.md
 */
export async function logProgress(input: LogProgressInput): Promise<string> {
  // Ensure the devlog directory exists
  const devlogDir = path.join(process.cwd(), "docs", "devlog");
  await ensureDir(devlogDir);

  // Get today's date and construct file path
  const dateString = getTodayDateString();
  const filePath = path.join(devlogDir, `${dateString}.md`);

  // Check if file exists
  const existingContent = await readFileIfExists(filePath);

  // Generate the new log section
  const logSection = generateProgressLogSection(input);

  if (existingContent === null) {
    // Create new file with header and first entry
    const header = generateDevlogHeader(dateString);
    const content = header + logSection;
    await writeFile(filePath, content);
  } else {
    // Append to existing file
    await appendFile(filePath, "\n" + logSection);
  }

  return filePath;
}

// Made with Bob
