import { useState, useEffect } from 'react';
import { api } from '../api';
import './ModelSelector.css';

export default function ModelSelector({ onModelsSelected }) {
  const [config, setConfig] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCouncil, setSelectedCouncil] = useState([]);
  const [selectedChairman, setSelectedChairman] = useState('');
  const [newModelInput, setNewModelInput] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const result = await api.getConfig();
      setConfig(result.config);
      setAvailableProviders(result.available_providers);
      setSelectedCouncil(result.config.council_models || []);
      setSelectedChairman(result.config.chairman_model || '');
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCouncilModel = (model) => {
    if (selectedCouncil.includes(model)) {
      setSelectedCouncil(selectedCouncil.filter(m => m !== model));
    } else {
      setSelectedCouncil([...selectedCouncil, model]);
    }
  };

  const addNewModel = () => {
    if (newModelInput.trim() && !selectedCouncil.includes(newModelInput.trim())) {
      setSelectedCouncil([...selectedCouncil, newModelInput.trim()]);
      setNewModelInput('');
    }
  };

  const removeModel = (model) => {
    setSelectedCouncil(selectedCouncil.filter(m => m !== model));
    if (selectedChairman === model) {
      setSelectedChairman('');
    }
  };

  const handleConfirm = async () => {
    if (selectedCouncil.length === 0) {
      alert('Please select at least one council model');
      return;
    }
    if (!selectedChairman) {
      alert('Please select a chairman model');
      return;
    }

    // Update global config
    await api.updateConfig({
      council_models: selectedCouncil,
      chairman_model: selectedChairman,
    });

    onModelsSelected({
      council_models: selectedCouncil,
      chairman_model: selectedChairman,
    });
  };

  const presetModels = [
    { id: 'ollama/deepseek-r1:1.5b', name: 'DeepSeek-R1 (1.5B, Ollama)' },
    { id: 'ollama/qwen3:1.7b', name: 'Qwen3 (1.7B, Ollama)' },
    { id: 'openrouter/openai/gpt-4o', name: 'GPT-4o (OpenAI)' },
    { id: 'openrouter/anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'openrouter/google/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'openrouter/meta-llama/llama-3.1-8b', name: 'Llama 3.1 (8B)' },
  ];

  return (
    <div className="model-selector-overlay">
      <div className="model-selector">
        <div className="selector-header">
          <h1>Select Models for Discussion</h1>
          <p className="selector-subtitle">
            Choose which models will participate in the council and which will be the chairman
          </p>
        </div>

        <div className="selector-content">
          {loading ? (
            <div className="loading-selector">Loading models...</div>
          ) : (
            <>
              {/* Preset Models */}
              <div className="models-section">
                <h2>Quick Select - Popular Models</h2>
                <div className="preset-models">
                  {presetModels.map((model) => (
                    <div key={model.id} className="preset-model-card">
                      <label className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={selectedCouncil.includes(model.id)}
                          onChange={() => toggleCouncilModel(model.id)}
                        />
                        <span className="checkmark"></span>
                        <span className="model-name">{model.name}</span>
                      </label>
                      <label className="radio-wrapper">
                        <input
                          type="radio"
                          name="chairman"
                          checked={selectedChairman === model.id}
                          onChange={() => setSelectedChairman(model.id)}
                        />
                        <span className="radio-mark"></span>
                        <span className="radio-label">Chairman</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Model */}
              <div className="models-section">
                <h2>Custom Model</h2>
                <div className="custom-model-input">
                  <input
                    type="text"
                    value={newModelInput}
                    onChange={(e) => setNewModelInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewModel()}
                    placeholder="Enter model ID (e.g., ollama/llama2)"
                  />
                  <button onClick={addNewModel} className="add-model-btn">
                    Add Model
                  </button>
                </div>
              </div>

              {/* Selected Models */}
              {selectedCouncil.length > 0 && (
                <div className="models-section">
                  <h2>Selected Models ({selectedCouncil.length})</h2>
                  <div className="selected-models">
                    {selectedCouncil.map((model) => (
                      <div key={model} className="selected-model">
                        <span className="model-id">{model}</span>
                        {selectedChairman === model && (
                          <span className="chairman-badge">Chairman</span>
                        )}
                        <button
                          onClick={() => removeModel(model)}
                          className="remove-model-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Providers Info */}
              <div className="providers-info">
                <h3>Available Providers:</h3>
                <div className="provider-tags">
                  {availableProviders.map((provider) => (
                    <span key={provider} className="provider-tag">
                      {provider}
                    </span>
                  ))}
                </div>
                <p className="format-help">
                  Format: provider/model (e.g., openrouter/openai/gpt-4o)
                </p>
              </div>

              {/* Summary */}
              <div className="selection-summary">
                <div className="summary-item">
                  <span className="summary-label">Council Members:</span>
                  <span className="summary-value">{selectedCouncil.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Chairman:</span>
                  <span className="summary-value">
                    {selectedChairman || 'Not selected'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="selector-actions">
          <button
            onClick={handleConfirm}
            disabled={selectedCouncil.length === 0 || !selectedChairman}
            className="confirm-button"
          >
            Start Discussion
          </button>
        </div>
      </div>
    </div>
  );
}
