"""Test Ollama connection and model responses."""

import asyncio
import os
import httpx
from backend.config import get_council_models
from backend.providers.factory import parse_model_identifier, get_provider


async def test_ollama_connection():
    """Test if Ollama service is accessible."""
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    print(f"Testing Ollama connection to: {base_url}")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{base_url}/api/tags")
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Ollama is accessible!")
                print(f"Available models:")
                for model in data.get('models', []):
                    print(f"  - {model['name']}")
                return True
            else:
                print(f"✗ Ollama returned status {response.status_code}")
                return False
    except Exception as e:
        print(f"✗ Failed to connect to Ollama: {e}")
        return False


async def test_individual_models():
    """Test each council model individually."""
    council_models = get_council_models()
    print(f"\nTesting {len(council_models)} council models individually:")

    for model_id in council_models:
        print(f"\nTesting: {model_id}")
        try:
            provider_name, model_name = parse_model_identifier(model_id)
            provider = get_provider(provider_name)

            messages = [{"role": "user", "content": "Say 'Hello'"}]
            response = await provider.query_model(model_name, messages, timeout=30.0)

            if response:
                print(f"  ✓ Success! Response: {response['content'][:50]}...")
            else:
                print(f"  ✗ Query returned None (model failed to respond)")
        except Exception as e:
            print(f"  ✗ Error: {e}")


async def main():
    """Run all tests."""
    print("=" * 70)
    print("Ollama and Model Connection Tests")
    print("=" * 70)

    # Check if Ollama is accessible
    ollama_ok = await test_ollama_connection()

    if ollama_ok:
        # Test individual models
        await test_individual_models()
    else:
        print("\n✗ Cannot proceed - Ollama is not accessible")

    print("\n" + "=" * 70)
    print("Test completed!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
