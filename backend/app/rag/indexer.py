import sys
from pathlib import Path
from app.knowledge.loader import load_all_knowledge_documents
from app.rag.vector_store import LocalVectorStore, INDEX_CACHE_PATH

def run_indexing():
    print("Initiating offline knowledge base ingestion and vector indexing...")
    docs = load_all_knowledge_documents()
    print(f"Loaded {len(docs)} documents from knowledge directory.")
    
    store = LocalVectorStore()
    store.build_index(docs)
    store.save(INDEX_CACHE_PATH)
    print(f"Vector index successfully built and saved to: {INDEX_CACHE_PATH}")
    if store.embeddings_matrix is not None:
        print(f"Dense embeddings shape: {store.embeddings_matrix.shape} (BAAI/bge-small-en-v1.5, 384-dim)")
    elif store.vectorizer is not None:
        print(f"TF-IDF vocabulary terms: {len(store.vectorizer.vocabulary_)}")

if __name__ == "__main__":
    run_indexing()
