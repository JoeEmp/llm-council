#!/usr/bin/env python3
"""Quick setup verification script for multi-provider support."""

import sys
from backend.config import MODEL_CONFIGS, COUNCIL_MODELS, CHAIRMAN_MODEL
from backend.providers.factory import PROVIDER_CLASSES, get_provider


def check_provider_status():
    """Check which providers are properly configured."""
    print("=" * 80)
    print("LLM Council Multi-Provider Setup Verification")
    print("=" * 80)
    print()

    print("1. Supported Providers:")
    print("-" * 80)
    for provider_name in PROVIDER_CLASSES.keys():
        config = MODEL_CONFIGS.get(provider_name, {})

        # Check if provider needs API key
        needs_key = provider_name != 'ollama'

        if needs_key:
            has_key = bool(config.get('api_key'))
            status = "✓ Configured" if has_key else "✗ Missing API Key"
        else:
            has_key = True
            status = "✓ Available (Local)"

        base_url = config.get('base_url', 'N/A')
        print(f"  {provider_name:15s} {status:20s} Base URL: {base_url}")

    print()


def check_council_models():
    """Check which council models are usable."""
    print("2. Council Members Configuration:")
    print("-" * 80)

    for i, model_id in enumerate(COUNCIL_MODELS, 1):
        provider_name, _ = model_id.split("/", 1) if "/" in model_id else ("openrouter", model_id)
        config = MODEL_CONFIGS.get(provider_name, {})

        is_configured = bool(config.get('api_key')) if provider_name != 'ollama' else True
        status = "✓ Usable" if is_configured else "⚠ Disabled (No API Key)"

        print(f"  {i:2d}. {model_id:45s} {status}")

    print()


def check_chairman_model():
    """Check chairman model configuration."""
    print("3. Chairman Model:")
    print("-" * 80)

    provider_name, _ = CHAIRMAN_MODEL.split("/", 1) if "/" in CHAIRMAN_MODEL else ("openrouter", CHAIRMAN_MODEL)
    config = MODEL_CONFIGS.get(provider_name, {})

    is_configured = bool(config.get('api_key')) if provider_name != 'ollama' else True
    status = "✓ Usable" if is_configured else "✗ Not usable (No API Key)"

    print(f"  Model: {CHAIRMAN_MODEL}")
    print(f"  Status: {status}")
    print()


def show_example_config():
    """Show example .env configuration."""
    print("4. Example .env Configuration:")
    print("-" * 80)
    print("""
# Copy this to .env and fill in your keys
OPENROUTER_API_KEY=your_openrouter_key
OPENAI_API_KEY=your_openai_key
DOUBAO_API_KEY=your_doubao_key
DEEPSEEK_API_KEY=your_deepseek_key
# Ollama requires no API key (local)
    """)
    print()


def show_usage_example():
    """Show usage example."""
    print("5. Usage Example:")
    print("-" * 80)
    print("""
from backend.providers.factory import query_model

# Query any model using format: provider/model_id
result = await query_model("openai/gpt-4o", messages)
result = await query_model("doubao/deepseek-v3", messages)
result = await query_model("ollama/llama3.1", messages)
    """)
    print()


def main():
    """Run all checks."""
    try:
        check_provider_status()
        check_council_models()
        check_chairman_model()
        show_example_config()
        show_usage_example()

        print("=" * 80)
        print("✓ Verification completed!")
        print("=" * 80)
        print()
        print("Next steps:")
        print("  1. Copy .env.example to .env")
        print("  2. Fill in your API keys")
        print("  3. Run: python test_providers.py")
        print()

        return 0

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
