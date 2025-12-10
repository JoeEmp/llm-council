import { useState, useEffect } from 'react';
import { api } from '../api';
import './ConfigPanel.css';

export default function ConfigPanel({ isOpen, onClose, onConfigUpdated }) {
  const [config, setConfig] = useState({ council_models: [], chairman_model: '' });
  const [availableProviders, setAvailableProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newModel, setNewModel] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const result = await api.getConfig();
      setConfig(result.config);
      setAvailableProviders(result.available_providers);
    } catch (error) {
      console.error('Failed to load config:', error);
      alert('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      setSaving(true);
      await api.updateConfig({
        council_models: config.council_models,
        chairman_model: config.chairman_model,
      });
      onConfigUpdated?.();
      alert('Configuration updated successfully! Changes will take effect on the next request.');
      onClose();
    } catch (error) {
      console.error('Failed to update config:', error);
      alert('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const addModel = () => {
    if (newModel.trim() && !config.council_models.includes(newModel.trim())) {
      setConfig({
        ...config,
        council_models: [...config.council_models, newModel.trim()],
      });
      setNewModel('');
    }
  };

  const removeModel = (index) => {
    setConfig({
      ...config,
      council_models: config.council_models.filter((_, i) => i !== index),
    });
  };

  const moveModel = (index, direction) => {
    const newModels = [...config.council_models];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newModels.length) return;

    [newModels[index], newModels[newIndex]] = [newModels[newIndex], newModels[index]];
    setConfig({ ...config, council_models: newModels });
  };

  if (!isOpen) return null;

  return (
    <div className="config-modal-overlay">
      <div className="config-modal">
        <div className="config-header">
          <h2>Model Configuration</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="config-content">
          {loading ? (
            <div className="loading">Loading configuration...</div>
          ) : (
            <>
              <div className="config-section">
                <h3>Council Models</h3>
                <p className="section-description">
                  Models that participate in the council and provide individual responses
                </p>

                <div className="model-list">
                  {config.council_models.map((model, index) => (
                    <div key={index} className="model-item">
                      <span className="model-index">{index + 1}.</span>
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => {
                          const newModels = [...config.council_models];
                          newModels[index] = e.target.value;
                          setConfig({ ...config, council_models: newModels });
                        }}
                        className="model-input"
                        placeholder="provider/model"
                      />
                      <div className="model-actions">
                        <button
                          onClick={() => moveModel(index, 'up')}
                          disabled={index === 0}
                          className="move-button"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveModel(index, 'down')}
                          disabled={index === config.council_models.length - 1}
                          className="move-button"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeModel(index)}
                          className="remove-button"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="add-model">
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addModel()}
                    className="new-model-input"
                    placeholder="Add new model (e.g., ollama/llama2)"
                  />
                  <button onClick={addModel} className="add-button">
                    Add Model
                  </button>
                </div>
              </div>

              <div className="config-section">
                <h3>Chairman Model</h3>
                <p className="section-description">
                  Model that synthesizes the final response based on all council responses
                </p>
                <input
                  type="text"
                  value={config.chairman_model}
                  onChange={(e) =>
                    setConfig({ ...config, chairman_model: e.target.value })
                  }
                  className="chairman-input"
                  placeholder="provider/model"
                />
              </div>

              <div className="config-info">
                <h4>Available Providers:</h4>
                <div className="provider-list">
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
            </>
          )}
        </div>

        <div className="config-actions">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button
            onClick={handleUpdateConfig}
            disabled={saving || loading}
            className="save-button"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
