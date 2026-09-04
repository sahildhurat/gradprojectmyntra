import { Assessment, Product } from "../../data/types";

export function evidenceGuard(assessment: any, product: Product): Assessment {
  // Extract all valid evidence IDs for this product
  const validEvidenceIds = new Set(product.evidence.map(e => e.id));

  // Filter match_reasons: keep only if EVERY cited evidence ID is valid
  // If the array is missing, default to empty array
  const filteredMatchReasons = (assessment.match_reasons || []).filter((reason: any) => {
    if (!reason.evidence_ids || reason.evidence_ids.length === 0) return false;
    return reason.evidence_ids.every((id: string) => validEvidenceIds.has(id));
  });

  // Filter considerations: keep only if EVERY cited evidence ID is valid
  const filteredConsiderations = (assessment.considerations || []).filter((cons: any) => {
    if (!cons.evidence_ids || cons.evidence_ids.length === 0) return false;
    return cons.evidence_ids.every((id: string) => validEvidenceIds.has(id));
  });

  // Reassemble the sanitized assessment
  return {
    match_reasons: filteredMatchReasons,
    considerations: filteredConsiderations,
    unknowns: assessment.unknowns || [],
    question_to_resolve: assessment.question_to_resolve || "Does this resolve your doubt?",
    evidence_completeness: assessment.evidence_completeness || "low"
  };
}
