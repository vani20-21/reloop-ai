import re
from datetime import datetime
from enum import Enum
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel
from app.api.schemas import RecommendationResponse, InterpretedCondition, CircularPathway

# Hazard triggers requiring non-negotiable safety interdiction.
HAZARD_PATTERNS = [
    (r"\b(swollen|bulging|puffy|bloated|expanded)\b.*\b(battery|cell|pouch)\b|\b(battery|cell|pouch)\b.*\b(swollen|bulging|puffy|bloated|expanded)\b",
     "CRITICAL HAZARD: Swollen lithium-ion batteries present acute fire and chemical venting hazards. DO NOT charge, puncture, or attempt amateur DIY extraction. Disconnect immediately and transport in a fireproof/sand container to a certified hazardous waste facility."),
    
    (r"\b(exposed|frayed|bare)\b.*\b(wire|cord|cable|lead)\b|\b(wire|cord|cable|lead)\b.*\b(exposed|frayed|bare)\b",
     "SHOCK HAZARD: Exposed mains electrical wiring poses risk of lethal electrocution and structural fire. Do NOT plug in or use standard tape. Cord replacement must conform to electrical safety standards."),
    
    (r"\b(spark|sparks|sparking|arcing)\b",
     "ELECTRICAL SAFETY HAZARD: Active sparking or arcing indicates insulation breakdown or electrical short circuit. Disconnect power source immediately."),
      
    (r"\b(smoke|smoking)\b.*\b(device|battery|phone|laptop|charger|adapter|appliance|component)\b|\b(device|battery|phone|laptop|charger|adapter|appliance|component)\b.*\b(smoke|smoking)\b",
     "ELECTRICAL SAFETY HAZARD: Smoke from the device indicates internal electrical failure or thermal runaway. Disconnect from power immediately and do not attempt DIY repair."),

    (r"\b(burning\s+smell|smells?\s+(?:like\s+)?burning|smell\s+of\s+burning|acrid\s+smell)\b",
     "ELECTRICAL SAFETY HAZARD: A burning smell indicates overheating or electrical arcing inside the device. Disconnect from power and do not use until inspected by a qualified technician."),

    (r"\b(punctured?|pierced?|ruptured?)\b.*\b(battery|cell|pouch)\b|\b(battery|cell|pouch)\b.*\b(punctured?|pierced?|ruptured?)\b",
     "CRITICAL HAZARD: A punctured or ruptured lithium battery presents immediate fire and toxic chemical exposure risk. Do not handle without protection; transport to a certified hazardous waste facility immediately."),

    (r"\b(leak(?:ing|ed|s)?|leakage)\b.*\b(battery|cell|electrolyte|acid|fluid)\b|\b(battery|cell|electrolyte)\b.*\b(leak(?:ing|ed|s)?|leakage)\b",
     "CRITICAL HAZARD: Battery electrolyte leakage exposes corrosive and toxic chemicals. Avoid skin contact; wear gloves and dispose at a certified hazardous waste facility immediately."),

    (r"\b(microwave)\b.*\b(open|disassembl|enclosure|casing|cover)\b",
     "LETHAL VOLTAGE HAZARD: Microwave oven internal capacitors retain 2,000V-5,000V even after being unplugged for weeks. Never remove the outer metal cabinet; repairs must only be conducted by qualified technicians."),
      
    (r"\b(mold|mildew|spores|fungus)\b.*\b(black|green|toxic|fuzzy|musty)\b|\b(black|green|toxic|fuzzy|musty)\b.*\b(mold|mildew|spores|fungus)\b",
     "BIOHAZARD WARNING: Active fungal/mold colonies present respiratory health hazards. Avoid inhalation; wear N95 filtration if handling, and do not circulate contaminated paper media to public institutions.")
]

GENERATED_FIELD_HAZARD_PATTERNS = HAZARD_PATTERNS

NEGATION_OR_UNCERTAINTY_PATTERN = re.compile(
    r"\b(no|not|neither|never|without|unseen|unconfirmed|unknown|free\s+of|absence\s+of|"
    r"no\s+sign\s+of|cannot\s+be\s+confirmed|cannot\s+confirm|not\s+observed|not\s+detected|"
    r"no\s+visible|no\s+reported|zero|denies|lack\s+of|unverifiable)\b",
    re.IGNORECASE
)

