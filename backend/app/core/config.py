import os
from pathlib import Path
from pydantic import BaseModel

from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent.parent.parent
# Load backend/.env if present
load_dotenv(BASE_DIR / ".env")
load_dotenv()

DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "reloop_ai.db"

def _parse_cors_origins() -> list[str]:
    """
    Builds the allowed CORS origin list.

    By default only the standard local development origins are permitted.
    Set CORS_ORIGINS in the environment (comma-separated) to extend or
    override this list for a specific deployment.  The unsafe wildcard "*"
    is intentionally NOT included so that arbitrary browser origins are
    rejected in production.

    Example (production):
        CORS_ORIGINS=https://reloop.example.com,https://www.reloop.example.com
    """
    default_dev_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    env_val = os.getenv("CORS_ORIGINS", "").strip()
    if env_val:
        extra = [o.strip() for o in env_val.split(",") if o.strip()]
        # Merge, preserving order and uniqueness
        merged = list(dict.fromkeys(default_dev_origins + extra))
        return merged
    return default_dev_origins


class Settings(BaseModel):
    app_name: str = "Reloop AI"
    app_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
    llm_provider: str = os.getenv("LLM_PROVIDER", "groq")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    openrouter_model: str = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    openrouter_base_url: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    # CORS: wildcard removed; configure CORS_ORIGINS env var for production domains.
    cors_origins: list[str] = _parse_cors_origins()
    # Evaluation benchmark endpoint: disabled by default to protect API quota in production.
    # Set ENABLE_EVAL_ENDPOINT=true in backend/.env to enable for local testing.
    enable_eval_endpoint: bool = os.getenv("ENABLE_EVAL_ENDPOINT", "False").lower() in ("true", "1", "yes")


settings = Settings()

