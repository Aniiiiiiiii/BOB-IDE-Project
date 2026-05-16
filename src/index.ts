import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { LogProgressSchema, SummarizeProjectStateSchema } from "./schemas.js";
import { logProgress } from "./tools/logProgress.js";
import { summarizeProjectState } from "./tools/summarizeProjectState.js";

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

// Made with Bob
