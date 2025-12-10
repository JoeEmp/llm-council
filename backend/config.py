"""Configuration for the LLM Council."""

import os
import json
from typing import Dict, List, Any, Optional
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ============================================================================
# Dynamic Configuration Manager
# ============================================================================

class Config:
    """Dynamic configuration manager for LLM Council."""

    def __init__(self):
        self.config_file = Path("data/config.json")
        self._config = {
            "council_models": [
                "ollama/deepseek-r1:1.5b",
                "ollama/qwen3:1.7b",
            ],
            "chairman_model": "deepseek/deepseek-chat",
            "data_dir": "data/conversations",
        }
        self.load()

    def load(self):
        """Load configuration from file."""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    loaded_config = json.load(f)
                    self._config.update(loaded_config)
            except Exception as e:
                print(f"Error loading config: {e}, using defaults")

    def save(self):
        """Save configuration to file."""
        try:
            self.config_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_file, 'w') as f:
                json.dump(self._config, f, indent=2)
        except Exception as e:
            print(f"Error saving config: {e}")

    @property
    def council_models(self) -> List[str]:
        """Get council models."""
        return self._config.get("council_models", [])

    @council_models.setter
    def council_models(self, value: List[str]):
        """Set council models."""
        self._config["council_models"] = value
        self.save()

    @property
    def chairman_model(self) -> str:
        """Get chairman model."""
        return self._config.get("chairman_model", "")

    @chairman_model.setter
    def chairman_model(self, value: str):
        """Set chairman model."""
        self._config["chairman_model"] = value
        self.save()

    @property
    def data_dir(self) -> str:
        """Get data directory."""
        return self._config.get("data_dir", "data/conversations")

    @property
    def all_config(self) -> Dict[str, Any]:
        """Get all configuration."""
        return self._config.copy()

    def update_config(self, config_dict: Dict[str, Any]):
        """Update multiple config values."""
        for key, value in config_dict.items():
            if key in self._config:
                self._config[key] = value
        self.save()

# Global configuration instance
_config_manager = Config()

# ============================================================================
# Model Provider Configurations
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
# Dynamic Configuration Properties
# ============================================================================

def get_council_models() -> List[str]:
    """Get current council models."""
    return _config_manager.council_models

def set_council_models(models: List[str]):
    """Set council models."""
    _config_manager.council_models = models

def get_chairman_model() -> str:
    """Get current chairman model."""
    return _config_manager.chairman_model

def set_chairman_model(model: str):
    """Set chairman model."""
    _config_manager.chairman_model = model

def get_all_config() -> Dict[str, Any]:
    """Get all configuration."""
    return _config_manager.all_config

def update_config(config_dict: Dict[str, Any]):
    """Update configuration."""
    _config_manager.update_config(config_dict)

# ============================================================================
# Legacy Static Configuration (for backward compatibility)
# ============================================================================

# These values are now dynamically managed
# COUNCIL_MODELS = _config_manager.council_models
# CHAIRMAN_MODEL = _config_manager.chairman_model

# For backward compatibility, we'll create properties
COUNCIL_MODELS = property(lambda self: _config_manager.council_models)
CHAIRMAN_MODEL = property(lambda self: _config_manager.chairman_model)

# DATA_DIR is accessed directly
DATA_DIR = _config_manager.data_dir
