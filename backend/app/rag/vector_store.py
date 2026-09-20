import os
import re
import pickle
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np

from app.knowledge.loader import KnowledgeDocument, load_all_knowledge_documents

INDEX_CACHE_PATH = Path(__file__).parent.parent.parent / "data" / "vector_index.pkl"

class RetrievedChunk:
    def __init__(
        self,
        doc_id: str,
        category: str,
        title: str,
        score: float,
        evidence_text: str,
        safety_limitations: str,
        repair_considerations: str,
        pathway_suitability: Dict[str, str],
        source: str,
        publication_year: int,
        matched_symptoms: List[str],
        source_name: Optional[str] = None,
        source_url: Optional[str] = None,
        retrieved_date: Optional[str] = None
    ):
        self.doc_id = doc_id
        self.category = category
        self.title = title
        self.score = score
        self.retrieval_score = score
        self.evidence_text = evidence_text
        self.safety_limitations = safety_limitations
        self.repair_considerations = repair_considerations
        self.pathway_suitability = pathway_suitability
        self.source = source
        self.source_name = source_name or source
        self.source_url = source_url or ""
        self.publication_year = publication_year
        self.retrieved_date = retrieved_date or "2024-06-15"
        self.matched_symptoms = matched_symptoms

    def to_dict(self) -> Dict[str, Any]:
        return {
            "doc_id": self.doc_id,
            "category": self.category,
            "title": self.title,
            "score": round(self.score, 4),
            "evidence_text": self.evidence_text,
            "safety_limitations": self.safety_limitations,
            "repair_considerations": self.repair_considerations,
            "pathway_suitability": self.pathway_suitability,
            "source": self.source,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "publication_year": self.publication_year,
            "retrieved_date": self.retrieved_date,
            "matched_symptoms": self.matched_symptoms
        }


def infer_category_from_query(query: str) -> Optional[str]:
    q = query.lower()
    if any(w in q for w in ["laptop", "macbook", "notebook", "chromebook", "thinkpad"]):
        return "laptops"
    if any(w in q for w in ["phone", "smartphone", "iphone", "android", "pixel", "galaxy", "tablet", "ipad"]):
        return "smartphones"
    if any(w in q for w in ["sweater", "garment", "clothing", "jacket", "shirt", "jeans", "pants", "cloth", "textile", "wool", "cotton"]):
        return "clothing"
    if any(w in q for w in ["microwave", "fridge", "refrigerator", "vacuum", "toaster", "blender", "kettle", "appliance"]):
        return "small_appliances"
    if any(w in q for w in ["chair", "table", "desk", "sofa", "couch", "cabinet", "furniture", "bench"]):
        return "furniture"
    if any(w in q for w in ["book", "textbook", "novel", "hardcover", "paperback"]):
        return "books"
    return None

