import { AnalyzeChangeRiskInput, ChangeRiskAnalysis } from "../schemas.js";
import { scanProjectDocs } from "../core/scanner.js";
import { getRecentCommits } from "../core/git.js";
import { allRiskRules, RiskContext } from "../core/riskRules.js";

/**
 * Analyze the risk of a planned change
 * Returns deterministic risk analysis based on project documentation
 */
export async function analyzeChangeRisk(
  input: AnalyzeChangeRiskInput
): Promise<ChangeRiskAnalysis> {
  // Scan project documentation
  const scanned = await scanProjectDocs();
  
  // Get git history
  const gitLog = await getRecentCommits(20);
  
  // Build risk context
  const context: RiskContext = {
    planned_change: input.planned_change,
    changed_files: input.changed_files || [],
    readme_content: scanned.readme,
    agents_content: scanned.agents,
    devlog_contents: scanned.devlogs,
    adr_contents: scanned.adrs,
    doc_contents: scanned.docs,
    package_json: scanned.packageJson,
    git_log: gitLog,
  };
  
  // Apply all risk rules
  const ruleResults = allRiskRules.map(rule => ({
    rule,
    result: rule.check(context),
  }));
  
  // Collect triggered rules
  const triggeredRules = ruleResults.filter(r => r.result.triggered);
  
  // Determine overall risk level
  let overallRiskLevel: "low" | "medium" | "high" = "low";
  if (triggeredRules.some(r => r.result.risk_level === "high")) {
    overallRiskLevel = "high";
  } else if (triggeredRules.some(r => r.result.risk_level === "medium")) {
    overallRiskLevel = "medium";
  }
  
  // Collect all conflicts, evidence, questions, alternatives
  const allConflicts: string[] = [];
  const allEvidence: string[] = [];
  const allQuestions: string[] = [];
  const allAlternatives: string[] = [];
  const affectedFiles: string[] = [...context.changed_files];
  
  triggeredRules.forEach(({ rule, result }) => {
    allConflicts.push(...result.conflicts);
    allEvidence.push(...result.evidence);
    allQuestions.push(...result.questions);
    allAlternatives.push(...result.alternatives);
  });
  
  // Generate summary
  let summary = "";
  if (overallRiskLevel === "high") {
    summary = `⚠️ HIGH RISK: This change may conflict with existing project decisions or critical infrastructure. ${triggeredRules.length} risk rule(s) triggered.`;
  } else if (overallRiskLevel === "medium") {
    summary = `⚡ MEDIUM RISK: This change requires careful review. ${triggeredRules.length} risk rule(s) triggered.`;
  } else {
    summary = `✅ LOW RISK: No significant conflicts detected. Proceed with normal review process.`;
  }
  
  // Add warning if evidence is limited
  if (allEvidence.length === 0 && overallRiskLevel !== "low") {
    summary += " Note: Limited evidence available - risk assessment may be incomplete.";
  }
  
  // Deduplicate arrays
  const uniqueConflicts = Array.from(new Set(allConflicts));
  const uniqueEvidence = Array.from(new Set(allEvidence));
  const uniqueQuestions = Array.from(new Set(allQuestions));
  const uniqueAlternatives = Array.from(new Set(allAlternatives));
  const uniqueAffectedFiles = Array.from(new Set(affectedFiles));
  
  return {
    risk_level: overallRiskLevel,
    summary,
    detected_conflicts: uniqueConflicts,
    affected_files: uniqueAffectedFiles,
    evidence: uniqueEvidence.slice(0, 10), // Limit to 10 pieces of evidence
    recommended_questions: uniqueQuestions.slice(0, 5), // Limit to 5 questions
    safer_alternatives: uniqueAlternatives.slice(0, 5), // Limit to 5 alternatives
  };
}
