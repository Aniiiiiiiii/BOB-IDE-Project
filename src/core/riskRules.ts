import { ChangeRiskAnalysis } from "../schemas.js";

/**
 * Risk rule definitions for analyzing planned changes
 */

export interface RiskContext {
  planned_change: string;
  changed_files: string[];
  readme_content: string | null;
  agents_content: string | null;
  devlog_contents: string[];
  adr_contents: string[];
  doc_contents: string[];
  package_json: string | null;
  git_log: string[];
}

export interface RiskRule {
  id: string;
  description: string;
  check: (context: RiskContext) => {
    triggered: boolean;
    risk_level: "low" | "medium" | "high";
    conflicts: string[];
    evidence: string[];
    questions: string[];
    alternatives: string[];
  };
}

/**
 * Rule 1: Technology replacement/removal/migration
 */
export const technologyChangeRule: RiskRule = {
  id: "technology-change",
  description: "Detects when planned change mentions replacing/removing/migrating a technology",
  check: (context) => {
    const changeText = context.planned_change.toLowerCase();
    const keywords = ["replace", "remove", "remov", "migrat", "switch from", "move away from", "deprecat"];
    
    const triggered = keywords.some(kw => changeText.includes(kw));
    
    if (!triggered) {
      return {
        triggered: false,
        risk_level: "low",
        conflicts: [],
        evidence: [],
        questions: [],
        alternatives: [],
      };
    }
    
    // Search for technology mentions in docs
    const conflicts: string[] = [];
    const evidence: string[] = [];
    
    // Check devlogs
    context.devlog_contents.forEach((content, idx) => {
      const lines = content.split("\n");
      lines.forEach((line, lineNum) => {
        if (line.toLowerCase().includes("docker") || 
            line.toLowerCase().includes("mcp") ||
            line.toLowerCase().includes("typescript")) {
          evidence.push(`devlog[${idx}]:${lineNum + 1}: ${line.trim()}`);
        }
      });
    });
    
    // Check ADRs
    context.adr_contents.forEach((content, idx) => {
      if (content.toLowerCase().includes("accepted") || content.toLowerCase().includes("decision")) {
        evidence.push(`ADR[${idx}]: Contains accepted decision`);
        conflicts.push("Planned change may conflict with existing ADR decisions");
      }
    });
    
    return {
      triggered: true,
      risk_level: evidence.length > 0 ? "medium" : "low",
      conflicts,
      evidence: evidence.slice(0, 5), // Limit evidence
      questions: [
        "Why is this technology change necessary?",
        "Have all dependencies on the current technology been identified?",
        "Is there an ADR documenting the original technology choice?",
      ],
      alternatives: [
        "Consider creating an ADR before making this change",
        "Review existing devlogs for context on current technology",
      ],
    };
  },
};

/**
 * Rule 2: Critical infrastructure changes
 */
export const infrastructureChangeRule: RiskRule = {
  id: "infrastructure-change",
  description: "Detects changes to critical infrastructure components",
  check: (context) => {
    const changeText = context.planned_change.toLowerCase();
    const criticalKeywords = [
      "database", "storage", "auth", "authentication", "api contract", 
      "schema", "index", "vector search", "graph", "docker", "mcp config",
      "build system", "deployment", "ci/cd"
    ];
    
    const triggered = criticalKeywords.some(kw => changeText.includes(kw));
    
    if (!triggered) {
      return {
        triggered: false,
        risk_level: "low",
        conflicts: [],
        evidence: [],
        questions: [],
        alternatives: [],
      };
    }
    
    return {
      triggered: true,
      risk_level: "medium",
      conflicts: ["Changes to infrastructure require careful review"],
      evidence: [`Planned change mentions: ${criticalKeywords.find(kw => changeText.includes(kw))}`],
      questions: [
        "Have you tested this change in a development environment?",
        "Will this affect existing integrations?",
        "Is there a rollback plan?",
      ],
      alternatives: [
        "Consider making this change incrementally",
        "Document the change in an ADR first",
      ],
    };
  },
};

/**
 * Rule 3: ADR contradiction
 */
