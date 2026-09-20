export type CircularPathway = 
  | 'continue_using' 
  | 'repair' 
  | 'reuse' 
  | 'donate' 
  | 'repurpose' 
  | 'recycle';

export type EffortLevel = 'low' | 'medium' | 'high';

export interface ProductAnalysisRequest {
  product_description: string;
  category_hint?: string | null;
  user_effort_preference: EffortLevel;
  willing_to_spend_small_amount: boolean;
  image_base64?: string | null;
  image_mime_type?: string | null;
}

export interface WhatIfRequest {
  session_id: string;
  altered_condition?: string;
  altered_effort_preference?: EffortLevel;
  part_available?: boolean;
  willing_to_spend_small_amount?: boolean;
}

export interface VisualObservation {
  observation: string;
  confidence: 'high' | 'medium' | 'low' | string;
}

export interface PossibleExplanation {
  explanation: string;
  confidence: 'high' | 'medium' | 'low' | string;
}

export interface VisualEvidence {
  observations: VisualObservation[];
  possible_explanations: PossibleExplanation[];
  unknowns: string[];
  visible_damage: boolean;
  hazard_indicators: string[];
  analysis_status: 'completed' | 'unavailable' | 'error' | string;
  error_message?: string | null;
}

export interface DetectedProduct {
  category: string;
  product_name_or_type: string;
  estimated_age_bracket?: string;
  material_or_construction?: string;
}

export interface InterpretedCondition {
  functional_state: string;
  identified_defects: string[];
  severity_level: 'none' | 'mild' | 'moderate' | 'severe' | 'critical_hazard';
  safety_concerns: string[];
}

export interface EvidenceItem {
  doc_id: string;
  source_title: string;
  source_organization: string;
  source_url?: string;
  key_finding: string;
  relevance_to_decision: string;
  publication_year?: number;
  retrieved_date?: string;
  retrieval_score?: number;
}

export interface PathwayOption {
  pathway: CircularPathway;
  rank: number;
  suitability: string;
  key_tradeoff: string;
  prerequisites: string[];
}

export interface RecommendationResponse {
  session_id: string;
  timestamp: string;
  raw_query: string;
  detected_product: DetectedProduct;
  interpreted_condition: InterpretedCondition;
  user_intent: string;
  recommended_pathway: CircularPathway;
  evidence_strength: 'Strong' | 'Moderate' | 'Limited';
  evidence_strength_rationale?: string;
  confidence_score: number;
  confidence_level: 'Strong' | 'Moderate' | 'Limited' | 'High' | 'Low';
  uncertainty_disclosure: string;
  reasoning_summary: string;
  detailed_explanation: string;
  alternative_pathways: PathwayOption[];
  visual_evidence?: VisualEvidence | null;
  evidence_used: EvidenceItem[];
  safety_warnings: string[];
  missing_information: string[];
  practical_next_steps: string[];
  sdg_alignment: {
    sdg_12: string;
    sdg_11: string;
  };
}


export interface SessionSummary {
  session_id: string;
  timestamp: string;
  product_name: string;
  category: string;
  recommended_pathway: CircularPathway;
  confidence_score: number;
  raw_query_snippet: string;
}

export interface CategoryMetadata {
  category: string;
  document_count: number;
}

export interface EvaluationBenchmarkResult {
  run_id: string;
  timestamp: string;
  total_cases: number;
  product_understanding_accuracy: number;
  retrieval_relevance_rate: number;
  recommendation_alignment_rate: number;
  evidence_grounding_score: number;
  unsupported_claim_rate: number;
  hazard_compliance_rate: number;
  uncertainty_disclosure_rate: number;
  overall_quality_index: number;
  failed_cases: Array<{
    id: string;
    text: string;
    expected: string;
    actual: string;
  }>;
}

export interface HealthStatusResponse {
  status: string;
  llm_provider: string;
  active_model: string;
  vector_index_documents: number;
  supported_categories: string[];
  sqlite_status: string;
  ai_available: boolean;
}
