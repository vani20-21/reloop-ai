from typing import List, Optional, Dict, Any
from .vector_store import get_vector_store, RetrievedChunk

class SustainabilityRetriever:
    def __init__(self):
        self.store = get_vector_store()

    def retrieve(
        self,
        extracted_product: str,
        detected_category: Optional[str] = None,
        symptoms_and_condition: str = "",
        top_k: int = 3
    ) -> List[RetrievedChunk]:
        """
        Synthesizes a targeted retrieval query combining the extracted product name,
        category, and observed physical condition/symptoms.
        """
        query_parts = []
        if extracted_product:
            query_parts.append(extracted_product)
        if detected_category:
            query_parts.append(detected_category)
        if symptoms_and_condition:
            query_parts.append(symptoms_and_condition)

        combined_query = " ".join(query_parts)
        
        chunks = self.store.search(
            query=combined_query,
            category=detected_category,
            top_k=top_k,
            min_score=0.03
        )
        return chunks

    def format_evidence_for_prompt(self, chunks: List[RetrievedChunk]) -> str:
        """
        Formats retrieved evidence into structured markdown text for LLM injection,
        ensuring unambiguous demarcation of empirical facts vs LLM reasoning.
        """
        if not chunks:
            return "<retrieved_evidence>\nNo specific knowledge base evidence retrieved for this query.\n</retrieved_evidence>"

        lines = ["<retrieved_evidence>", "### RETRIEVED SUSTAINABILITY KNOWLEDGE BASE EVIDENCE:"]
        for idx, chunk in enumerate(chunks, 1):
            lines.append(f"\n[Evidence Item #{idx}]")
            lines.append(f"- Document ID: {chunk.doc_id}")
            lines.append(f"- Document Category: {chunk.category}")
            lines.append(f"- Topic / Title: {chunk.title}")
            lines.append(f"- Semantic Retrieval Score: {chunk.score:.3f}")
            lines.append(f"- Repair Considerations: {chunk.repair_considerations}")
            lines.append(f"- Pathway Guidance: {chunk.pathway_suitability}")
            lines.append(f"- Safety & Hazard Limits: {chunk.safety_limitations}")
            lines.append(f"- Exact Empirical Evidence: \"{chunk.evidence_text}\"")
            lines.append(f"- Source Citation: {chunk.source_name} ({chunk.publication_year})")
            if chunk.source_url:
                lines.append(f"- Source URL: {chunk.source_url}")
        lines.append("</retrieved_evidence>")
        return "\n".join(lines)



retriever_instance = SustainabilityRetriever()

def get_retriever() -> SustainabilityRetriever:
    return retriever_instance
