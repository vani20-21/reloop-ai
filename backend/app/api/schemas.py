from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class EffortLevel(str, Enum):
    LOW = "low"          # Low effort (e.g., drop off, donate, sell as-is, minimal clean)
    MEDIUM = "medium"    # Moderate effort (order $10 replacement part, basic screwdriver/mending)
    HIGH = "high"        # High effort (comfortable with soldering, complete tear-down, repurposing firmware)


class CircularPathway(str, Enum):
    CONTINUE_USING = "continue_using"
    REPAIR = "repair"
    REUSE = "reuse"
    DONATE = "donate"
    REPURPOSE = "repurpose"
    RECYCLE = "recycle"


class EvidenceStrength(str, Enum):
    STRONG = "Strong"
    MODERATE = "Moderate"
    LIMITED = "Limited"


class ProductAnalysisRequest(BaseModel):
    product_description: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Natural language description of the product, age, symptoms, and condition"
    )
    category_hint: Optional[str] = Field(None, description="Optional category hint (e.g. laptops, clothing)")
    user_effort_preference: EffortLevel = Field(EffortLevel.MEDIUM, description="User willingness to invest effort")
    willing_to_spend_small_amount: bool = Field(True, description="Willingness to spend $5-$30 on parts/tools")
    image_base64: Optional[str] = Field(None, description="Optional base64-encoded image string for visual analysis")
    image_mime_type: Optional[str] = Field(None, description="Optional MIME type, e.g. 'image/jpeg', 'image/png'")


class WhatIfRequest(BaseModel):
    session_id: str = Field(..., description="ID of existing analysis session to mutate")
    altered_condition: Optional[str] = Field(None, description="Hypothetical modified physical condition")
    altered_effort_preference: Optional[EffortLevel] = Field(None, description="Modified user effort level")
    part_available: Optional[bool] = Field(None, description="Whether spare parts are accessible")
    willing_to_spend_small_amount: Optional[bool] = Field(None)


class VisualObservation(BaseModel):
    observation: str = Field(..., description="Directly visible observation from image")
    confidence: str = Field("medium", description="Confidence level: high, medium, or low")


class PossibleExplanation(BaseModel):
    explanation: str = Field(..., description="Possible explanation for observed visual state")
    confidence: str = Field("medium", description="Confidence level: high, medium, or low")


class VisualEvidence(BaseModel):
    observations: List[VisualObservation] = Field(default_factory=list)
    possible_explanations: List[PossibleExplanation] = Field(default_factory=list)
    unknowns: List[str] = Field(default_factory=list)
    visible_damage: bool = False
    hazard_indicators: List[str] = Field(default_factory=list)
    analysis_status: str = Field("completed", description="'completed', 'unavailable', or 'error'")
    error_message: Optional[str] = None


class DetectedProduct(BaseModel):
    category: str = Field(..., description="E.g. laptops, smartphones, clothing, etc.")
    product_name_or_type: str = Field(..., description="Specific product identifier or model estimate")
    estimated_age_bracket: Optional[str] = Field(None, description="Estimated age range, e.g. '3-5 years old'")
    material_or_construction: Optional[str] = Field(None, description="E.g. 'Aluminum unibody', 'Wool knit'")


class InterpretedCondition(BaseModel):
    functional_state: str = Field(..., description="E.g. 'Operable with battery wear', 'Non-functional mechanical'")
    identified_defects: List[str] = Field(default_factory=list)
    severity_level: str = Field(..., description="'none', 'mild', 'moderate', 'severe', or 'critical_hazard'")
    safety_concerns: List[str] = Field(default_factory=list)


class EvidenceItem(BaseModel):
    doc_id: str
    source_title: str
    source_organization: str
    source_name: str = Field(default="")
    source_url: str = Field(default="")
    key_finding: str
    relevance_to_decision: str
    publication_year: Optional[int] = None
    retrieved_date: Optional[str] = None
    retrieval_score: Optional[float] = None


class PathwayOption(BaseModel):
    pathway: CircularPathway
    rank: int
    suitability: str       # "Optimal", "Viable Alternative", "Sub-optimal", "Not Recommended"
    key_tradeoff: str
    prerequisites: List[str] = Field(default_factory=list)


class RecommendationResponse(BaseModel):
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    raw_query: str
    detected_product: DetectedProduct
    interpreted_condition: InterpretedCondition
    user_intent: str
    
    # Core Recommendation
    recommended_pathway: CircularPathway
    evidence_strength: EvidenceStrength = Field(default=EvidenceStrength.MODERATE)
    evidence_strength_rationale: str = Field(default="")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    confidence_level: str   # "Strong", "Moderate", "Limited"
    uncertainty_disclosure: str
    
    # Reasoning & Alternatives
    reasoning_summary: str
    detailed_explanation: str
    alternative_pathways: List[PathwayOption]
    
    # Multimodal Visual Evidence
    visual_evidence: Optional[VisualEvidence] = Field(default=None)

    # Grounding & Safety
    evidence_used: List[EvidenceItem] = Field(default_factory=list)
    safety_warnings: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    practical_next_steps: List[str] = Field(default_factory=list)
    
    # SDG Alignment
    sdg_alignment: Dict[str, str] = Field(
        default_factory=lambda: {
            "sdg_12": "UN SDG 12 (Target 12.5): Prioritizes product life extension over premature material recovery, curbing virgin mineral/fiber extraction and manufacturing footprint.",
            "sdg_11": "UN SDG 11 (Target 11.6): Reduces municipal solid waste and hazardous e-waste generation in urban centers by diverting goods into circular reuse and repair streams."
        }
    )



class SessionSummary(BaseModel):
    session_id: str
    timestamp: datetime
    product_name: str
    category: str
    recommended_pathway: CircularPathway
    confidence_score: float
    raw_query_snippet: str


class CategoryMetadata(BaseModel):
    category: str
    document_count: int


class EvaluationTestCase(BaseModel):
    id: str
    category: str
    product_text: str
    expected_category: str
    expected_primary_pathway: CircularPathway
    acceptable_alternatives: List[CircularPathway]
    expected_severity: str
    is_hazard: bool
    is_ambiguous: bool
    notes: Optional[str] = None


class EvaluationBenchmarkResult(BaseModel):
    run_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    llm_provider: str = "unknown"
    evaluation_mode: str = "automated_benchmark"
    total_cases: int
    product_understanding_accuracy: float
    retrieval_relevance_rate: float
    recommendation_alignment_rate: float
    evidence_grounding_score: float
    alternative_pathway_quality_score: float = 0.0
    unsupported_claim_rate: float
    hazard_compliance_rate: float
    uncertainty_disclosure_rate: float
    overall_quality_index: float
    methodology_notes: Optional[str] = None
    failed_cases: List[Dict[str, Any]] = Field(default_factory=list)


class HealthStatusResponse(BaseModel):
    status: str
    llm_provider: str
    active_model: str
    vector_index_documents: int
    supported_categories: List[str]
    sqlite_status: str
    ai_available: bool = Field(default=False)
    build_identifier: str = Field(default="multimodal-output-control-v2")

