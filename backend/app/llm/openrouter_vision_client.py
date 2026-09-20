import os
import re
import json
import base64
import logging
from typing import Optional, Dict, Any, Tuple
import httpx

from app.api.schemas import VisualEvidence, VisualObservation, PossibleExplanation
from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

VISION_SYSTEM_PROMPT = """You are an expert computer vision assistant for ReLoop AI, a circular product decision engine.
Your ONLY role is to analyze visible physical evidence in the provided product photo and output structured observations.
You MUST NOT make final circular economy decisions or repair/reuse/recycle recommendations.

CRITICAL VISUAL GROUNDING RULE:
You MUST NOT infer or assert invisible internal conditions (such as internal dust accumulation, thermal paste degradation, thermal throttling, internal battery health/capacity, CPU/RAM speed) from an image alone.
Only report what is DIRECTLY visible in the photo.

Distinguish clearly between:
1. directly visible observations (e.g. "Screen appears physically intact", "Keyboard and chassis are visible", "Rear panel appears visibly separated")
2. possible explanations (e.g. "Appearance may be consistent with internal pressure", "Scratches suggest typical surface wear")
3. unknown/unverifiable facts (e.g. "Internal battery health cannot be established from photo alone", "Thermal paste condition cannot be confirmed")

Identify any visible physical hazard indicators (e.g. visible smoke, fire, sparks, liquid leakage, severe bulging/swelling, charred components, exposed live electrical wiring).

Return ONLY a valid JSON object with the exact keys:
{
  "observations": [
    {"observation": "string", "confidence": "high|medium|low"}
  ],
  "possible_explanations": [
    {"explanation": "string", "confidence": "high|medium|low"}
  ],
  "unknowns": [
    "string"
  ],
  "visible_damage": true|false,
  "hazard_indicators": [
    "string"
  ]
}
"""


