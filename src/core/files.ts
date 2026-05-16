import { promises as fs } from "fs";
import path from "path";

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Read a file and return its content, or null if it doesn't exist
 */
export async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * Write content to a file
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, "utf-8");
}

/**
 * Append content to a file
 */
export async function appendFile(filePath: string, content: string): Promise<void> {
  await fs.appendFile(filePath, content, "utf-8");
}

/**
 * List all files in a directory recursively
 */
export async function listFilesRecursive(
  dirPath: string,
  pattern?: RegExp
): Promise<string[]> {
  const files: string[] = [];

  async function scan(currentPath: string) {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile()) {
          if (!pattern || pattern.test(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Ignore directories that can't be read
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error(`Error reading directory ${currentPath}:`, error);
      }
    }
  }

  await scan(dirPath);
  return files;
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get current timestamp in HH:MM format
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Made with Bob
