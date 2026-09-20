import os
from typing import Optional
from dotenv import load_dotenv
from .base import BaseLLMClient
from .groq_client import GroqClient
from .gemini_client import GeminiClient, AIRateLimitError
from .openai_client import OpenAIClient
from .mock_client import MockDeterministicClient

load_dotenv()

class AIProviderUnavailableError(RuntimeError):
    """Raised when no valid LLM provider is configured and test mock mode is not explicitly enabled."""
    pass

def get_llm_client(allow_test_mock: bool = False) -> BaseLLMClient:
    provider = os.getenv("LLM_PROVIDER", "auto").lower()

    # 1. Explicit Test Fixture Mock (Only for automated unit tests / evaluation suite)
    if provider in ("test_mock", "mock") or allow_test_mock:
        return MockDeterministicClient()

    # 2. Groq Provider (Primary Default or Explicit)
    elif provider == "groq" or (provider == "auto" and os.getenv("GROQ_API_KEY")):
        if not os.getenv("GROQ_API_KEY"):
            raise AIProviderUnavailableError(
                "GROQ_API_KEY is not configured in the environment or backend/.env file."
            )
        return GroqClient()

    # 3. Google Gemini Provider (Secondary)
    elif provider == "gemini" or (provider == "auto" and os.getenv("GEMINI_API_KEY")):
        if not os.getenv("GEMINI_API_KEY"):
            raise AIProviderUnavailableError(
                "GEMINI_API_KEY is not configured in the environment or backend/.env file."
            )
        return GeminiClient()

    # 4. OpenAI Provider
    elif provider == "openai" or (provider == "auto" and os.getenv("OPENAI_API_KEY")):
        if not os.getenv("OPENAI_API_KEY"):
            raise AIProviderUnavailableError(
                "OPENAI_API_KEY is not configured in the environment or backend/.env file."
            )
        return OpenAIClient()

    # 5. Production / Live Runtime Error - NO SILENT FALLBACK TO MOCK
    else:
        raise AIProviderUnavailableError(
            "No live AI LLM provider is configured. Production recommendations require a valid "
            "GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in the environment or backend/.env file. "
            "Automated test fixtures may only be enabled explicitly via LLM_PROVIDER=test_mock."
        )

__all__ = [
    "BaseLLMClient",
    "GroqClient",
    "GeminiClient",
    "OpenAIClient",
    "MockDeterministicClient",
    "AIProviderUnavailableError",
    "AIRateLimitError",
    "get_llm_client"
]


