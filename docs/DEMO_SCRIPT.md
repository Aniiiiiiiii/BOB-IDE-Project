# DevChronicle MCP - 3-Minute Demo Script

This script demonstrates the core capabilities of DevChronicle MCP for the IBM Bob Hackathon.

**Total Time:** ~3 minutes

---

## Setup (30 seconds)

**Show:** Terminal with Docker running

```powershell
# Verify Docker is running
docker ps

# Show the project is ready
docker compose run --rm devchronicle-mcp npm run validate
```

**Say:** "DevChronicle MCP is a Docker-first MCP server that gives IBM Bob persistent project memory. No Node.js required on the host - everything runs in Docker."

---

## Demo 1: Project State Summary (45 seconds)

**Prompt to Bob:**
> "Bob, what's the current state of this project?"

**Bob uses:** `summarize_project_state`

**Expected Output:**
- Project name: BOB-IDE-Project
- Goal: MCP server for project memory
- Recent progress from devlogs and git commits
- Known decisions from ADRs (Docker-first, STDIO transport)
- Notable files (README, devlogs, ADRs)

**Say:** "Bob reads our README, devlogs, ADRs, and git history to understand the project context. This gives Bob persistent memory across sessions."

---

## Demo 2: Change Risk Analysis (75 seconds)

**Prompt to Bob:**
> "Bob, analyze the risk of this change: Replace Docker-based MCP startup with host npm runtime"

**Bob uses:** `analyze_change_risk`

**Expected Output:**
- **Risk Level:** HIGH
- **Detected Conflicts:** Contradicts ADR 0001 (Docker-First Runtime)
- **Evidence:** References to ADR with status "accepted"
- **Recommended Questions:** Why contradict this decision? Should ADR be updated?
- **Safer Alternatives:** Update the ADR first, create new ADR explaining reversal

**Say:** "Bob detected this would contradict our accepted ADR about Docker-first runtime. The risk analysis is deterministic - it scans our ADRs, devlogs, and critical files to find conflicts. No external APIs, no AI guessing."

**Show another example:**

**Prompt to Bob:**
> "Bob, what's the risk of updating the README to add more examples?"

**Expected Output:**
- **Risk Level:** LOW
- **Summary:** No significant conflicts detected

**Say:** "Low-risk changes like documentation updates are flagged as safe to proceed."

---

## Demo 3: Create ADR (30 seconds)

**Prompt to Bob:**
> "Bob, create an ADR titled 'Use Zod for Input Validation', status accepted, context is we need type-safe validation for MCP tool inputs, decision is to use Zod library, consequences are better type safety and runtime validation but adds dependency"

**Bob uses:** `create_adr`

**Expected Output:**
- ✅ Created ADR 0003: Use Zod for Input Validation (accepted)
- Path: `docs/adr/0003-use-zod-for-input-validation.md`

**Say:** "Bob automatically creates properly formatted ADRs with sequential numbering. These become part of the project's decision history."

---

## Demo 4: Feature Recommendations (30 seconds)

**Prompt to Bob:**
> "Bob, what features should we work on next?"

**Bob uses:** `recommend_next_features`

**Expected Output:**
- **Reliability:** Error recovery, retry logic
- **Demo Polish:** Better formatting, examples
- **Testing:** Unit tests, integration tests
- **Documentation:** API docs, troubleshooting
- **Future MCP Features:** New tools to build

**Say:** "Bob analyzes the project state and recommends next features based on what's missing. It checks for tests, documentation, ADRs, and suggests improvements."

---

## Demo 5: Log Progress (30 seconds)

**Prompt to Bob:**
> "Bob, log today's progress: Completed all 5 MCP tools, changed files include src/tools/*.ts, decided to add ADR creation and feature recommendations, no blockers, next step is final submission."

**Bob uses:** `log_progress`

**Expected Output:**
- ✅ Progress logged to `docs/devlog/2026-05-16.md`
- Structured entry with timestamp, completed tasks, decisions, next steps

**Say:** "Bob creates structured devlog entries that become part of the project's permanent memory. Future Bob sessions can read these to understand what happened."

---

## Closing (30 seconds)

**Show:** Quick file tree

```
docs/
├── devlog/
│   └── 2026-05-16.md          # Today's progress
├── adr/
│   ├── 0001-docker-first-mcp-runtime.md
│   └── 0002-stdio-mcp-server.md
└── examples/
    └── change-risk-demo.md
```

**Say:** "DevChronicle solves the problem of AI assistants losing context. Bob now has:
1. **Memory** - Reads devlogs, ADRs, and git history
2. **Intelligence** - Detects conflicts before making changes
3. **Persistence** - Logs decisions for future sessions

All local, deterministic, and Docker-first. No external APIs, no databases, no complexity."

---

## Key Talking Points

### Problem
- AI coding assistants lose project context between sessions
- They can't remember why decisions were made
- They might suggest changes that contradict previous decisions

### Solution
- **Persistent Memory:** Devlogs + ADRs + Git history
- **Change Intelligence:** Risk analysis before making changes
- **Local & Deterministic:** No external APIs, consistent results

### Technical Highlights
- Docker-first (no host dependencies)
- STDIO MCP transport
- 5 core tools: log_progress, summarize_project_state, analyze_change_risk, create_adr, recommend_next_features
- 5 deterministic risk rules
- Full validation pipeline

### Demo Flow
1. Show Bob understanding project state
2. Show Bob detecting high-risk changes
3. Show Bob creating ADRs
4. Show Bob recommending next features
5. Show Bob logging progress for future memory

---

## Backup Prompts (If Needed)

**Alternative risk analysis:**
> "Bob, analyze the risk of migrating from TypeScript to JavaScript"

**Alternative progress log:**
> "Bob, log progress: Fixed validation errors, modified package.json and tsconfig.json, decided to keep strict TypeScript, no blockers, next is testing"

**Show validation:**
```powershell
docker compose run --rm devchronicle-mcp npm run validate
```

---

## Common Questions

**Q: Does this use AI for risk analysis?**
A: No, it's purely deterministic rules scanning local files.

**Q: Does it need internet?**
A: No, everything is local-only.

**Q: Can it work without Docker?**
A: Technically yes with Node.js, but Docker-first is our design decision (see ADR 0001).

**Q: How does Bob connect?**
A: Through MCP STDIO - Bob starts the Docker container and communicates via stdin/stdout.
