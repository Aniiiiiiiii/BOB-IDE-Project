import { z } from "zod";

// Milestone 1: log_progress tool schema
export const LogProgressSchema = z.object({
  summary: z.string().describe("Brief summary of what was accomplished"),
  completed: z.array(z.string()).describe("List of completed tasks"),
  changed_files: z.array(z.string()).describe("List of files that were modified"),
  decisions: z.array(z.string()).describe("Key decisions made during this session"),
  blockers: z.array(z.string()).describe("Current blockers or issues"),
  next_steps: z.array(z.string()).describe("Planned next steps"),
});

export type LogProgressInput = z.infer<typeof LogProgressSchema>;

// Milestone 1: summarize_project_state tool (no input needed)
export const SummarizeProjectStateSchema = z.object({});

export type SummarizeProjectStateInput = z.infer<typeof SummarizeProjectStateSchema>;

// Output type for summarize_project_state
export interface ProjectStateSummary {
  project_name: string;
  apparent_goal: string;
  recent_progress: string[];
  known_decisions: string[];
  open_next_steps: string[];
  notable_files: string[];
  warnings: string[];
}

// Milestone 2: analyze_change_risk tool schema
export const AnalyzeChangeRiskSchema = z.object({
  planned_change: z.string().describe("Description of the planned change"),
  changed_files: z.array(z.string()).optional().describe("Optional list of files that will be changed"),
});

export type AnalyzeChangeRiskInput = z.infer<typeof AnalyzeChangeRiskSchema>;

// Output type for analyze_change_risk
export interface ChangeRiskAnalysis {
  risk_level: "low" | "medium" | "high";
  summary: string;
  detected_conflicts: string[];
  affected_files: string[];
  evidence: string[];
  recommended_questions: string[];
  safer_alternatives: string[];
}
