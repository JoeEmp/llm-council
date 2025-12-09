"""Provider factory for creating appropriate model providers."""

from typing import List, Dict, Any, Optional
from ..providers import (
    OpenRouterProvider,
    OpenAIProvider,
    DoubaoProvider,
    DeepSeekProvider,
    OllamaProvider,
)
from ..config import MODEL_CONFIGS


# Provider registry mapping provider names to their classes
PROVIDER_CLASSES = {
    "openrouter": OpenRouterProvider,
    "openai": OpenAIProvider,
    "doubao": DoubaoProvider,
    "deepseek": DeepSeekProvider,
    "ollama": OllamaProvider,
}


def parse_model_identifier(model_id: str) -> tuple[str, str]:
    """
    Parse model identifier into provider and model parts.

    Args:
        model_id: Full model identifier (e.g., "openai/gpt-4o", "ollama/llama3.1")

    Returns:
        Tuple of (provider_name, model_name)

    Examples:
        >>> parse_model_identifier("openai/gpt-4o")
        ("openai", "gpt-4o")
        >>> parse_model_identifier("openrouter/openai/gpt-4o")
        ("openrouter", "openai/gpt-4o")
        >>> parse_model_identifier("ollama/llama3.1")
        ("ollama", "llama3.1")
    """
    parts = model_id.split("/", 1)
    if len(parts) == 1:
        # Default to openrouter for backward compatibility
        return "openrouter", model_id

    provider = parts[0]
    model_name = parts[1]

    return provider, model_name


def get_provider(provider_name: str):
    """
    Get a provider instance by name.

    Args:
        provider_name: Name of the provider (e.g., "openai", "ollama")

    Returns:
        Provider instance

    Raises:
        ValueError: If provider is not configured or not supported
    """
    if provider_name not in PROVIDER_CLASSES:
        raise ValueError(f"Unsupported provider: {provider_name}")

    if provider_name not in MODEL_CONFIGS:
        raise ValueError(f"Provider '{provider_name}' is not configured in MODEL_CONFIGS")

    provider_config = MODEL_CONFIGS[provider_name]
    provider_class = PROVIDER_CLASSES[provider_name]

    return provider_class(provider_config)


async def query_model(
    model_id: str,
    messages: List[Dict[str, str]],
    timeout: float = 120.0
) -> Optional[Dict[str, Any]]:
    """
    Query a single model by its full identifier.

    Args:
        model_id: Full model identifier (e.g., "openai/gpt-4o")
        messages: List of message dicts with 'role' and 'content'
        timeout: Request timeout in seconds

    Returns:
        Response dict with 'content' and optional 'reasoning_details', or None if failed
    """
    provider_name, model_name = parse_model_identifier(model_id)
    provider = get_provider(provider_name)
    return await provider.query_model(model_name, messages, timeout)


async def query_models_parallel(
    model_ids: List[str],
    messages: List[Dict[str, str]]
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Query multiple models in parallel.

    Args:
        model_ids: List of full model identifiers
        messages: List of message dicts to send to each model

    Returns:
        Dict mapping model identifier to response dict (or None if failed)
    """
    import asyncio

    # Create tasks for all models
    tasks = [query_model(model_id, messages) for model_id in model_ids]

    # Wait for all to complete
    responses = await asyncio.gather(*tasks)

    # Map models to their responses
    return {model_id: response for model_id, response in zip(model_ids, responses)}
