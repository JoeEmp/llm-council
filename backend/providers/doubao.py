"""火山引擎 (Doubao/Ark) provider implementation."""

import httpx
from typing import List, Dict, Any, Optional
from .base import ModelProvider


class DoubaoProvider(ModelProvider):
    """火山引擎 Doubao/Ark provider implementation."""

    def __init__(self, provider_config: Dict[str, Any]):
        """
        Initialize Doubao provider.

        Args:
            provider_config: Configuration dict with 'api_key' and optionally 'base_url'
        """
        super().__init__(provider_config)
        self.api_key = provider_config.get('api_key')
        self.base_url = provider_config.get('base_url', 'https://ark.cn-beijing.volces.com/api/v3')

        if not self.api_key:
            raise ValueError("Doubao API key is required")

    async def query_model(
        self,
        model: str,
        messages: List[Dict[str, str]],
        timeout: float = 120.0
    ) -> Optional[Dict[str, Any]]:
        """
        Query a model via 火山引擎 API.

        Args:
            model: Model identifier (e.g., "deepseek-v3")
            messages: List of message dicts with 'role' and 'content'
            timeout: Request timeout in seconds

        Returns:
            Response dict with 'content', or None if failed
        """
        api_url = f"{self.base_url}/chat/completions"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model,
            "messages": messages,
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    api_url,
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()

                data = response.json()
                message = data['choices'][0]['message']

                return {
                    'content': message.get('content'),
                    'reasoning_details': message.get('reasoning_details')
                }

        except Exception as e:
            print(f"Error querying Doubao model {model}: {e}")
            return None

    def supports_streaming(self) -> bool:
        """Check if provider supports streaming."""
        return True
