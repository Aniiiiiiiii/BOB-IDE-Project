import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Get recent git commit history
 * Returns the last N commits in oneline format
 */
export async function getRecentCommits(count: number = 15): Promise<string[]> {
  try {
    const { stdout } = await execAsync(`git log --oneline -n ${count}`, {
      maxBuffer: 1024 * 1024, // 1MB buffer
    });
    
    return stdout
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);
  } catch (error) {
    // Git not available or not a git repository
    console.error("Git log failed:", error);
    return [];
  }
}

/**
 * Check if the current directory is a git repository
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    await execAsync("git rev-parse --git-dir");
    return true;
  } catch {
    return false;
  }
}
