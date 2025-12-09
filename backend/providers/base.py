"""Abstract base class for model providers."""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional


class ModelProvider(ABC):
    """Abstract base class for all model providers."""

    def __init__(self, provider_config: Dict[str, Any]):
        """
        Initialize provider with configuration.

        Args:
            provider_config: Configuration dict for this provider
        """
        self.config = provider_config

    @abstractmethod
    async def query_model(
        self,
        model: str,
        messages: List[Dict[str, str]],
        timeout: float = 120.0
    ) -> Optional[Dict[str, Any]]:
        """
        Query a single model.

        Args:
            model: Model identifier (without provider prefix)
            messages: List of message dicts with 'role' and 'content'
            timeout: Request timeout in seconds

        Returns:
            Response dict with 'content' and optional 'reasoning_details', or None if failed
        """
        pass

    @abstractmethod
    def supports_streaming(self) -> bool:
        """
        Check if this provider supports streaming responses.

        Returns:
            True if streaming is supported, False otherwise
        """
        pass
