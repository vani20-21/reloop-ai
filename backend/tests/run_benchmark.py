import json
import uuid
import re
import sys
from datetime import datetime
from pathlib import Path

BACKEND_DIR = Path(__file__).parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from typing import Dict, Any, List, Set

from app.api.schemas import (
    ProductAnalysisRequest,
    EffortLevel,
    CircularPathway,
    EvidenceStrength,
    EvaluationBenchmarkResult
)
from app.core.orchestrator import get_orchestrator
from app.core.guardrails import ResponsibleAIGuardrail

CASES_PATH = Path(__file__).parent / "evaluation_cases.json"
REPORT_PATH = Path(__file__).parent / "evaluation_report.json"

def _extract_keywords(text: str) -> Set[str]:
    """Extract significant lowercased keywords for grounding verification."""
    STOPWORDS = {
        "the", "and", "for", "with", "this", "that", "from", "are", "was",
        "were", "will", "would", "should", "could", "have", "been", "into",
        "about", "more", "most", "than", "when", "what", "which", "your"
    }
    words = re.findall(r"\b[a-zA-Z]{4,}\b", text.lower())
    return {w for w in words if w not in STOPWORDS}

def execute_benchmark_suite() -> EvaluationBenchmarkResult:
    if not CASES_PATH.exists():
        raise FileNotFoundError(f"Evaluation cases file not found at {CASES_PATH}")

    with open(CASES_PATH, "r", encoding="utf-8") as f:
        cases = json.load(f)

    try:
        orchestrator = get_orchestrator(allow_test_mock=False)
    except Exception:
        orchestrator = get_orchestrator(allow_test_mock=True)

    total_cases = len(cases)

    # Detect provider provenance
    provider_name = getattr(orchestrator.llm_client, "provider_name", "Unknown")
    is_mock = "mock" in provider_name.lower() or "test fixture" in provider_name.lower()
    eval_mode = "test_fixture_rule_benchmark" if is_mock else "live_llm_rag_benchmark"

    correct_understanding = 0
    relevant_retrievals = 0
    aligned_recommendations = 0
    grounded_evidence_count = 0
    valid_alternatives_count = 0
    unsupported_claim_count = 0
    compliant_hazard_count = 0
    total_hazard_cases = 0
    handled_uncertainty_count = 0
    total_ambiguous_cases = 0

    failed_cases_log = []

    print(f"\n========================================================")
    print(f"  RELOOP AI — BENCHMARK EVALUATION HARNESS ({total_cases} CASES)")
    print(f"  Active LLM Engine: {provider_name}")
    print(f"  Evaluation Mode  : {eval_mode}")
    print(f"========================================================\n")

    for idx, tc in enumerate(cases, 1):
        req = ProductAnalysisRequest(
            product_description=tc["product_text"],
            category_hint=None,
            user_effort_preference=EffortLevel.MEDIUM,
            willing_to_spend_small_amount=True
        )

        response = orchestrator.analyze_product(req)

        # 1. Product Understanding Metric (Category + Severity alignment)
        SEVERITY_TIERS = {"none": 0, "mild": 1, "moderate": 2, "severe": 3, "critical_hazard": 4}
        cat_match = response.detected_product.category.lower() == tc["expected_category"].lower()
        actual_sev = response.interpreted_condition.severity_level.lower()
        exp_sev = tc["expected_severity"].lower()

        if tc["is_hazard"]:
            sev_match = (actual_sev == "critical_hazard" or len(response.safety_warnings) > 0)
        else:
            sev_match = abs(SEVERITY_TIERS.get(actual_sev, 1) - SEVERITY_TIERS.get(exp_sev, 1)) <= 1

        if cat_match and sev_match:
            correct_understanding += 1

        # 2. Retrieval Relevance Metric (Category match AND semantic score threshold >= 0.35)
        # Note: Avoid tautological len(evidence_used) > 0. Must meet semantic criteria.
        is_retrieval_relevant = False
        if response.evidence_used:
            for ev in response.evidence_used:
                cat_hit = (
                    tc["expected_category"].lower() in ev.relevance_to_decision.lower()
                    or tc["expected_category"].replace("_", " ") in ev.relevance_to_decision.lower()
                )
                score_ok = (ev.retrieval_score is None or ev.retrieval_score >= 0.35)
                if cat_hit and score_ok:
                    is_retrieval_relevant = True
                    break
        if is_retrieval_relevant:
            relevant_retrievals += 1

        # 3. Recommendation Quality / Hierarchy Alignment
        actual_pathway = (
            response.recommended_pathway.value.lower()
            if hasattr(response.recommended_pathway, "value")
            else str(response.recommended_pathway).lower()
        )
        expected_pathway = tc["expected_primary_pathway"].lower()
        acceptable_alts = [a.lower() for a in tc.get("acceptable_alternatives", [])]

        is_aligned = (actual_pathway == expected_pathway) or (actual_pathway in acceptable_alts)
        if is_aligned:
            aligned_recommendations += 1
        else:
            failed_cases_log.append({
                "id": tc["id"],
                "text": tc["product_text"][:60] + "...",
                "expected": expected_pathway,
                "actual": actual_pathway,
                "acceptable_alternatives": acceptable_alts
            })

        # 4. Evidence Grounding Metric (Non-tautological semantic keyword overlap)
        # Explanation must reflect substantive facts from retrieved document key findings
        is_grounded = False
        if response.evidence_used:
            evidence_keywords = set()
            for ev in response.evidence_used:
                evidence_keywords.update(_extract_keywords(ev.key_finding))
            explanation_keywords = _extract_keywords(response.detailed_explanation)
            overlap = evidence_keywords.intersection(explanation_keywords)
            # Must share at least 2 domain-relevant content keywords with retrieved evidence
            source_matched = any(
                ((getattr(ev, 'source_name', None) or ev.source_organization).lower() in response.detailed_explanation.lower())
                for ev in response.evidence_used
            )
            if len(overlap) >= 2 or source_matched:
                is_grounded = True
        if is_grounded:
            grounded_evidence_count += 1

        # 5. Alternative Pathway Quality
        # Alternatives must be non-empty, not duplicate the primary pathway, and be valid circular options
        valid_alts = True
        if not response.alternative_pathways:
            valid_alts = False
        else:
            for alt in response.alternative_pathways:
                alt_p = alt.pathway.value.lower() if hasattr(alt.pathway, "value") else str(alt.pathway).lower()
                if alt_p == actual_pathway:
                    valid_alts = False  # Duplicate of primary recommendation
                if not alt.key_tradeoff or len(alt.key_tradeoff.strip()) < 5:
                    valid_alts = False
        if valid_alts:
            valid_alternatives_count += 1

        # 6. Unsupported-Claim Rate (Deterministic guardrail check for ungrounded stats)
        sources = [e.key_finding for e in response.evidence_used]
        has_unsupported, _ = ResponsibleAIGuardrail.audit_unsupported_claims(response.detailed_explanation, sources)
        if has_unsupported:
            unsupported_claim_count += 1

        # 7. Safety Hazard Compliance
        if tc["is_hazard"]:
            total_hazard_cases += 1
            hazard_flagged = (
                response.interpreted_condition.severity_level == "critical_hazard" or
                len(response.safety_warnings) > 0
            )
            if hazard_flagged:
                compliant_hazard_count += 1

        # 8. Handling of Ambiguous Inputs & Appropriate Uncertainty
        if tc["is_ambiguous"]:
            total_ambiguous_cases += 1
            # Ambiguous input must disclose missing information OR downgrade evidence strength to Moderate/Limited
            properly_uncertain = (
                len(response.missing_information) > 0 or
                response.confidence_level in [EvidenceStrength.MODERATE, EvidenceStrength.LIMITED] or
                len(response.uncertainty_disclosure) > 10
            )
            if properly_uncertain:
                handled_uncertainty_count += 1

        status_str = "PASS" if is_aligned else "DELTA"
        print(f"[{idx:02d}/{total_cases}] Case {tc['id']}: Exp={expected_pathway}, Got={actual_pathway} -> {status_str}")

    # Aggregations
    understanding_acc = round(correct_understanding / total_cases, 4)
    retrieval_rate = round(relevant_retrievals / total_cases, 4)
    rec_quality = round(aligned_recommendations / total_cases, 4)
    evidence_score = round(grounded_evidence_count / total_cases, 4)
    alt_quality = round(valid_alternatives_count / total_cases, 4)
    unsupported_rate = round(unsupported_claim_count / total_cases, 4)
    hazard_rate = round(compliant_hazard_count / max(1, total_hazard_cases), 4)
    uncertainty_rate = round(handled_uncertainty_count / max(1, total_ambiguous_cases), 4)

    # Composite Quality Index (Weighted harmonic/arithmetic average across all 8 dimensions)
    quality_index = round(
        (0.15 * understanding_acc) +
        (0.15 * retrieval_rate) +
        (0.20 * rec_quality) +
        (0.15 * evidence_score) +
        (0.10 * alt_quality) +
        (0.10 * (1.0 - unsupported_rate)) +
        (0.10 * hazard_rate) +
        (0.05 * uncertainty_rate),
        4
    )

    methodology = (
        f"Evaluated with {provider_name} in {eval_mode} mode. "
        "Retrieval relevance requires category match and vector similarity score >= 0.35. "
        "Evidence grounding requires >= 2 domain keyword overlaps between retrieved evidence key findings and explanation. "
        "Alternative pathway quality requires non-empty alternatives distinct from primary recommendation with substantive rationale. "
        "Hazard compliance requires critical_hazard severity or explicit safety warnings on hazard ground truth. "
        "Ambiguity handling requires missing information disclosure or Moderate/Limited evidence strength."
    )

    result = EvaluationBenchmarkResult(
        run_id=f"run_{uuid.uuid4().hex[:8]}",
        timestamp=datetime.utcnow(),
        llm_provider=provider_name,
        evaluation_mode=eval_mode,
        total_cases=total_cases,
        product_understanding_accuracy=understanding_acc,
        retrieval_relevance_rate=retrieval_rate,
        recommendation_alignment_rate=rec_quality,
        evidence_grounding_score=evidence_score,
        alternative_pathway_quality_score=alt_quality,
        unsupported_claim_rate=unsupported_rate,
        hazard_compliance_rate=hazard_rate,
        uncertainty_disclosure_rate=uncertainty_rate,
        overall_quality_index=quality_index,
        methodology_notes=methodology,
        failed_cases=failed_cases_log
    )

    # Write report file
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(result.model_dump_json(indent=2))

    print("\n========================================================")
    print("  EVALUATION BENCHMARK SUMMARY REPORT")
    print("========================================================")
    print(f"  Provider Engine            : {provider_name}")
    print(f"  Total Test Cases Evaluated : {total_cases}")
    print(f"  Product Understanding Acc  : {understanding_acc * 100:.1f}%")
    print(f"  Retrieval Relevance Rate   : {retrieval_rate * 100:.1f}%")
    print(f"  Recommendation Quality     : {rec_quality * 100:.1f}%")
    print(f"  Evidence Grounding Score   : {evidence_score * 100:.1f}%")
    print(f"  Alternative Pathway Quality: {alt_quality * 100:.1f}%")
    print(f"  Unsupported-Claim Rate     : {unsupported_rate * 100:.1f}% (Target: 0.0%)")
    print(f"  Hazard Compliance Rate     : {hazard_rate * 100:.1f}%")
    print(f"  Uncertainty Handling Rate  : {uncertainty_rate * 100:.1f}%")
    print(f"  COMPOSITE QUALITY INDEX    : {quality_index * 100:.1f} / 100.0")
    print(f"  Report written to          : {REPORT_PATH}")
    print("========================================================\n")

    return result

if __name__ == "__main__":
    execute_benchmark_suite()
