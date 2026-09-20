import os
import json
import re
import time
import httpx
from typing import Dict, Any, Optional
from .base import BaseLLMClient
from .gemini_client import AIRateLimitError

class GroqClient(BaseLLMClient):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "")
        self.model = model or os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
        self.base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1/chat/completions")

    def get_provider_name(self) -> str:
        return f"Groq ({self.model})"

    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable is not configured.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        max_attempts = 3
        data = None

        for attempt in range(1, max_attempts + 1):
            with httpx.Client(timeout=45.0) as client:
                resp = client.post(self.base_url, headers=headers, json=payload)
                
                if resp.status_code == 429:
                    if attempt < max_attempts:
                        time.sleep(1.5 * attempt)
                        continue
                    else:
                        raise AIRateLimitError("Groq API rate limit or quota currently exceeded. Please try again shortly.")
                
                if resp.status_code == 503 and attempt < max_attempts:
                    time.sleep(2.0 * attempt)
                    continue

                resp.raise_for_status()
                data = resp.json()
                break

        if not data:
            raise ValueError("No response data received from Groq API.")

        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            raise ValueError(f"Unexpected response structure from Groq: {e}")

        content_trimmed = content.strip()
        if content_trimmed.startswith("```") and content_trimmed.endswith("```"):
            lines = content_trimmed.splitlines()
            if len(lines) >= 2:
                content_trimmed = "\n".join(lines[1:-1]).strip()

        try:
            return json.loads(content_trimmed)
        except json.JSONDecodeError:
            json_match = re.search(r"\{.*\}", content_trimmed, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(0))
                except json.JSONDecodeError as e:
                    raise ValueError(f"Failed to parse JSON response from Groq: {e}") from e
            raise ValueError("Failed to parse JSON response from Groq (no valid JSON object found).")