class OpenRouterVisionClient:
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout_seconds: float = 15.0
    ):
        self.api_key = api_key or settings.openrouter_api_key
        # Enforce exact model openrouter/free (zero paid model fallback)
        self.model = model or settings.openrouter_model or "openrouter/free"
        self.base_url = (base_url or settings.openrouter_base_url or "https://openrouter.ai/api/v1").rstrip("/")
        self.timeout_seconds = timeout_seconds

    def validate_image_payload(
        self,
        image_base64: str,
        mime_type: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Validates image data URI / base64 string and MIME type.
        Returns clean (base64_data, validated_mime_type).
        """
        if not image_base64:
            raise ValueError("Empty image string provided.")

        clean_b64 = image_base64.strip()
        detected_mime = (mime_type or "image/jpeg").lower()

        # Handle data URI prefix e.g. data:image/png;base64,...
        if clean_b64.startswith("data:"):
            header, _, data = clean_b64.partition(",")
            clean_b64 = data.strip()
            if ";" in header and ":" in header:
                detected_mime = header.split(";")[0].split(":")[1].lower()

        if detected_mime == "image/jpg":
            detected_mime = "image/jpeg"

        if detected_mime not in ALLOWED_MIME_TYPES:
            raise ValueError(f"Unsupported image format '{detected_mime}'. Allowed: JPG, PNG, WEBP.")

        # Check decoded byte size
        try:
            decoded_bytes = base64.b64decode(clean_b64)
            if len(decoded_bytes) > MAX_IMAGE_SIZE_BYTES:
                raise ValueError(f"Image size ({len(decoded_bytes) / 1024 / 1024:.1f} MB) exceeds maximum allowed 5 MB.")
        except Exception as e:
            if "exceeds" in str(e):
                raise
            raise ValueError("Malformed base64 image data.")

        return clean_b64, detected_mime

    def analyze_image(
        self,
        image_base64: str,
        user_context: Optional[str] = None,
        mime_type: Optional[str] = None
    ) -> VisualEvidence:
        """
        Sends image + user text to OpenRouter (openrouter/free) and returns structured VisualEvidence.
        Guarantees zero paid model fallback and robust error handling.
        """
        if not self.api_key:
            logger.warning("OpenRouter API key not configured.")
            return VisualEvidence(
                analysis_status="unavailable",
                error_message="Free image analysis is temporarily unavailable."
            )

        try:
            clean_b64, valid_mime = self.validate_image_payload(image_base64, mime_type)
        except ValueError as ve:
            return VisualEvidence(
                analysis_status="error",
                error_message=str(ve)
            )

        data_uri = f"data:{valid_mime};base64,{clean_b64}"
        prompt_text = user_context or "Analyze visible evidence in this product photo."

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": VISION_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt_text},
                        {"type": "image_url", "image_url": {"url": data_uri}}
                    ]
                }
            ],
            "temperature": 0.2
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://reloop-ai.local",
            "X-Title": "ReLoop AI",
            "Content-Type": "application/json"
        }

        url = f"{self.base_url}/chat/completions"

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                resp = client.post(url, json=payload, headers=headers)

            if resp.status_code in (401, 403):
                return VisualEvidence(
                    analysis_status="unavailable",
                    error_message="Image analysis is temporarily unavailable. The recommendation was generated from your description."
                )
            elif resp.status_code == 429:
                return VisualEvidence(
                    analysis_status="unavailable",
                    error_message="Image analysis is temporarily unavailable. The recommendation was generated from your description."
                )
            elif resp.status_code == 400:
                return VisualEvidence(
                    analysis_status="error",
                    error_message="Image analysis is temporarily unavailable. The recommendation was generated from your description."
                )
            elif resp.status_code >= 500:
                return VisualEvidence(
                    analysis_status="unavailable",
                    error_message="Image analysis is temporarily unavailable. The recommendation was generated from your description."
                )

            resp.raise_for_status()
            res_data = resp.json()

            choices = res_data.get("choices", [])
            if not choices:
                return VisualEvidence(
                    analysis_status="error",
                    error_message="Image analysis is temporarily unavailable. The recommendation was generated from your description."
                )

            content = choices[0].get("message", {}).get("content", "")
            return self._parse_vision_json(content)

        except httpx.TimeoutException:
            return VisualEvidence(
                analysis_status="unavailable",
                error_message="Image analysis is temporarily unavailable. The recommendation was generated from your description."
            )
        except httpx.HTTPStatusError as hse:
            return VisualEvidence(
                analysis_status="unavailable",
                error_message="Image analysis is temporarily unavailable. The recommendation was generated from your description."
            )
        except Exception as e:
            # Ensure key is never logged or leaked
            clean_err = str(e).replace(self.api_key, "[REDACTED]") if self.api_key else str(e)
            logger.error(f"OpenRouter vision error: {clean_err}")
            return VisualEvidence(
                analysis_status="error",
                error_message="Image analysis is temporarily unavailable. The recommendation was generated from your description."
            )

    def _parse_vision_json(self, raw_content: Any) -> VisualEvidence:
        """
        Parses JSON content returned by the vision model into a VisualEvidence object.
        Robustly handles dict objects, structured content-part arrays, markdown fences,
        whitespace, and surrounding text.
        """
        fallback_msg = "Image analysis is temporarily unavailable. The recommendation was generated from your description."
        try:
            data = None
            if isinstance(raw_content, dict):
                data = raw_content
            elif isinstance(raw_content, list):
                text_parts = []
                for item in raw_content:
                    if isinstance(item, dict):
                        if item.get("type") == "text":
                            text_parts.append(str(item.get("text", "")))
                        elif "text" in item:
                            text_parts.append(str(item["text"]))
                    elif isinstance(item, str):
                        text_parts.append(item)
                text = " ".join(text_parts).strip()
            elif isinstance(raw_content, str):
                text = raw_content.strip()
            else:
                text = str(raw_content).strip()

            if data is None and 'text' in locals() and text:
                if "```" in text:
                    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
                    text = re.sub(r"\s*```$", "", text)
                    text = text.strip()

                try:
                    data = json.loads(text)
                except json.JSONDecodeError:
                    match = re.search(r"\{.*\}", text, re.DOTALL)
                    if match:
                        data = json.loads(match.group(0))

            if not isinstance(data, dict):
                return VisualEvidence(
                    analysis_status="error",
                    error_message=fallback_msg
                )

            obs_list = []
            for item in data.get("observations", []) or []:
                if isinstance(item, dict):
                    obs_text = str(item.get("observation", "")).strip()
                    conf = str(item.get("confidence", "medium")).lower()
                    if obs_text:
                        obs_list.append(VisualObservation(
                            observation=obs_text,
                            confidence=conf if conf in ("high", "medium", "low") else "medium"
                        ))
                elif isinstance(item, str) and item.strip():
                    obs_list.append(VisualObservation(observation=item.strip(), confidence="medium"))

            exp_list = []
            for item in data.get("possible_explanations", []) or []:
                if isinstance(item, dict):
                    exp_text = str(item.get("explanation", "")).strip()
                    conf = str(item.get("confidence", "medium")).lower()
                    if exp_text:
                        exp_list.append(PossibleExplanation(
                            explanation=exp_text,
                            confidence=conf if conf in ("high", "medium", "low") else "medium"
                        ))
                elif isinstance(item, str) and item.strip():
                    exp_list.append(PossibleExplanation(explanation=item.strip(), confidence="medium"))

            unknowns_list = [
                str(u).strip() for u in (data.get("unknowns") or [])
                if isinstance(u, (str, int, float)) and str(u).strip()
            ]

            hazards_list = [
                str(h).strip() for h in (data.get("hazard_indicators") or [])
                if isinstance(h, (str, int, float)) and str(h).strip()
            ]

            return VisualEvidence(
                observations=obs_list,
                possible_explanations=exp_list,
                unknowns=unknowns_list,
                visible_damage=bool(data.get("visible_damage", False)),
                hazard_indicators=hazards_list,
                analysis_status="completed"
            )
        except Exception as e:
            logger.warning(f"Failed to parse vision model response: {e}")
            return VisualEvidence(
                analysis_status="error",
                error_message=fallback_msg
            )