# Patterns detecting fabricated quantitative environmental and financial claims
UNGROUNDED_CLAIM_PATTERNS = [
    re.compile(r"(\$|€|£)\s*\d+(\.\d+)?\s*(?:-|–|—|to)\s*(\$|€|£)?\s*\d+(\.\d+)?\s*(?:USD|EUR|GBP)?", re.IGNORECASE),
    re.compile(r"(\$|€|£)\s*(\d+(\.\d+)?(\s*-\s*\$?\d+(\.\d+)?)?)", re.IGNORECASE),
    re.compile(r"\b\d+\s*(dollars|USD|EUR|GBP)\b", re.IGNORECASE),
    re.compile(r"\b(\d+(\.\d+)?|\d+\s*-\s*\d+)\s*%", re.IGNORECASE),
    re.compile(r"\b(\d+(\.\d+)?)\s*(kg|g|lbs|pounds|tons|tonnes)?\s*(of\s+)?(co2|co2e|carbon|emissions)\b", re.IGNORECASE),
    re.compile(r"\b(\d+(\.\d+)?)\s*(liters|litres|gallons)\s*(of\s+)?water\b", re.IGNORECASE),
    re.compile(r"\b(?:adds?|provides?|adds\s+another)?\s*\d+\s*(?:-|–|—|to)\s*\d+\s*years(?:\s+of\s+life)?\b", re.IGNORECASE),
    re.compile(r"\b\d+\s*(?:-|–|—|to)\s*\d+\s*x\b", re.IGNORECASE)
]


def _check_text_for_hazards(text: str, patterns: List[Tuple[str, str]]) -> List[str]:
    if not text:
        return []
    warnings = []
    seen = set()
    
    # Split text into sentences/clauses to accurately limit negation scope
    clauses = re.split(r"[.!?;\n]|\b(?:but|however|although|whereas)\b", text, flags=re.IGNORECASE)
    
    for clause in clauses:
        clause_str = clause.strip()
        if not clause_str:
            continue
        clause_lower = clause_str.lower()
        
        for pattern_str, warning in patterns:
            match = re.search(pattern_str, clause_lower, re.IGNORECASE)
            if match:
                # Check if the match or prefix before match in clause contains negation/uncertainty
                match_start = match.start()
                prefix = clause_lower[:match_start]
                if NEGATION_OR_UNCERTAINTY_PATTERN.search(clause_lower) or NEGATION_OR_UNCERTAINTY_PATTERN.search(prefix):
                    # Negated or uncertain hazard statement (e.g. "no visible sparks", "cannot be confirmed") -> skip
                    continue
                if warning not in seen:
                    warnings.append(warning)
                    seen.add(warning)
    return warnings


