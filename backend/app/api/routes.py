from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any

from app.api.schemas import (
    ProductAnalysisRequest,
    WhatIfRequest,
    RecommendationResponse,
    SessionSummary,
    CategoryMetadata,
    EvaluationBenchmarkResult,
    HealthStatusResponse
)
from app.core.orchestrator import get_orchestrator
from app.core.guardrails import ResponsibleAIGuardrail
from app.db.repository import DecisionRepository
from app.knowledge.loader import get_categories_metadata
from app.rag.vector_store import get_vector_store
from app.core.config import settings

from app.llm import AIProviderUnavailableError, AIRateLimitError, get_llm_client

api_router = APIRouter(prefix="/api/v1")

@api_router.post("/analyze", response_model=RecommendationResponse)
def analyze_product(request: ProductAnalysisRequest):
    try:
        orchestrator = get_orchestrator()
        response = orchestrator.analyze_product(request)
        DecisionRepository.save_session(response)
        return response
    except AIProviderUnavailableError as e:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI Engine Unavailable: No live LLM provider is configured. "
                "Please configure GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in backend/.env "
                "to perform live AI circular decision intelligence."
            )
        )
    except AIRateLimitError as e:
        raise HTTPException(
            status_code=429,
            detail="AI provider rate limit or quota currently exceeded. Please try again shortly."
        )
    except Exception as e:
        resp = getattr(e, "response", None)
        if resp is not None and getattr(resp, "status_code", None) == 429:
            raise HTTPException(
                status_code=429,
                detail="AI provider rate limit or quota currently exceeded. Please try again shortly."
            )
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@api_router.post("/what-if", response_model=RecommendationResponse)
def what_if_analysis(request: WhatIfRequest):
    original = DecisionRepository.get_session(request.session_id)
    if not original:
        raise HTTPException(status_code=404, detail="Original analysis session not found.")

    try:
        orchestrator = get_orchestrator()
        updated_response = orchestrator.evaluate_what_if(original, request)
        updated_response = ResponsibleAIGuardrail.sanitize_and_calibrate(updated_response, [])
        DecisionRepository.save_session(updated_response)
        return updated_response
    except AIProviderUnavailableError as e:
        raise HTTPException(
            status_code=503,
            detail=(
                "AI Engine Unavailable: No live LLM provider is configured. "
                "Please configure GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in backend/.env "
                "to perform live AI circular decision intelligence."
            )
        )
    except AIRateLimitError as e:
        raise HTTPException(
            status_code=429,
            detail="AI provider rate limit or quota currently exceeded. Please try again shortly."
        )
    except Exception as e:
        resp = getattr(e, "response", None)
        if resp is not None and getattr(resp, "status_code", None) == 429:
            raise HTTPException(
                status_code=429,
                detail="AI provider rate limit or quota currently exceeded. Please try again shortly."
            )
        raise HTTPException(status_code=500, detail=f"What-if re-evaluation failed: {str(e)}")


@api_router.get("/history", response_model=List[SessionSummary])
def get_history(limit: int = 30):
    return DecisionRepository.list_sessions(limit=limit)


@api_router.get("/history/{session_id}", response_model=RecommendationResponse)
def get_history_detail(session_id: str):
    session = DecisionRepository.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    session = ResponsibleAIGuardrail.sanitize_and_calibrate(session, [])
    return session


@api_router.get("/knowledge/categories", response_model=List[CategoryMetadata])
def get_categories():
    raw = get_categories_metadata()
    return [CategoryMetadata(**item) for item in raw]


@api_router.post("/evaluate/run", response_model=EvaluationBenchmarkResult)
def run_evaluation_benchmark():
    # Guard: evaluation endpoint consumes LLM API quota and writes files to disk.
    # It is disabled by default; set ENABLE_EVAL_ENDPOINT=true in backend/.env to enable.
    if not settings.enable_eval_endpoint:
        raise HTTPException(
            status_code=403,
            detail=(
                "Evaluation benchmark endpoint is disabled in this environment. "
                "Set ENABLE_EVAL_ENDPOINT=true in backend/.env to enable it for local testing."
            )
        )
    from tests.run_benchmark import execute_benchmark_suite
    try:
        result = execute_benchmark_suite()
        DecisionRepository.save_evaluation_run(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark run failed: {str(e)}")


@api_router.get("/health", response_model=HealthStatusResponse)
def get_health():
    vstore = get_vector_store()
    categories = [c["category"] for c in get_categories_metadata()]

    status_str = "healthy"
    provider_name = "None configured (AI Engine Offline)"
    active_model = "None"
    ai_available = False

    try:
        llm = get_llm_client()
        provider_name = llm.get_provider_name()
        if "test fixture" in provider_name.lower():
            status_str = "test-fixture-mode"
            active_model = "test-mock-rules"
            ai_available = False
        else:
            status_str = "healthy"
            ai_available = True
            active_model = getattr(llm, "model", "Unknown")
    except AIProviderUnavailableError:
        status_str = "degraded (LLM API key required)"
        provider_name = "None configured (Live LLM Key Required)"
        active_model = "None"
        ai_available = False

    return HealthStatusResponse(
        status=status_str,
        llm_provider=provider_name,
        active_model=active_model,
        vector_index_documents=len(vstore.documents),
        supported_categories=categories,
        sqlite_status="connected (WAL mode enabled)",
        ai_available=ai_available,
        build_identifier="multimodal-output-control-v2"
    )

