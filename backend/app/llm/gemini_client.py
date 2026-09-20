import os
import json
import re
import time
import httpx
from typing import Dict, Any, Optional
from .base import BaseLLMClient

class AIRateLimitError(RuntimeError):
    """Raised when the Gemini API rate limit or quota is exceeded."""
    pass

class GeminiClient(BaseLLMClient):
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model = os.getenv("GEMINI_MODEL", model)
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    def get_provider_name(self) -> str:
        return f"Google Gemini ({self.model})"

    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")

        url = self.base_url
        headers = {
            "x-goog-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        max_attempts = 3
        data = None
        last_error_msg = ""

        for attempt in range(1, max_attempts + 1):
            with httpx.Client(timeout=45.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                
                if resp.status_code == 429:
                    last_error_msg = "Gemini API rate limit or quota exceeded."
                    try:
                        err_json = resp.json()
                        if "error" in err_json and "message" in err_json["error"]:
                            last_error_msg = f"Gemini API limit: {err_json['error']['message'][:150]}"
                    except Exception:
                        pass
                    
                    if attempt < max_attempts:
                        # Short bounded exponential backoff (1.5s, 3.0s) so HTTP requests do not time out
                        backoff = 1.5 * attempt
                        time.sleep(backoff)
                        continue
                    else:
                        raise AIRateLimitError("Gemini API rate limit or quota currently exceeded. Please wait a moment and try again.")
                
                if resp.status_code == 503 and attempt < max_attempts:
                    time.sleep(2.0 * attempt)
                    continue

                resp.raise_for_status()
                data = resp.json()
                break

        if not data:
            raise ValueError(f"No response data received from Gemini API. {last_error_msg}")

        try:
            candidate_text = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            raise ValueError(f"Unexpected response structure from Gemini: {e}")

        # Robust JSON parsing from candidate text
        candidate_text_trimmed = candidate_text.strip()
        if candidate_text_trimmed.startswith("```") and candidate_text_trimmed.endswith("```"):
            lines = candidate_text_trimmed.splitlines()
            if len(lines) >= 2:
                candidate_text_trimmed = "\n".join(lines[1:-1]).strip()

        try:
            return json.loads(candidate_text_trimmed)
        except json.JSONDecodeError:
            json_match = re.search(r"\{.*\}", candidate_text_trimmed, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(0))
                except json.JSONDecodeError as e:
                    raise ValueError(f"Failed to parse JSON response from Gemini: {e}") from e
            raise ValueError("Failed to parse JSON response from Gemini (no valid JSON object found).")

