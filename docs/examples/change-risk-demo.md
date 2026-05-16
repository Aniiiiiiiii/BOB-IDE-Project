# Change Risk Analysis Demo

This document demonstrates how to use the `analyze_change_risk` MCP tool to detect potential conflicts with existing project decisions.

## Overview

The `analyze_change_risk` tool helps IBM Bob understand whether a proposed change might conflict with:
- Existing Architecture Decision Records (ADRs)
- Previous development decisions in devlogs
- Critical project files
- Established technology choices

## Example 1: High Risk - Contradicting an ADR

### Prompt to Bob

> "Bob, analyze the risk of this change: Replace Docker-based MCP startup with host npm runtime"

### Expected Analysis

**Risk Level:** HIGH

**Detected Conflicts:**
- Contradicts ADR 0001: Docker-First MCP Runtime (status: accepted)
- Changes to critical infrastructure require careful review

**Evidence:**
- ADR[0]: Docker-First MCP Runtime - status: accepted
- Planned change mentions: docker

**Recommended Questions:**
- Why is it necessary to contradict this accepted decision?
- Should the ADR be updated or deprecated?
- Have stakeholders been consulted?

**Safer Alternatives:**
- Update the ADR with a new decision
- Create a new ADR explaining why the previous decision is being reversed

## Example 2: Medium Risk - Technology Change

### Prompt to Bob

> "Bob, analyze the risk of migrating from TypeScript to JavaScript"

### Expected Analysis

**Risk Level:** MEDIUM

**Detected Conflicts:**
- Planned change may conflict with existing ADR decisions
- Changes to infrastructure require careful review

**Evidence:**
- devlog entries mention TypeScript
- package.json includes TypeScript dependencies

**Recommended Questions:**
- Why is this technology change necessary?
- Have all dependencies on the current technology been identified?
- Is there an ADR documenting the original technology choice?

**Safer Alternatives:**
- Consider creating an ADR before making this change
- Review existing devlogs for context on current technology

## Example 3: Medium Risk - Critical File Changes

### Prompt to Bob

> "Bob, analyze the risk of this change: Update MCP configuration and Docker setup"
> 
> Changed files:
> - .Bob/mcp.json
> - docker-compose.yml
> - Dockerfile

### Expected Analysis

**Risk Level:** MEDIUM

**Detected Conflicts:**
- Critical files will be modified: .Bob/mcp.json, docker-compose.yml, Dockerfile

**Evidence:**
- File: .Bob/mcp.json
- File: docker-compose.yml
- File: Dockerfile

**Recommended Questions:**
- Have you backed up these files?
- Will this break existing functionality?
- Have you tested the changes?

**Safer Alternatives:**
- Make changes incrementally
- Test in a separate branch first

## Example 4: Low Risk - Documentation Update

### Prompt to Bob

> "Bob, analyze the risk of updating the README to add more examples"

### Expected Analysis

**Risk Level:** LOW

**Summary:** ✅ LOW RISK: No significant conflicts detected. Proceed with normal review process.

## How It Works

The `analyze_change_risk` tool uses deterministic rules to analyze changes:

1. **Technology Replacement Rule**: Detects keywords like "replace", "remove", "migrate"
2. **Infrastructure Change Rule**: Flags changes to database, auth, Docker, MCP, etc.
3. **ADR Conflict Rule**: Checks if change contradicts accepted ADRs
4. **Critical File Rule**: Identifies changes to configuration files
5. **Architecture Doc Rule**: Detects modifications to ADRs

All analysis is local and deterministic - no external APIs or AI models are used.

## Integration with Bob

Bob can use this tool proactively:

**Before making changes:**
> "Bob, before we proceed, analyze the risk of removing the STDIO transport"

**During code review:**
> "Bob, I'm planning to change these files: src/index.ts, package.json. What's the risk?"

**When exploring alternatives:**
> "Bob, compare the risk of: 1) using HTTP instead of STDIO, 2) keeping STDIO but adding HTTP support"

## Best Practices

1. **Run risk analysis before major changes** - Catch conflicts early
2. **Include changed files** - More accurate risk assessment
3. **Review evidence carefully** - Understand why risk was flagged
4. **Consider alternatives** - Tool suggests safer approaches
5. **Update ADRs** - Document decisions to help future risk analysis