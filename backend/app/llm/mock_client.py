import json
import re
from typing import Dict, Any, List
from .base import BaseLLMClient
from app.api.schemas import CircularPathway

class MockDeterministicClient(BaseLLMClient):
    """
    [TEST FIXTURE ONLY] Deterministic rule-based mock client for automated CI/CD and unit tests.
    WARNING: This client operates via heuristic keyword pattern matching and is NOT a real LLM.
    Production and live runtime environments must never silently use this mock.
    """
    def get_provider_name(self) -> str:
        return "Test Fixture Mock (Deterministic Rules - NOT LIVE AI)"

    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        query_match = re.search(r"<product_query>(.*?)</product_query>", user_prompt, re.DOTALL)
        if query_match:
            text_lower = query_match.group(1).lower()
        else:
            text_lower = user_prompt.lower()
        
        # 1. Product Identification & Category Extraction
        category = "laptops"
        product_name = "Portable Computer"
        age_bracket = "3-5 years old"
        material = "Mixed polymer and electronics"

        if any(w in text_lower for w in ["phone", "iphone", "android", "pixel", "samsung", "screen", "oled", "digitizer", "tablet", "ipad"]):
            category = "smartphones"
            product_name = "Smartphone / Tablet Device"
            age_bracket = "2-4 years old"
            material = "Glass, aluminum, lithium battery"
        elif any(w in text_lower for w in ["laptop", "macbook", "thinkpad", "dell", "xps", "notebook", "pc"]):
            category = "laptops"
            product_name = "Laptop Computer"
            age_bracket = "3-6 years old"
            material = "Aluminum/Polycarbonate chassis"
        elif any(w in text_lower for w in ["headphone", "speaker", "earbuds", "controller", "gamepad", "e-reader", "kindle"]):
            category = "consumer_electronics"
            product_name = "Consumer Audio/Peripherals"
            age_bracket = "2-5 years old"
            material = "Acoustic transducers, plastic, polyurethane"
        elif any(w in text_lower for w in ["shirt", "sweater", "jacket", "jeans", "coat", "wool", "denim", "cotton", "puffer", "fabric"]):
            category = "clothing"
            product_name = "Apparel / Textile Garment"
            age_bracket = "1-3 years old"
            material = "Woven / knit textile fibers"
        elif any(w in text_lower for w in ["book", "novel", "textbook", "encyclopedia", "pages", "hardcover", "paperback"]):
            category = "books"
            product_name = "Bound Printed Book"
            age_bracket = "5-20 years old"
            material = "Paper pulp, cloth/board binding"
        elif any(w in text_lower for w in ["chair", "table", "desk", "sofa", "couch", "bookcase", "shelf", "wood", "mdf", "cabinet"]):
            category = "furniture"
            product_name = "Furniture Piece"
            age_bracket = "4-15 years old"
            material = "Timber or engineered wood"
        elif any(w in text_lower for w in ["kettle", "toaster", "blender", "microwave", "vacuum", "iron", "cord", "motor", "appliance"]):
            category = "small_appliances"
            product_name = "Small Domestic Appliance"
            age_bracket = "3-8 years old"
            material = "Mains electrical componentry, steel/plastic"

        # 2. Hazard & Severity Extraction
        is_swollen = any(w in text_lower for w in ["swollen", "bulging", "bloated", "puffy"])
        is_sparking = (any(w in text_lower for w in ["spark", "sparking", "arcing"]) or 
                       ("smoke" in text_lower and "toaster" not in text_lower) or 
                       ("burned" in text_lower and "toaster" not in text_lower and "charcoal" not in text_lower))
        is_frayed = any(w in text_lower for w in ["frayed", "exposed wire", "shock", "bare wire", "bare copper", "insulation split"])
        is_mold = any(w in text_lower for w in ["mold", "mildew", "spores", "fungus"]) and "musty" in text_lower
        is_hazard = is_swollen or is_sparking or is_frayed or is_mold

        defects = []
        if is_swollen: defects.append("Swollen lithium pouch battery")
        if is_sparking: defects.append("Internal electrical arcing / sparking")
        if is_frayed: defects.append("Exposed mains power cord")
        if is_mold: defects.append("Active fungal mold contamination")
        if "battery" in text_lower and not is_swollen: defects.append("Reduced battery runtime / degradation")
        if "crack" in text_lower or "shatter" in text_lower or "rip" in text_lower: defects.append("Surface fracture or enclosure tear")
        if "wobble" in text_lower or "loose" in text_lower: defects.append("Mechanical loose joint or fastener")
        if "slow" in text_lower or "thermal" in text_lower or "fan" in text_lower: defects.append("Thermal throttling or software bloat")
        if "scale" in text_lower or "crumb" in text_lower: defects.append("Residue or mineral build-up")

        if not defects:
            defects.append("Functional product / cosmetic wear or user upgrade")

        # Severity Classification
        is_pristine = any(w in text_lower for w in ["mint", "pristine", "works fine", "works perfectly", "immaculate", "read once", "no issues", "flawless", "good shape"]) and not any(w in text_lower for w in ["shatter", "spark", "swollen", "crack", "spilled", "burn"])
        
        severity = "mild"
        if is_hazard:
            severity = "critical_hazard"
        elif is_pristine:
            severity = "none"
        elif any(w in text_lower for w in ["shatter", "broken", "won't turn on", "dead", "crumbled", "spilled", "salt water", "corroded"]):
            severity = "severe"
        elif any(w in text_lower for w in ["drain", "wobbly", "slow", "tear", "rip", "peel", "loose", "hinge"]):
            severity = "moderate"

        # 3. Decision Heuristic (Prioritizing Life Extension)
        recommended_pathway = CircularPathway.REPAIR
        confidence = 0.88
        confidence_level = "High"
        uncertainty = "Assessment assumes internal circuitry is intact without unstated liquid ingress."

        if is_hazard:
            if is_sparking and "microwave" in text_lower and "casing" not in text_lower:
                recommended_pathway = CircularPathway.REPAIR
                confidence = 0.84
                uncertainty = "If sparking persists after mica sheet swap, the magnetron is damaged, requiring professional recycling."
            elif is_frayed:
                recommended_pathway = CircularPathway.REPAIR
                confidence = 0.82
                uncertainty = "Requires qualified electrical rewiring; do not operate until certified."
            else:
                recommended_pathway = CircularPathway.RECYCLE
                confidence = 0.95
                confidence_level = "High"
                uncertainty = "Hazardous condition supersedes life extension; certified disposal is mandatory for public safety."
        elif any(w in text_lower for w in ["salt water", "spilled", "wine spilled", "frp lock", "activation lock", "flooded"]):
            recommended_pathway = CircularPathway.RECYCLE
            confidence = 0.90
        elif any(w in text_lower for w in ["crumb", "scale", "limescale", "lint", "board book", "screen responds 100%"]):
            recommended_pathway = CircularPathway.CONTINUE_USING
            confidence = 0.90
        elif any(w in text_lower for w in ["fast-fashion", "fast fashion", "encyclopedia", "britannica", "hinge", "headless", "banking apps"]):
            recommended_pathway = CircularPathway.REPURPOSE
            confidence = 0.86
        elif any(w in text_lower for w in ["suit", "job-interview", "dress for success", "charity"]):
            recommended_pathway = CircularPathway.DONATE
            confidence = 0.88
        elif is_pristine or any(w in text_lower for w in ["read once", "bestseller", "bought new", "bought a newer", "newer one", "sitting in drawer", "filing cabinet", "paper records"]):
            recommended_pathway = CircularPathway.REUSE
            confidence = 0.89
        elif "slow" in text_lower and "fan" not in text_lower and "drive" not in text_lower:
            recommended_pathway = CircularPathway.CONTINUE_USING
            confidence = 0.88

        # 4. Generate Structured JSON Response
        return {
            "detected_product": {
                "category": category,
                "product_name_or_type": product_name,
                "estimated_age_bracket": age_bracket,
                "material_or_construction": material
            },
            "interpreted_condition": {
                "functional_state": f"Identified state: {severity.replace('_', ' ').capitalize()} condition with {len(defects)} primary symptom(s).",
                "identified_defects": defects,
                "severity_level": severity,
                "safety_concerns": ["Observe standard electrical safety precautions."] if not is_hazard else ["CRITICAL HAZARD DETECTED."]
            },
            "user_intent": "Determining optimal circular next-life pathway to minimize waste.",
            "recommended_pathway": recommended_pathway.value,
            "confidence_score": confidence,
            "confidence_level": confidence_level,
            "uncertainty_disclosure": uncertainty,
            "reasoning_summary": (
                f"Prioritizing the circular waste hierarchy for {product_name}. "
                f"Based on evaluated condition ({severity}), selecting {recommended_pathway.value.upper()} "
                f"retains maximum product utility and embodied materials before resorting to lower recovery tiers."
            ),
            "detailed_explanation": (
                f"### Circular Decision Evaluation for {product_name}\n\n"
                f"In accordance with UN SDG 12 principles, product life extension yields significantly higher "
                f"resource conservation than material recovery or recycling. "
                f"The physical assessment indicates {', '.join(defects)}. "
                f"Pursuing the **{recommended_pathway.value.replace('_', ' ').title()}** pathway directly preserves "
                f"the embodied energy and manufacturing value of the underlying materials without generating premature e-waste.\n\n"
                f"**Trade-off Analysis:** While recycling remains a viable fallback, shredding and remelting "
                f"downcycles structural integrity. Retaining the device in functional circulation displaces the extraction "
                f"of virgin raw materials."
            ),
            "alternative_pathways": [
                {
                    "pathway": "repurpose" if recommended_pathway != CircularPathway.REPURPOSE else "reuse",
                    "rank": 2,
                    "suitability": "Viable Alternative",
                    "key_tradeoff": "Requires adapting product into secondary role, bypassing primary resale.",
                    "prerequisites": ["Functional core electronics or chassis."]
                },
                {
                    "pathway": "recycle" if recommended_pathway != CircularPathway.RECYCLE else "donate",
                    "rank": 3,
                    "suitability": "Fallback Option",
                    "key_tradeoff": "Recovers raw materials but loses 100% of manufactured component utility.",
                    "prerequisites": ["Certified e-waste or textile drop-off facility."]
                }
            ],
            "safety_warnings": [] if not is_hazard else ["Observe hazardous safety protocol immediately."],
            "missing_information": [
                "Exact manufacturer model number and component part availability.",
                "Whether user possesses standard precision screwdrivers or basic tools."
            ],
            "practical_next_steps": [
                f"Step 1: Safely power down or stabilize the {product_name}.",
                f"Step 2: Inspect defective areas ({', '.join(defects[:2])}) against reputable repair guides.",
                f"Step 3: Execute {recommended_pathway.value.replace('_', ' ')} protocol or locate certified local partner."
            ]
        }
