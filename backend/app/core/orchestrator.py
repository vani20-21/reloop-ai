import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List, Tuple

from app.api.schemas import (
    ProductAnalysisRequest,
    WhatIfRequest,
    RecommendationResponse,
    DetectedProduct,
    InterpretedCondition,
    EvidenceItem,
    PathwayOption,
    CircularPathway,
    EvidenceStrength,
    EffortLevel,
    VisualEvidence
)
from app.rag.retriever import get_retriever, RetrievedChunk
from app.llm import get_llm_client, BaseLLMClient, AIProviderUnavailableError
from app.llm.openrouter_vision_client import OpenRouterVisionClient
from app.core.guardrails import ResponsibleAIGuardrail

SYSTEM_PROMPT_CIRCULAR_INTELLIGENCE = """You are RELOOP AI, an authoritative, evidence-grounded circular product decision intelligence engine.
Your mission is to evaluate products across the 6 circular pathways, prioritizing Product Life Extension (PLE) before disposal:
1. Continue Using (maintenance, cleaning, firmware, minor non-hazardous adjustments)
2. Repair (component replacement, seam mending, professional or modular restoration)
3. Reuse (direct resale, gifting to peers, peer transfer)
4. Donate (to non-profits, schools, community libraries meeting condition standards)
5. Repurpose (functional cascading into secondary utility, upcycling)
6. Recycle (material recovery via certified e-waste or textile processing)

CRITICAL DIRECTIVES:

1. ABSOLUTE NUMERICAL & COST GROUNDING (STRICT):
   - You MUST NOT invent, estimate, or state any specific dollar amount ($), monetary price, repair cost, percentage (%), weight, years of added life, carbon footprint figure, or repair success percentage UNLESS that exact numerical figure is explicitly present in the provided <retrieved_evidence> block.
   - If exact figures are not in <retrieved_evidence>, state: "Cost depends on the specific service or replacement option."
   - NEVER use the phrases "nominal cost", "affordable cost", "moderate cost", or "service cost".

2. OBSERVED FACTS VS UNCONFIRMED HYPOTHESES (STRICT SEPARATION):
   - identified_defects MUST contain ONLY explicit user-reported symptoms or confirmed visual damage (e.g. "battery capacity reduced to 1 hour", "slow performance").
   - DO NOT put unconfirmed internal causes (such as thermal throttling, dust-clogged heatsinks, aged thermal paste, outdated OS, RAM limits) into identified_defects.
   - List unconfirmed causes under uncertainty_disclosure or reasoning_summary as: "Possible performance causes include software load, aging hardware, storage limitations, memory constraints, or thermal issues; these require diagnostic testing."

3. NON-PRESCRIPTIVE CIRCULAR GUIDANCE (NO DIY DISASSEMBLY):
   - ReLoop AI provides high-level circular decision guidance, NOT step-by-step DIY hardware disassembly manuals.
   - For routine laptop degradation/slowness: Say: "Consider a qualified technician to assess battery health, cooling, storage, and memory."
   - Do NOT give granular disassembly or repair steps (e.g. "disconnect internal battery", "remove bottom panel", "clean fan", "apply thermal paste", "SSD cloning").

4. SAFETY & HAZARD GUIDANCE BOUNDARIES:
   - ROUTINE WEAR (e.g., degraded battery lasting 1 hour, slow performance) IS NOT A CRITICAL HAZARD. Recommend standard repair or maintenance assessment.
   - PHYSICAL HAZARDS (swollen/bulging battery, smoke, sparks, exposed mains wiring, leakage, black mold) ARE CRITICAL HAZARDS.
   - For PHYSICAL HAZARDS: Set severity_level="critical_hazard", recommend RECYCLE or hazmat recovery, and DO NOT provide any DIY repair or disassembly steps.

5. GROUNDED EVIDENCE ATTRIBUTION:
   - Attribute technical principles only to the retrieved sources that actually contain them. Vector similarity is a retrieval score, not factual proof.

Return ONLY a valid JSON object matching the required schema.
"""