export const adrConflictRule: RiskRule = {
  id: "adr-conflict",
  description: "Detects when planned change contradicts an accepted ADR",
  check: (context) => {
    const conflicts: string[] = [];
    const evidence: string[] = [];
    
    context.adr_contents.forEach((content, idx) => {
      const lines = content.split("\n");
      let isAccepted = false;
      let adrTitle = "";
      
      lines.forEach((line) => {
        if (line.toLowerCase().includes("status") && line.toLowerCase().includes("accepted")) {
          isAccepted = true;
        }
        if (line.startsWith("#") && !adrTitle) {
          adrTitle = line.replace(/^#+\s*/, "").trim();
        }
      });
      
      if (isAccepted) {
        // Check if planned change contradicts this ADR
        const changeText = context.planned_change.toLowerCase();
        const adrText = content.toLowerCase();
        
        // Simple heuristic: if ADR mentions Docker and change wants to remove it
        if (adrText.includes("docker") && (changeText.includes("remove docker") || changeText.includes("replace docker"))) {
          conflicts.push(`Contradicts ADR: ${adrTitle}`);
          evidence.push(`ADR[${idx}]: ${adrTitle} - status: accepted`);
        }
        
        if (adrText.includes("stdio") && (changeText.includes("remove stdio") || changeText.includes("replace stdio"))) {
          conflicts.push(`Contradicts ADR: ${adrTitle}`);
          evidence.push(`ADR[${idx}]: ${adrTitle} - status: accepted`);
        }
      }
    });
    
    if (conflicts.length > 0) {
      return {
        triggered: true,
        risk_level: "high",
        conflicts,
        evidence,
        questions: [
          "Why is it necessary to contradict this accepted decision?",
          "Should the ADR be updated or deprecated?",
          "Have stakeholders been consulted?",
        ],
        alternatives: [
          "Update the ADR with a new decision",
          "Create a new ADR explaining why the previous decision is being reversed",
        ],
      };
    }
    
    return {
      triggered: false,
      risk_level: "low",
      conflicts: [],
      evidence: [],
      questions: [],
      alternatives: [],
    };
  },
};

/**
 * Rule 4: Critical file changes
 */
export const criticalFileRule: RiskRule = {
  id: "critical-file-change",
  description: "Detects changes to critical configuration files",
  check: (context) => {
    const criticalFiles = [
      ".Bob/mcp.json",
      "package.json",
      "Dockerfile",
      "docker-compose.yml",
      "tsconfig.json",
      "src/index.ts",
    ];
    
    const affectedCriticalFiles = context.changed_files.filter(file =>
      criticalFiles.some(cf => file.includes(cf))
    );
    
    if (affectedCriticalFiles.length === 0) {
      return {
        triggered: false,
        risk_level: "low",
        conflicts: [],
        evidence: [],
        questions: [],
        alternatives: [],
      };
    }
    
    return {
      triggered: true,
      risk_level: "medium",
      conflicts: [`Critical files will be modified: ${affectedCriticalFiles.join(", ")}`],
      evidence: affectedCriticalFiles.map(f => `File: ${f}`),
      questions: [
        "Have you backed up these files?",
        "Will this break existing functionality?",
        "Have you tested the changes?",
      ],
      alternatives: [
        "Make changes incrementally",
        "Test in a separate branch first",
      ],
    };
  },
};

/**
 * Rule 5: Architecture documentation changes
 */
export const architectureDocRule: RiskRule = {
  id: "architecture-doc-change",
  description: "Detects changes to architecture documentation",
  check: (context) => {
    const affectedAdrFiles = context.changed_files.filter(file =>
      file.includes("docs/adr") || file.includes("architecture")
    );
    
    if (affectedAdrFiles.length === 0) {
      return {
        triggered: false,
        risk_level: "low",
        conflicts: [],
        evidence: [],
        questions: [],
        alternatives: [],
      };
    }
    
    return {
      triggered: true,
      risk_level: "medium",
      conflicts: ["Architecture documentation will be modified"],
      evidence: affectedAdrFiles.map(f => `File: ${f}`),
      questions: [
        "Is this a new ADR or an update to an existing one?",
        "Have stakeholders reviewed this change?",
      ],
      alternatives: [
        "Create a new ADR instead of modifying an existing one",
        "Mark old ADR as deprecated rather than deleting it",
      ],
    };
  },
};

/**
 * All risk rules
 */
export const allRiskRules: RiskRule[] = [
  technologyChangeRule,
  infrastructureChangeRule,
  adrConflictRule,
  criticalFileRule,
  architectureDocRule,
];
