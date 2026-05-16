import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { LogProgressSchema, SummarizeProjectStateSchema, AnalyzeChangeRiskSchema } from "./schemas.js";
import { logProgress } from "./tools/logProgress.js";
import { summarizeProjectState } from "./tools/summarizeProjectState.js";
import { analyzeChangeRisk } from "./tools/analyzeChangeRisk.js";

const server = new Server(
  {
    name: "devchronicle-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "log_progress",
        description:
          "Create or append a development progress log to docs/devlog/YYYY-MM-DD.md. " +
          "Records completed tasks, changed files, decisions, blockers, and next steps.",
        inputSchema: {
          type: "object",
          properties: {
            summary: {
              type: "string",
              description: "Brief summary of what was accomplished",
            },
            completed: {
              type: "array",
              items: { type: "string" },
              description: "List of completed tasks",
            },
            changed_files: {
              type: "array",
              items: { type: "string" },
              description: "List of files that were modified",
            },
            decisions: {
              type: "array",
              items: { type: "string" },
              description: "Key decisions made during this session",
            },
            blockers: {
              type: "array",
              items: { type: "string" },
              description: "Current blockers or issues",
            },
            next_steps: {
              type: "array",
              items: { type: "string" },
              description: "Planned next steps",
            },
          },
          required: [
            "summary",
            "completed",
            "changed_files",
            "decisions",
            "blockers",
            "next_steps",
          ],
        },
      },
      {
        name: "summarize_project_state",
        description:
          "Return a structured summary of the current project state by reading " +
          "README.md, AGENTS.md, devlogs, ADRs, docs, and git history. " +
          "Provides project name, goal, recent progress, decisions, next steps, notable files, and warnings.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "analyze_change_risk",
        description:
          "Analyze the risk of a planned change by checking for conflicts with existing " +
          "project decisions, devlogs, ADRs, and critical files. Returns risk level, " +
          "detected conflicts, evidence, recommended questions, and safer alternatives.",
        inputSchema: {
          type: "object",
          properties: {
            planned_change: {
              type: "string",
              description: "Description of the planned change",
            },
            changed_files: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of files that will be changed",
            },
          },
          required: ["planned_change"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "log_progress": {
        // Validate input with Zod
        const input = LogProgressSchema.parse(args);
        const filePath = await logProgress(input);
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Progress logged successfully to: ${filePath}\n\nSummary: ${input.summary}`,
            },
          ],
        };
      }

      case "summarize_project_state": {
        // Validate input (empty object is fine)
        SummarizeProjectStateSchema.parse(args);
        const summary = await summarizeProjectState();
        
        // Format the summary as readable text
        const sections = [
          `# Project State Summary\n`,
          `**Project:** ${summary.project_name}`,
          `**Goal:** ${summary.apparent_goal || "Not specified"}\n`,
        ];

        if (summary.recent_progress.length > 0) {
          sections.push(`## 📈 Recent Progress`);
          summary.recent_progress.forEach((item) => {
            sections.push(`- ${item}`);
          });
          sections.push("");
        }

        if (summary.known_decisions.length > 0) {
          sections.push(`## 🎯 Known Decisions`);
          summary.known_decisions.forEach((item) => {
            sections.push(`- ${item}`);
          });
          sections.push("");
        }

        if (summary.open_next_steps.length > 0) {
          sections.push(`## 📋 Open Next Steps`);
          summary.open_next_steps.forEach((item) => {
            sections.push(`- ${item}`);
          });
          sections.push("");
        }

        if (summary.notable_files.length > 0) {
          sections.push(`## 📁 Notable Files`);
          summary.notable_files.forEach((item) => {
            sections.push(`- ${item}`);
          });
          sections.push("");
        }

        if (summary.warnings.length > 0) {
          sections.push(`## ⚠️ Warnings`);
          summary.warnings.forEach((item) => {
            sections.push(`- ${item}`);
          });
          sections.push("");
        }

        return {
          content: [
            {
              type: "text",
              text: sections.join("\n"),
            },
          ],
        };
      }

      case "analyze_change_risk": {
        // Validate input with Zod
        const input = AnalyzeChangeRiskSchema.parse(args);
        const analysis = await analyzeChangeRisk(input);
        
        // Format the analysis as readable text
        const sections = [
          `# Change Risk Analysis\n`,
          `**Risk Level:** ${analysis.risk_level.toUpperCase()}`,
          `**Summary:** ${analysis.summary}\n`,
        ];

        if (analysis.detected_conflicts.length > 0) {
          sections.push(`## ⚠️ Detected Conflicts`);
          analysis.detected_conflicts.forEach((conflict) => {
            sections.push(`- ${conflict}`);
          });
          sections.push("");
        }

        if (analysis.affected_files.length > 0) {
          sections.push(`## 📁 Affected Files`);
          analysis.affected_files.forEach((file) => {
            sections.push(`- ${file}`);
          });
          sections.push("");
        }

        if (analysis.evidence.length > 0) {
          sections.push(`## 📋 Evidence`);
          analysis.evidence.forEach((evidence) => {
            sections.push(`- ${evidence}`);
          });
          sections.push("");
        }

        if (analysis.recommended_questions.length > 0) {
          sections.push(`## ❓ Recommended Questions`);
          analysis.recommended_questions.forEach((question) => {
            sections.push(`- ${question}`);
          });
          sections.push("");
        }

        if (analysis.safer_alternatives.length > 0) {
          sections.push(`## 💡 Safer Alternatives`);
          analysis.safer_alternatives.forEach((alternative) => {
            sections.push(`- ${alternative}`);
          });
          sections.push("");
        }

        return {
          content: [
            {
              type: "text",
              text: sections.join("\n"),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DevChronicle MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
