from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseLLMClient(ABC):
    @abstractmethod
    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Sends system prompt and user prompt to LLM and returns structured JSON dictionary.
        """
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        pass

    @property
    def provider_name(self) -> str:
        return self.get_provider_name()