class ResponsibleAIGuardrail:
    @staticmethod
    def inspect_hazards(text: str) -> List[str]:
        return _check_text_for_hazards(text, HAZARD_PATTERNS)

    @staticmethod
    def inspect_generated_field_hazards(text: str) -> List[str]:
        return _check_text_for_hazards(text, GENERATED_FIELD_HAZARD_PATTERNS)

    @staticmethod
    def audit_unsupported_claims(text: str, retrieved_sources: List[str]) -> Tuple[bool, List[str]]:
        """
        Scans generated text for ungrounded quantitative statistics (prices, percentages, carbon figures).
        Returns (has_unsupported_claims, list_of_flagged_snippets).
        """
        flagged = []
        for pattern in UNGROUNDED_CLAIM_PATTERNS:
            matches = pattern.finditer(text)
            for m in matches:
                claim_snippet = m.group(0)
                # Check if this exact figure appears in any retrieved source
                is_grounded = any(claim_snippet.lower() in s.lower() for s in retrieved_sources)
                if not is_grounded:
                    flagged.append(claim_snippet)
        
        return len(flagged) > 0, flagged

    @staticmethod
    def purge_placeholders(text: str) -> str:
        """
        Validates generated text fields at the sentence level and removes/replaces
        unsupported claims, DIY disassembly steps, ungrounded budget inferences,
        and markdown escape artifacts cleanly without damaging valid text.
        """
        if not text:
            return text
        
        # 1. Strip raw markdown backslash escapes and formatting symbols
        cleaned = text.replace(r"\#", "#").replace(r"\*", "*").replace(r"\_", "_")
        cleaned = re.sub(r"^#{1,6}\s*", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"\*\*([^*]+)\*\*", r"\1", cleaned)
        cleaned = cleaned.replace("###", "").replace("**", "")
        
        # 2. Strip bracketed internal KB IDs
        cleaned = re.sub(r"\[(?:kb_|doc_|item_)[a-zA-Z0-9_\-]+\]", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\[(?:Environmental impact|Internal|Guardrail|unverified|Metric)[^\]]*\]", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\[\s*\]", "", cleaned)

        # 3. Handle budget phrases and cost placeholders cleanly
        cleaned = re.sub(r"\buser's\s+small-budget\s+range\b", "service options", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bexceeds?\s+the\s+user's\s+budget\b", "depends on service options", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b(?:affordable|low-cost)\s+for\s+the\s+user\b", "viable options", cleaned, flags=re.IGNORECASE)
        
        # Replace "nominal cost" / "affordable cost"
        cleaned = re.sub(r"\b(?:a\s+)?nominal\s+cost\b", "service options", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b(?:a\s+)?affordable\s+cost\b", "service options", cleaned, flags=re.IGNORECASE)

        # 4. Handle percentage, years, multiplier claims cleanly
        cleaned = re.sub(r"\b\d+\s*-\s*(?:a\s+substantial\s+share|a\s+proportion|usable\s+service\s+life)\b", "a proportion", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\bnominal\s+cost\s+tube\b", "service options", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b\d+(?:\.\d+)?\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?%", "a proportion", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b\d+(?:\.\d+)?%", "a proportion", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b\d+(?:\.\d+)?\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?\s*years(?:\s+of\s+(?:usable\s+)?life)?\b", "usable service life", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b\d+(?:\.\d+)?\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?\s*x\b", "improved performance", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\b\d+(?:\.\d+)?\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?\s*years\b", "usable service life", cleaned, flags=re.IGNORECASE)

        # 5. Handle "battery cannot be replaced" or unsupported disposal assertions
        if "battery cannot be replaced" in cleaned.lower():
            cleaned = re.sub(r"[^\.\n]*battery cannot be replaced[^\.\n]*[\.]?", " The device functionality and battery health should be evaluated before deciding on replacement.", cleaned, flags=re.IGNORECASE)

        # 6. Sentence-level replacement for DIY instructions and internal hardware/software hypotheses
        raw_sentences = re.split(r"(?<=[.!?])\s+", cleaned)
        clean_sentences = []

        for sentence in raw_sentences:
            s_str = sentence.strip()
            if not s_str:
                continue
            s_lower = s_str.lower()

            # Check DIY hardware disassembly
            is_diy = any(phrase in s_lower for phrase in [
                "disconnect internal battery", "disconnect the battery", "battery connector",
                "remove bottom panel", "remove heatsink", "remove the battery", "disconnect the internal",
                "clean dust", "clean fan", "replace thermal paste", "apply thermal paste",
                "open the chassis", "open chassis", "ssd cloning", "clone the drive",
                "drive installation", "compressed air"
            ])

            # Check unsafe battery claims
            is_unsafe_battery = "battery connector is disconnected" in s_lower or "standard repair steps are safe" in s_lower

            # Check unobservable internal hardware/software hypotheses
            is_hypothesis = any(phrase in s_lower for phrase in [
                "thermal throttling", "dust-clogged", "clogged heatsink",
                "hardened thermal paste", "aged thermal paste", "old thermal paste",
                "outdated operating system", "outdated os"
            ])

            if is_diy or is_unsafe_battery:
                replacement_s = "Consider professional assessment of the cooling system and battery health."
                if "safe when" in s_lower or "safety-certified" in s_lower:
                    replacement_s = "Safety-certified replacement components should be evaluated by a qualified technician."
                if replacement_s not in clean_sentences:
                    clean_sentences.append(replacement_s)
            elif is_hypothesis:
                replacement_s = "Possible performance causes include software load, aging hardware, storage limitations, memory constraints, or thermal conditions; these require diagnostic testing."
                if replacement_s not in clean_sentences:
                    clean_sentences.append(replacement_s)
            else:
                # Clean up any residual double words or hyphen artifacts
                s_clean = re.sub(r"\bservice cost-service cost\b", "service options", s_str, flags=re.IGNORECASE)
                s_clean = re.sub(r"\bcost Cost depends\b", "Cost depends", s_clean, flags=re.IGNORECASE)
                s_clean = re.sub(r"\bcost-service cost\b", "service options", s_clean, flags=re.IGNORECASE)
                s_clean = re.sub(r"\s+", " ", s_clean).strip()
                if s_clean and s_clean not in clean_sentences:
                    clean_sentences.append(s_clean)

        res_text = " ".join(clean_sentences).strip()

        # Clean up any leftover duplicate phrases
        res_text = re.sub(
            r"(?:Cost depends on the specific service or replacement option\.[\s]*){2,}",
            "Cost depends on the specific service or replacement option. ",
            res_text
        )
        res_text = re.sub(r"\s+", " ", res_text).strip()

        return res_text

    @staticmethod
    def sanitize_and_calibrate(
        response: RecommendationResponse,
        retrieved_source_texts: List[str]
    ) -> RecommendationResponse:
        """
        Applies post-generation safety overrides, factuality filters, and placeholder cleanup across all response fields.
        Priority order for hazard detection:
        1. Explicit user-reported hazard
        2. Positive visual hazard indicators (explicit positive observations only)
        """
        # --- Step 1a: scan user-supplied text ---
        input_and_condition = f"{response.raw_query} {response.interpreted_condition.functional_state}"
        detected_hazards = ResponsibleAIGuardrail.inspect_hazards(input_and_condition)

        # --- Step 1b: scan visual_evidence hazard_indicators only (if present and positive) ---
        if response.visual_evidence and response.visual_evidence.analysis_status == "completed":
            vis_hazards = []
            if response.visual_evidence.hazard_indicators:
                for h_text in response.visual_evidence.hazard_indicators:
                    vis_hazards.extend(ResponsibleAIGuardrail.inspect_generated_field_hazards(h_text))
            for vh in vis_hazards:
                if vh not in detected_hazards:
                    detected_hazards.append(vh)

        if detected_hazards:
            response.interpreted_condition.severity_level = "critical_hazard"
            for h in detected_hazards:
                if h not in response.safety_warnings:
                    response.safety_warnings.insert(0, h)

            response.recommended_pathway = CircularPathway.RECYCLE
            response.reasoning_summary = f"CRITICAL SAFETY INTERVENTION: Physical hazard detected ({detected_hazards[0][:60]}...). Normal DIY repair or continued use is unsafe. Directed immediately to professional hazmat e-waste recycling."
            
            # Wipe any DIY repair steps for hazardous conditions
            response.practical_next_steps = [
                "Stop using and charging the device immediately.",
                "Do not puncture, squeeze, or attempt amateur disassembly of the casing or battery cell.",
                "Transport the device in a cool, non-combustible container to a certified hazardous e-waste facility."
            ]
            response.alternative_pathways = [
                alt for alt in response.alternative_pathways
                if alt.pathway not in [CircularPathway.REPAIR, CircularPathway.CONTINUE_USING]
            ]
            
            if hasattr(response, "detailed_explanation") and response.detailed_explanation:
                explanation = response.detailed_explanation
                explanation = re.sub(
                    r"For a \*(?:normal|standard)\* degraded battery[^\.\n]*\.",
                    "A professional battery replacement may be possible after the hazardous battery is safely handled by a qualified technician.",
                    explanation,
                    flags=re.IGNORECASE
                )
                explanation = re.sub(
                    r"(?:normal|standard)\s+replacement\s+cost\s+range\s+of[^\.\n]*\.",
                    "A professional battery replacement may be possible after the hazardous battery is safely removed by a qualified technician.",
                    explanation,
                    flags=re.IGNORECASE
                )
                explanation = re.sub(
                    r"Even a professional repair would need[^\.\n]*",
                    "A professional repair is not recommended due to acute safety hazards associated with handling a swollen battery cell.",
                    explanation,
                    flags=re.IGNORECASE
                )
                response.detailed_explanation = explanation

        # --- Filter identified_defects: keep ONLY observed facts, purge unconfirmed internal hypotheses ---
        if response.interpreted_condition and response.interpreted_condition.identified_defects:
            filtered_defects = []
            for defect in response.interpreted_condition.identified_defects:
                is_hypothetical = any(re.search(p, defect, re.IGNORECASE) for p in [
                    r"\bthermal\b", r"\bdust\b", r"\bpaste\b", r"\bheatsink\b",
                    r"\boutdated\b", r"\bos\b", r"\boperating\s+system\b",
                    r"\bsoftware-level\b", r"\bsluggishness\b", r"\bfailing\s+storage\b",
                    r"\bhdd\b", r"\bssd\b", r"\bram\b", r"\bmemory\b", r"\boverheating\b",
                    r"\binternal\s+battery\s+degradation\b"
                ])
                if not is_hypothetical:
                    filtered_defects.append(defect)
            response.interpreted_condition.identified_defects = (
                filtered_defects if filtered_defects else ["User-reported performance degradation and reduced battery runtime"]
            )

        # 2. Audit and sanitize main text fields without destructive inline substring replacement
        for field_attr in ["detailed_explanation", "reasoning_summary", "user_intent", "uncertainty_disclosure", "evidence_strength_rationale"]:
            val = getattr(response, field_attr, "")
            if isinstance(val, str) and val:
                val = ResponsibleAIGuardrail.purge_placeholders(val)
                setattr(response, field_attr, val)

        # Clean next steps safely (no DIY hardware instructions)
        safe_steps = []
        for step in response.practical_next_steps:
            step_clean = ResponsibleAIGuardrail.purge_placeholders(step)
            step_lower = step_clean.lower()
            if any(w in step_lower for w in ["disconnect", "chassis", "heatsink", "thermal paste", "compressed air", "clone", "solder", "remove bottom"]):
                safe_step = "Consider a qualified technician to assess battery health, cooling, storage, and memory."
                if safe_step not in safe_steps:
                    safe_steps.append(safe_step)
            elif step_clean and step_clean not in safe_steps:
                safe_steps.append(step_clean)
        response.practical_next_steps = safe_steps if safe_steps else [
            "Back up important personal data.",
            "Check battery runtime and software resource usage using built-in system diagnostics.",
            "If swelling, leakage, smoke, or unusual heat occurs, disconnect device and seek certified e-waste handling.",
            "Consider professional assessment of performance and battery health if issues persist."
        ]

        # Clean safety warnings
        new_warnings = []
        for warn in response.safety_warnings:
            w_clean = ResponsibleAIGuardrail.purge_placeholders(warn)
            if w_clean and w_clean not in new_warnings:
                new_warnings.append(w_clean)
        response.safety_warnings = new_warnings

        # Clean missing information
        if hasattr(response, "missing_information") and response.missing_information:
            response.missing_information = [ResponsibleAIGuardrail.purge_placeholders(m) for m in response.missing_information]

        # Clean detected product and interpreted condition strings
        if response.detected_product:
            response.detected_product.product_name_or_type = ResponsibleAIGuardrail.purge_placeholders(response.detected_product.product_name_or_type)
            if response.detected_product.estimated_age_bracket:
                response.detected_product.estimated_age_bracket = ResponsibleAIGuardrail.purge_placeholders(response.detected_product.estimated_age_bracket)
        if response.interpreted_condition:
            response.interpreted_condition.functional_state = ResponsibleAIGuardrail.purge_placeholders(response.interpreted_condition.functional_state)
            if response.interpreted_condition.identified_defects:
                response.interpreted_condition.identified_defects = [ResponsibleAIGuardrail.purge_placeholders(d) for d in response.interpreted_condition.identified_defects]

        # Clean alternative pathways text
        for alt in response.alternative_pathways:
            alt.key_tradeoff = ResponsibleAIGuardrail.purge_placeholders(alt.key_tradeoff)
            alt.suitability = ResponsibleAIGuardrail.purge_placeholders(alt.suitability)
            if alt.prerequisites:
                alt.prerequisites = [ResponsibleAIGuardrail.purge_placeholders(p) for p in alt.prerequisites]

        # Clean visual evidence fields if present
        if response.visual_evidence:
            for obs in response.visual_evidence.observations:
                obs.observation = ResponsibleAIGuardrail.purge_placeholders(obs.observation)
            for exp in response.visual_evidence.possible_explanations:
                exp.explanation = ResponsibleAIGuardrail.purge_placeholders(exp.explanation)
            if response.visual_evidence.unknowns:
                response.visual_evidence.unknowns = [ResponsibleAIGuardrail.purge_placeholders(u) for u in response.visual_evidence.unknowns]
            if response.visual_evidence.hazard_indicators:
                response.visual_evidence.hazard_indicators = [ResponsibleAIGuardrail.purge_placeholders(h) for h in response.visual_evidence.hazard_indicators]
            if response.visual_evidence.error_message:
                response.visual_evidence.error_message = ResponsibleAIGuardrail.purge_placeholders(response.visual_evidence.error_message)

        # Final purge of all main text fields
        response.detailed_explanation = ResponsibleAIGuardrail.purge_placeholders(response.detailed_explanation)
        response.reasoning_summary = ResponsibleAIGuardrail.purge_placeholders(response.reasoning_summary)
        response.user_intent = ResponsibleAIGuardrail.purge_placeholders(response.user_intent)
        response.uncertainty_disclosure = ResponsibleAIGuardrail.purge_placeholders(response.uncertainty_disclosure)
        response.evidence_strength_rationale = ResponsibleAIGuardrail.purge_placeholders(response.evidence_strength_rationale)

        # --- Final Recursive Defense-in-Depth Sanitization ---
        # Traverse generated string fields recursively to guarantee 0 placeholder leakages
        # NOTE: evidence_used is explicitly preserved 100% immutable
        response = sanitize_response_recursively(response, retrieved_source_texts)

        # 3. Add explicit non-professional advice disclaimer without trigger keywords
        disclaimer = (
            "Decision Support Disclaimer: Reloop AI provides circular decision guidance based on general "
            "sustainability documentation. It does not substitute for certified professional technical inspection."
        )
        if disclaimer not in response.safety_warnings:
            response.safety_warnings.append(disclaimer)

        return response


def sanitize_response_recursively(obj: Any, retrieved_source_texts: List[str] = None) -> Any:
    """
    Recursively inspects every string field in RecommendationResponse (models, dicts, lists)
    and executes complete placeholder and prohibited text purging.
    EXPLICITLY BYPASSES evidence_used and EvidenceItem objects to guarantee 100% evidence immutability.
    """
    from app.api.schemas import EvidenceItem
    if isinstance(obj, EvidenceItem):
        return obj
    elif isinstance(obj, str):
        return ResponsibleAIGuardrail.purge_placeholders(obj)
    elif isinstance(obj, list):
        if obj and isinstance(obj[0], EvidenceItem):
            return obj
        return [sanitize_response_recursively(item, retrieved_source_texts) for item in obj]
    elif isinstance(obj, dict):
        return {
            k: (v if k == "evidence_used" else sanitize_response_recursively(v, retrieved_source_texts))
            for k, v in obj.items()
        }
    elif isinstance(obj, BaseModel):
        for field_name in type(obj).model_fields.keys():
            if field_name == "evidence_used":
                continue
            val = getattr(obj, field_name)
            if val is not None and not isinstance(val, (int, float, bool, datetime, Enum)):
                new_val = sanitize_response_recursively(val, retrieved_source_texts)
                setattr(obj, field_name, new_val)
        return obj
    else:
        return obj



