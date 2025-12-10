"""Ollama provider implementation."""

import httpx
from typing import List, Dict, Any, Optional
from .base import ModelProvider


class OllamaProvider(ModelProvider):
    """Ollama provider implementation for local models."""

    def __init__(self, provider_config: Dict[str, Any]):
        """
        Initialize Ollama provider.

        Args:
            provider_config: Configuration dict with 'base_url' (optional)
        """
        super().__init__(provider_config)
        self.base_url = provider_config.get('base_url', 'http://localhost:11434')

    async def query_model(
        self,
        model: str,
        messages: List[Dict[str, str]],
        timeout: float = 120.0
    ) -> Optional[Dict[str, Any]]:
        """
        Query a model via Ollama API.

        Args:
            model: Model identifier (e.g., "llama3.1", "qwen2.5")
            messages: List of message dicts with 'role' and 'content'
            timeout: Request timeout in seconds

        Returns:
            Response dict with 'content', or None if failed
        """
        api_url = f"{self.base_url}/api/chat"

        # Ollama uses 'stream': false by default for non-streaming responses
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    api_url,
                    json=payload
                )
                response.raise_for_status()

                data = response.json()

                return {
                    'content': data.get('message', {}).get('content', ''),
                    'reasoning_details': None
                }

        except Exception as e:
            print(f"Error querying Ollama model {model}: {str(e)}")
            return None

    def supports_streaming(self) -> bool:
        """Check if provider supports streaming."""
        return True
