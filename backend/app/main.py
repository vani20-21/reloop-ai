import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings
from app.db.database import init_db
from app.rag.vector_store import get_vector_store
from app.api.routes import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and verify vector store
    init_db()
    store = get_vector_store()
    print(f"Reloop AI Backend initialized. Vector store active with {len(store.documents)} knowledge documents.")
    yield
    # Shutdown logic if any
    print("Reloop AI Backend shutting down.")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Powered Circular Product Decision Intelligence API. Evaluates products across circular waste hierarchy pathways.",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "message": "RELOOP AI — Circular Product Decision Intelligence API",
        "docs_url": "/docs",
        "health_url": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
