import json
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.db.database import get_db_connection
from app.api.schemas import RecommendationResponse, SessionSummary, EvaluationBenchmarkResult

class DecisionRepository:
    @staticmethod
    def save_session(response: RecommendationResponse) -> None:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO sessions (
            session_id, created_at, product_name, category, raw_query,
            recommended_pathway, confidence_score, response_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            response.session_id,
            response.timestamp.isoformat(),
            response.detected_product.product_name_or_type,
            response.detected_product.category,
            response.raw_query,
            response.recommended_pathway.value,
            response.confidence_score,
            response.model_dump_json()
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_session(session_id: str) -> Optional[RecommendationResponse]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT response_json FROM sessions WHERE session_id = ?", (session_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            data = json.loads(row["response_json"])
            return RecommendationResponse.model_validate(data)
        return None

    @staticmethod
    def list_sessions(limit: int = 30) -> List[SessionSummary]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT session_id, created_at, product_name, category, raw_query,
               recommended_pathway, confidence_score
        FROM sessions
        ORDER BY created_at DESC
        LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()

        summaries = []
        for r in rows:
            summaries.append(SessionSummary(
                session_id=r["session_id"],
                timestamp=datetime.fromisoformat(r["created_at"]),
                product_name=r["product_name"],
                category=r["category"],
                recommended_pathway=r["recommended_pathway"],
                confidence_score=r["confidence_score"],
                raw_query_snippet=r["raw_query"][:80] + ("..." if len(r["raw_query"]) > 80 else "")
            ))
        return summaries

    @staticmethod
    def save_evaluation_run(result: EvaluationBenchmarkResult) -> None:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO evaluation_runs (
            run_id, created_at, total_cases, quality_index, metrics_json
        ) VALUES (?, ?, ?, ?, ?)
        """, (
            result.run_id,
            result.timestamp.isoformat(),
            result.total_cases,
            result.overall_quality_index,
            result.model_dump_json()
        ))
        conn.commit()
        conn.close()
