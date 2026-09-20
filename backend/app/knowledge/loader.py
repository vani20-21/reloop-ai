import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DATA_DIR = Path(__file__).parent / "data"

class KnowledgeDocument:
    def __init__(
        self,
        doc_id: str,
        category: str,
        title: str,
        symptoms: List[str],
        pathway_suitability: Dict[str, str],
        repair_considerations: str,
        reuse_possibilities: str,
        donation_considerations: str,
        repurposing_possibilities: str,
        recycling_considerations: str,
        safety_limitations: str,
        evidence_text: str,
        source: str,
        publication_year: int,
        source_name: Optional[str] = None,
        source_url: Optional[str] = None,
        retrieved_date: Optional[str] = None
    ):
        self.doc_id = doc_id
        self.category = category
        self.title = title
        self.symptoms = symptoms
        self.pathway_suitability = pathway_suitability
        self.repair_considerations = repair_considerations
        self.reuse_possibilities = reuse_possibilities
        self.donation_considerations = donation_considerations
        self.repurposing_possibilities = repurposing_possibilities
        self.recycling_considerations = recycling_considerations
        self.safety_limitations = safety_limitations
        self.evidence_text = evidence_text
        self.source = source
        self.publication_year = publication_year
        self.source_name = source_name or source
        self.source_url = source_url or ""
        self.retrieved_date = retrieved_date or "2024-06-15"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "doc_id": self.doc_id,
            "category": self.category,
            "title": self.title,
            "symptoms": self.symptoms,
            "pathway_suitability": self.pathway_suitability,
            "repair_considerations": self.repair_considerations,
            "reuse_possibilities": self.reuse_possibilities,
            "donation_considerations": self.donation_considerations,
            "repurposing_possibilities": self.repurposing_possibilities,
            "recycling_considerations": self.recycling_considerations,
            "safety_limitations": self.safety_limitations,
            "evidence_text": self.evidence_text,
            "source": self.source,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "publication_year": self.publication_year,
            "retrieved_date": self.retrieved_date
        }

    def to_searchable_text(self) -> str:
        symptoms_str = ", ".join(self.symptoms)
        suitability_str = " | ".join([f"{k}: {v}" for k, v in self.pathway_suitability.items()])
        return (
            f"Category: {self.category}\n"
            f"Title: {self.title}\n"
            f"Symptoms: {symptoms_str}\n"
            f"Suitability: {suitability_str}\n"
            f"Repair: {self.repair_considerations}\n"
            f"Reuse: {self.reuse_possibilities}\n"
            f"Donation: {self.donation_considerations}\n"
            f"Repurpose: {self.repurposing_possibilities}\n"
            f"Recycle: {self.recycling_considerations}\n"
            f"Safety: {self.safety_limitations}\n"
            f"Evidence: {self.evidence_text}\n"
            f"Source: {self.source_name} ({self.publication_year})\n"
            f"Source URL: {self.source_url}"
        )


def load_all_knowledge_documents() -> List[KnowledgeDocument]:
    documents: List[KnowledgeDocument] = []
    if not DATA_DIR.exists():
        return documents

    for json_file in sorted(DATA_DIR.glob("*.json")):
        with open(json_file, "r", encoding="utf-8") as f:
            raw_docs = json.load(f)
            for item in raw_docs:
                doc = KnowledgeDocument(
                    doc_id=item["doc_id"],
                    category=item["category"],
                    title=item["title"],
                    symptoms=item.get("symptoms", []),
                    pathway_suitability=item.get("pathway_suitability", {}),
                    repair_considerations=item.get("repair_considerations", ""),
                    reuse_possibilities=item.get("reuse_possibilities", ""),
                    donation_considerations=item.get("donation_considerations", ""),
                    repurposing_possibilities=item.get("repurposing_possibilities", ""),
                    recycling_considerations=item.get("recycling_considerations", ""),
                    safety_limitations=item.get("safety_limitations", ""),
                    evidence_text=item.get("evidence_text", ""),
                    source=item.get("source", item.get("source_name", "Sustainability KB")),
                    publication_year=item.get("publication_year", 2023),
                    source_name=item.get("source_name", item.get("source", "Sustainability KB")),
                    source_url=item.get("source_url", ""),
                    retrieved_date=item.get("retrieved_date", "2024-06-15")
                )
                documents.append(doc)

    return documents


def get_categories_metadata() -> List[Dict[str, Any]]:
    docs = load_all_knowledge_documents()
    cat_map: Dict[str, int] = {}
    for d in docs:
        cat_map[d.category] = cat_map.get(d.category, 0) + 1
    
    return [
        {"category": cat, "document_count": count}
        for cat, count in sorted(cat_map.items())
    ]