class CircularAIOrchestrator:
    def __init__(
        self,
        llm_client: Optional[BaseLLMClient] = None,
        vision_client: Optional[OpenRouterVisionClient] = None,
        allow_test_mock: bool = False
    ):
        self.llm = llm_client or get_llm_client(allow_test_mock=allow_test_mock)
        self.vision = vision_client or OpenRouterVisionClient()
        self.retriever = get_retriever()

    @property
    def llm_client(self) -> BaseLLMClient:
        return self.llm

    def _assess_evidence_strength(
        self,
        retrieved_chunks: List[RetrievedChunk],
        missing_info: List[str],
        is_hazard: bool
    ) -> Tuple[EvidenceStrength, str, float]:
        """
        Explainable Evidence-Strength Assessment:
        Calculates grounding strength based on measurable signals:
        1. Top semantic vector similarity score
        2. Breadth of distinct corroborating knowledge sources
        3. Missing information / input ambiguity penalty
        4. Hazard protocol clarity
        Does NOT claim statistical probability calibration.
        """
        top_score = retrieved_chunks[0].score if retrieved_chunks else 0.0
        points = 0
        rationale_parts = []

        # 1. Semantic retrieval score
        if top_score >= 0.65:
            points += 3
            rationale_parts.append(f"High semantic vector alignment ({top_score:.2f} retrieval score)")
        elif top_score >= 0.40:
            points += 2
            rationale_parts.append(f"Moderate semantic vector alignment ({top_score:.2f} retrieval score)")
        else:
            points += 1
            rationale_parts.append(f"Limited semantic vector match ({top_score:.2f} retrieval score)")

        # 2. Corroborating sources count
        if len(retrieved_chunks) >= 2:
            points += 1
            rationale_parts.append(f"corroborated by {len(retrieved_chunks)} distinct circular knowledge documents")

        # 3. Missing information penalty
        if len(missing_info) >= 3:
            points -= 1
            rationale_parts.append(f"penalized due to {len(missing_info)} missing diagnostic parameters")

        # 4. Critical hazard certainty
        if is_hazard:
            points = max(points, 3)
            rationale_parts.append("elevated certainty due to unambiguous safety hazard interdiction protocol")

        # Classification
        if points >= 4:
            strength = EvidenceStrength.STRONG
            numeric_indicator = min(0.95, max(0.85, top_score))
        elif points >= 2:
            strength = EvidenceStrength.MODERATE
            numeric_indicator = min(0.84, max(0.65, top_score))
        else:
            strength = EvidenceStrength.LIMITED
            numeric_indicator = min(0.64, max(0.40, top_score))

        rationale = "; ".join(rationale_parts) + "."
        return strength, rationale, round(numeric_indicator, 2)

    def analyze_product(self, request: ProductAnalysisRequest) -> RecommendationResponse:
        session_id = str(uuid.uuid4())
        
        # Stage 0: Optional Multimodal Image Analysis via OpenRouter free vision
        visual_evidence: Optional[VisualEvidence] = None
        symptoms_search_text = request.product_description

        if request.image_base64:
            try:
                visual_evidence = self.vision.analyze_image(
                    image_base64=request.image_base64,
                    user_context=request.product_description,
                    mime_type=request.image_mime_type
                )
                if visual_evidence and visual_evidence.analysis_status == "completed" and visual_evidence.observations:
                    obs_summary = ", ".join([o.observation for o in visual_evidence.observations])
                    symptoms_search_text = f"{request.product_description} [VISUAL EVIDENCE: {obs_summary}]"
            except Exception as ve:
                visual_evidence = VisualEvidence(
                    analysis_status="error",
                    error_message="Image analysis is temporarily unavailable. The recommendation was generated from your description."
                )

        # Stage 1: Initial triage and evidence retrieval
        category_hint = request.category_hint if request.category_hint else None
        retrieved_chunks: List[RetrievedChunk] = self.retriever.retrieve(
            extracted_product="",
            detected_category=category_hint,
            symptoms_and_condition=symptoms_search_text,
            top_k=3
        )
        
        # Format evidence for prompt
        evidence_text_block = self.retriever.format_evidence_for_prompt(retrieved_chunks)
        
        # Format visual evidence for LLM prompt if present
        visual_context_block = ""
        if visual_evidence and visual_evidence.analysis_status == "completed":
            obs_str = "\n".join([f"  - {o.observation} (confidence: {o.confidence})" for o in visual_evidence.observations])
            exp_str = "\n".join([f"  - {e.explanation} (confidence: {e.confidence})" for e in visual_evidence.possible_explanations])
            unk_str = "\n".join([f"  - {u}" for u in visual_evidence.unknowns])
            haz_str = "\n".join([f"  - {h}" for h in visual_evidence.hazard_indicators])
            
            visual_context_block = f"""
Visual Evidence Observations (OpenRouter Vision):
- Directly Visible Observations:
{obs_str if obs_str else "  - None"}
- Possible Explanations:
{exp_str if exp_str else "  - None"}
- Cannot Confirm (Unknowns):
{unk_str if unk_str else "  - None"}
- Visible Hazard Indicators:
{haz_str if haz_str else "  - None"}
"""
        elif visual_evidence and visual_evidence.analysis_status != "completed":
            visual_context_block = "\nVisual Evidence Status: Image analysis is temporarily unavailable. The recommendation was generated from your description.\n"

        # Stage 2: Formulate Synthesis Prompt
        user_prompt = f"""Evaluate this product query:
<product_query>
{request.product_description}
</product_query>

User Constraints:
- Preferred Effort Level: {request.user_effort_preference.value}
- Willing to Spend Small Amount ($5-$30): {request.willing_to_spend_small_amount}
- Category Hint: {request.category_hint or "Auto-detect"}

{visual_context_block}

{evidence_text_block}

Produce a JSON response containing:
- detected_product: {{ category, product_name_or_type, estimated_age_bracket, material_or_construction }}
- interpreted_condition: {{ functional_state, identified_defects, severity_level, safety_concerns }}
- user_intent: string
- recommended_pathway: "continue_using" | "repair" | "reuse" | "donate" | "repurpose" | "recycle"
- uncertainty_disclosure: string
- reasoning_summary: string (concise summary)
- detailed_explanation: string (markdown formatted)
- alternative_pathways: list of {{ pathway, rank, suitability, key_tradeoff, prerequisites }}
- safety_warnings: list of string
- missing_information: list of string
- practical_next_steps: list of string
"""

        # Stage 3: LLM Reasoning Synthesis
        raw_json = self.llm.generate_json(SYSTEM_PROMPT_CIRCULAR_INTELLIGENCE, user_prompt)

        # Stage 4: Construct and Ground Response
        evidence_items = []
        for c in retrieved_chunks:
            if c.score >= 0.65:
                rel_text = f"Retrieved evidence was highly relevant to {c.category} (retrieval relevance score: {c.score:.2f})."
            elif c.score >= 0.40:
                rel_text = f"Retrieved evidence was moderately relevant to {c.category} (retrieval relevance score: {c.score:.2f})."
            else:
                rel_text = f"Limited relevant evidence was retrieved for this specific condition (retrieval relevance score: {c.score:.2f})."

            evidence_items.append(
                EvidenceItem(
                    doc_id=c.doc_id,
                    source_title=c.title,
                    source_organization=c.source_name or c.source,
                    source_name=c.source_name or c.source,
                    source_url=c.source_url,
                    key_finding=c.evidence_text[:180] + "...",
                    relevance_to_decision=rel_text,
                    publication_year=c.publication_year,
                    retrieved_date=c.retrieved_date,
                    retrieval_score=round(c.score, 3)
                )
            )


        # Assemble Pydantic model
        rec_pathway = CircularPathway(raw_json.get("recommended_pathway", "repair").lower())
        
        alternatives = []
        for alt in raw_json.get("alternative_pathways", []):
            try:
                p_enum = CircularPathway(alt.get("pathway", "recycle").lower())
                alternatives.append(PathwayOption(
                    pathway=p_enum,
                    rank=alt.get("rank", 2),
                    suitability=alt.get("suitability", "Viable Alternative"),
                    key_tradeoff=alt.get("key_tradeoff", ""),
                    prerequisites=alt.get("prerequisites", [])
                ))
            except ValueError:
                continue

        # Explainable evidence strength assessment
        is_hazard_flag = (
            raw_json.get("interpreted_condition", {}).get("severity_level") == "critical_hazard" or
            len(ResponsibleAIGuardrail.inspect_hazards(request.product_description)) > 0 or
            (visual_evidence is not None and len(visual_evidence.hazard_indicators) > 0 and any(
                len(ResponsibleAIGuardrail.inspect_generated_field_hazards(h)) > 0 for h in visual_evidence.hazard_indicators
            ))
        )
        missing_info_list = raw_json.get("missing_information", [])
        evidence_strength, strength_rationale, calibrated_score = self._assess_evidence_strength(
            retrieved_chunks=retrieved_chunks,
            missing_info=missing_info_list,
            is_hazard=is_hazard_flag
        )

        # Safe normalization of LLM JSON fields
        raw_prod = raw_json.get("detected_product")
        if not isinstance(raw_prod, dict):
            raw_prod = {}
        if not raw_prod.get("category"):
            raw_prod["category"] = category_hint or "consumer_goods"
        if not raw_prod.get("product_name_or_type"):
            raw_prod["product_name_or_type"] = "Evaluated Product"

        raw_cond = raw_json.get("interpreted_condition")
        if not isinstance(raw_cond, dict):
            raw_cond = {}
        if not raw_cond.get("functional_state"):
            raw_cond["functional_state"] = "Functional assessment complete"
        if not raw_cond.get("severity_level"):
            raw_cond["severity_level"] = "moderate"
        
        # Ensure list types for defects and safety concerns
        for field in ["identified_defects", "safety_concerns"]:
            val = raw_cond.get(field)
            if isinstance(val, str):
                raw_cond[field] = [val] if val.strip() else []
            elif not isinstance(val, list):
                raw_cond[field] = []

        response = RecommendationResponse(
            session_id=session_id,
            timestamp=datetime.now(timezone.utc),
            raw_query=request.product_description,
            detected_product=DetectedProduct(**raw_prod),
            interpreted_condition=InterpretedCondition(**raw_cond),
            user_intent=raw_json.get("user_intent", "Product life evaluation"),
            recommended_pathway=rec_pathway,
            evidence_strength=evidence_strength,
            evidence_strength_rationale=strength_rationale,
            confidence_score=calibrated_score,
            confidence_level=evidence_strength.value,
            uncertainty_disclosure=raw_json.get("uncertainty_disclosure", "Assessment based on provided product description and knowledge base heuristics."),
            reasoning_summary=raw_json.get("reasoning_summary", "Prioritizing product life extension."),
            detailed_explanation=raw_json.get("detailed_explanation", ""),
            alternative_pathways=alternatives,
            visual_evidence=visual_evidence,
            evidence_used=evidence_items,
            safety_warnings=raw_json.get("safety_warnings", []),
            missing_information=missing_info_list,
            practical_next_steps=raw_json.get("practical_next_steps", [])
        )

        # Stage 5: Guardrails Sanitization & Calibration
        source_texts = [c.evidence_text for c in retrieved_chunks]
        final_response = ResponsibleAIGuardrail.sanitize_and_calibrate(response, source_texts)

        return final_response


    def evaluate_what_if(
        self,
        original_response: RecommendationResponse,
        what_if_request: WhatIfRequest
    ) -> RecommendationResponse:
        """
        Re-evaluates an existing session under hypothetical condition mutations.
        """
        modified_query = original_response.raw_query
        if what_if_request.altered_condition:
            modified_query += f" [HYPOTHETICAL CONDITION UPDATE: {what_if_request.altered_condition}]"
        if what_if_request.part_available is False:
            modified_query += " [CONSTRAINT: Replacement parts are completely unavailable or discontinued]"
        elif what_if_request.part_available is True:
            modified_query += " [CONSTRAINT: Genuine OEM replacement parts are readily available at low cost]"

        effort = what_if_request.altered_effort_preference or EffortLevel.MEDIUM
        spend = (
            what_if_request.willing_to_spend_small_amount
            if what_if_request.willing_to_spend_small_amount is not None
            else True
        )

        req = ProductAnalysisRequest(
            product_description=modified_query,
            category_hint=original_response.detected_product.category,
            user_effort_preference=effort,
            willing_to_spend_small_amount=spend
        )

        new_response = self.analyze_product(req)
        # Keep original session identifier with mutation tag
        new_response.session_id = f"{what_if_request.session_id}_whatif_{uuid.uuid4().hex[:6]}"
        return new_response


# Global Orchestrator Instance
_orchestrator: Optional[CircularAIOrchestrator] = None

def get_orchestrator(allow_test_mock: bool = False) -> CircularAIOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = CircularAIOrchestrator(allow_test_mock=allow_test_mock)
    return _orchestrator