class LocalVectorStore:
    """
    Local dense vector store powered by real semantic embeddings (FastEmbed / BAAI/bge-small-en-v1.5).
    Computes unit-normalized 384-dimensional dense vectors and evaluates cosine similarity.
    Includes TF-IDF fallback for constrained offline unit tests.
    """
    def __init__(self, use_dense: bool = True):
        self.documents: List[KnowledgeDocument] = []
        self.embeddings_matrix: Optional[np.ndarray] = None
        self.is_indexed: bool = False
        self.use_dense: bool = use_dense
        self.embed_model = None
        self.vectorizer = None
        self.tfidf_matrix = None

        if self.use_dense:
            try:
                from fastembed import TextEmbedding
                self.embed_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
            except Exception:
                self.use_dense = False

        if not self.use_dense:
            from sklearn.feature_extraction.text import TfidfVectorizer
            self.vectorizer = TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 2),
                sublinear_tf=True,
                max_df=0.95
            )

    def _get_embedding(self, text: str) -> np.ndarray:
        if self.embed_model is not None:
            vec = list(self.embed_model.embed([text]))[0]
            norm = np.linalg.norm(vec)
            return vec / (norm + 1e-9)
        raise RuntimeError("Dense embed model is not initialized.")

    def build_index(self, documents: Optional[List[KnowledgeDocument]] = None) -> None:
        if documents is None:
            documents = load_all_knowledge_documents()
        
        self.documents = documents
        corpus = [doc.to_searchable_text() for doc in self.documents]

        if self.use_dense and self.embed_model is not None:
            raw_embeddings = list(self.embed_model.embed(corpus))
            # Normalize vectors for cosine distance calculation
            norms = np.linalg.norm(raw_embeddings, axis=1, keepdims=True) + 1e-9
            self.embeddings_matrix = np.array(raw_embeddings, dtype=np.float32) / norms
        else:
            if self.vectorizer is None:
                from sklearn.feature_extraction.text import TfidfVectorizer
                self.vectorizer = TfidfVectorizer(
                    stop_words="english",
                    ngram_range=(1, 2),
                    sublinear_tf=True,
                    max_df=0.95
                )
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

        self.is_indexed = True

    def save(self, path: Path = INDEX_CACHE_PATH) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump({
                "documents": self.documents,
                "use_dense": self.use_dense,
                "embeddings_matrix": self.embeddings_matrix,
                "vectorizer": self.vectorizer,
                "tfidf_matrix": self.tfidf_matrix
            }, f)

    def load(self, path: Path = INDEX_CACHE_PATH) -> bool:
        if not path.exists():
            return False
        try:
            with open(path, "rb") as f:
                data = pickle.load(f)
                self.documents = data.get("documents", [])
                self.use_dense = data.get("use_dense", True)
                self.embeddings_matrix = data.get("embeddings_matrix")
                self.vectorizer = data.get("vectorizer")
                self.tfidf_matrix = data.get("tfidf_matrix")
                self.is_indexed = True
                return True
        except Exception:
            return False

    def search(
        self,
        query: str,
        category: Optional[str] = None,
        top_k: int = 4,
        min_score: float = 0.15
    ) -> List[RetrievedChunk]:
        if not self.is_indexed or (self.embeddings_matrix is None and self.tfidf_matrix is None):
            self.build_index()

        target_category = category if (category and category.lower() not in ("all", "auto-detect")) else infer_category_from_query(query)

        query_cleaned = re.sub(r"[^\w\s]", " ", query.lower()).strip()
        if not query_cleaned:
            query_cleaned = query

        if self.use_dense and self.embeddings_matrix is not None:
            query_vec = self._get_embedding(query_cleaned)
            similarities = np.dot(self.embeddings_matrix, query_vec)
        else:
            from sklearn.metrics.pairwise import cosine_similarity
            query_vec = self.vectorizer.transform([query_cleaned])
            similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        scored_docs = []
        for idx, doc in enumerate(self.documents):
            raw_score = float(similarities[idx])
            score = max(0.0, min(1.0, raw_score))
            is_category_match = False

            if target_category:
                if doc.category.lower() == target_category.lower():
                    is_category_match = True

            matched = [
                s for s in doc.symptoms
                if any(w in s.lower() for w in query.lower().split() if len(w) > 3)
            ]

            chunk = RetrievedChunk(
                doc_id=doc.doc_id,
                category=doc.category,
                title=doc.title,
                score=score,
                evidence_text=doc.evidence_text,
                safety_limitations=doc.safety_limitations,
                repair_considerations=doc.repair_considerations,
                pathway_suitability=doc.pathway_suitability,
                source=doc.source,
                source_name=doc.source_name,
                source_url=doc.source_url,
                publication_year=doc.publication_year,
                retrieved_date=doc.retrieved_date,
                matched_symptoms=matched
            )
            scored_docs.append((score, is_category_match, chunk))

        # Sort primarily by category match preference, then score
        scored_docs.sort(key=lambda x: (x[1], x[0]), reverse=True)

        results = []
        for score, is_cat_match, chunk in scored_docs:
            if score < min_score and len(results) >= 1:
                continue
            results.append(chunk)
            if len(results) >= top_k:
                break

        return results



# Global singleton instance
_vector_store_instance: Optional[LocalVectorStore] = None

def get_vector_store() -> LocalVectorStore:
    global _vector_store_instance
    if _vector_store_instance is None:
        store = LocalVectorStore()
        if not store.load() or store.embeddings_matrix is None:
            store.build_index()
            store.save()
        _vector_store_instance = store
    return _vector_store_instance
