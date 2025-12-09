"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# ============================================================================
# Model Provider Configurations
# ============================================================================
# Each provider must have 'base_url' and optionally 'api_key'
# ============================================================================

MODEL_CONFIGS = {
    "openrouter": {
        "api_key": os.getenv("OPENROUTER_API_KEY"),
        "base_url": os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
    },
    "openai": {
        "api_key": os.getenv("OPENAI_API_KEY"),
        "base_url": os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    },
    "doubao": {
        "api_key": os.getenv("DOUBAO_API_KEY"),
        "base_url": os.getenv("DOUBAO_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3"),
    },
    "deepseek": {
        "api_key": os.getenv("DEEPSEEK_API_KEY"),
        "base_url": os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1"),
    },
    "ollama": {
        "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    },
}

# ============================================================================
# Council Configuration
# ============================================================================
# Model identifiers use format: "provider/model" or "provider/subpath/model"
# Examples:
#   - "openrouter/openai/gpt-4o"
#   - "openai/gpt-4o"
#   - "doubao/deepseek-v3"
#   - "deepseek/deepseek-chat"
#   - "ollama/llama3.1"
# ============================================================================

# Council members - list of model identifiers
# Only configured providers will be used (graceful degradation)
COUNCIL_MODELS = [
    # "openrouter/openai/gpt-4o",
    # "openrouter/google/gemini-2.5-flash",
    # "openrouter/anthropic/claude-3.5-sonnet",
    "ollama/deepseek-r1:1.5b",
    "ollama/qwen3:1.7b",
]

# Chairman model - synthesizes final response
CHAIRMAN_MODEL = "deepseek/deepseek-chat"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
