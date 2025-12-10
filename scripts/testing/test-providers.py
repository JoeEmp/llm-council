"""Test script for multi-provider support."""

import asyncio
from backend.providers.factory import query_model, query_models_parallel
from backend.config import COUNCIL_MODELS, CHAIRMAN_MODEL


async def test_single_model():
    """Test querying a single model."""
    messages = [{"role": "user", "content": "Say 'Hello from test'"}]

    print(f"Testing single model query: {CHAIRMAN_MODEL}")
    try:
        result = await query_model(CHAIRMAN_MODEL, messages, timeout=10.0)
        if result:
            print(f"✓ Success! Response: {result['content'][:100]}...")
        else:
            print("✗ Failed (API error or not configured)")
    except Exception as e:
        print(f"✗ Exception: {e}")


async def test_parallel_models():
    """Test querying multiple models in parallel."""
    messages = [{"role": "user", "content": "Say 'Hello from test'"}]

    print(f"\nTesting parallel queries to all council models:")
    for model in COUNCIL_MODELS:
        print(f"  - {model}")

    try:
        results = await query_models_parallel(COUNCIL_MODELS, messages)
        success_count = sum(1 for r in results.values() if r is not None)
        print(f"\n✓ Results: {success_count}/{len(COUNCIL_MODELS)} models responded")

        for model, response in results.items():
            status = "✓" if response else "✗"
            print(f"  {status} {model}")
    except Exception as e:
        print(f"✗ Exception: {e}")


def test_model_parsing():
    """Test model identifier parsing."""
    from backend.providers.factory import parse_model_identifier

    print("\nTesting model identifier parsing:")
    tests = [
        ("openai/gpt-4o", ("openai", "gpt-4o")),
        ("ollama/llama3.1", ("ollama", "llama3.1")),
        ("openrouter/openai/gpt-4o", ("openrouter", "openai/gpt-4o")),
        ("doubao/deepseek-v3", ("doubao", "deepseek-v3")),
    ]

    for model_id, expected in tests:
        result = parse_model_identifier(model_id)
        status = "✓" if result == expected else "✗"
        print(f"  {status} {model_id} -> {result}")


def test_provider_creation():
    """Test provider creation."""
    from backend.providers.factory import get_provider, PROVIDER_CLASSES

    print("\nTesting provider creation:")
    for provider_name in PROVIDER_CLASSES.keys():
        try:
            provider = get_provider(provider_name)
            print(f"  ✓ {provider_name}: {type(provider).__name__}")
        except ValueError as e:
            print(f"  ✗ {provider_name}: {e}")


async def main():
    """Run all tests."""
    print("=" * 70)
    print("Multi-Provider Support Test Suite")
    print("=" * 70)

    test_model_parsing()
    test_provider_creation()

    print("\n" + "=" * 70)
    print("Note: Some tests may fail if you don't have API keys configured.")
    print("This is expected behavior (graceful degradation).")
    print("=" * 70)

    # Only run API tests if user confirms
    response = input("\nDo you want to run actual API tests? (y/N): ")
    if response.lower() == 'y':
        await test_single_model()
        await test_parallel_models()
    else:
        print("\nSkipping API tests.")

    print("\n" + "=" * 70)
    print("Test completed!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
