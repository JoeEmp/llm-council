import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import './ModelSelector.css';

export default function ModelSelector({ onModelsSelected, onCancel }) {
  const { t } = useTranslation();
  const [config, setConfig] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [recommendedModels, setRecommendedModels] = useState([]);
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
      const [configResult, recommendedResult] = await Promise.all([
        api.getConfig(),
        api.getRecommendedModels(),
      ]);

      const currentCouncilModels = configResult.config.council_models || [];
      setConfig(configResult.config);
      setAvailableProviders(configResult.available_providers);
      setSelectedCouncil(currentCouncilModels);
      setSelectedChairman(configResult.config.chairman_model || '');

      // Merge recommended models with current council models
      const recommendedIds = new Set(recommendedResult.models.map(m => m.id));
      const allModels = [...recommendedResult.models];

      // Add current council models that are not in recommended list
      currentCouncilModels.forEach(modelId => {
        if (!recommendedIds.has(modelId)) {
          allModels.push({
            id: modelId,
            name: modelId // Use ID as name for custom models
          });
        }
      });

      setRecommendedModels(allModels);
    } catch (error) {
      console.error(t('modelSelector.load_error'), error);
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
      alert(t('modelSelector.select_council'));
      return;
    }
    if (!selectedChairman) {
      alert(t('modelSelector.select_chairman'));
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

  return (
    <div className="model-selector-overlay">
      <div className="model-selector">
        <div className="selector-header">
          <h1>{t('modelSelector.title')}</h1>
          <p className="selector-subtitle">
            {t('modelSelector.subtitle')}
          </p>
        </div>

        <div className="selector-content">
          {loading ? (
            <div className="loading-selector">{t('modelSelector.loading')}</div>
          ) : (
            <>
              {/* Preset Models */}
              <div className="models-section">
                <h2>{t('modelSelector.quick_select')}</h2>
                <div className="preset-models">
                  {recommendedModels.map((model) => (
                    <div key={model.id} className="preset-model-card">
                      <label className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={selectedCouncil.includes(model.id)}
                          onChange={() => toggleCouncilModel(model.id)}
                        />
                        <span className="checkmark"></span>
                        <span className="model-name" title={model.name}>{model.name}</span>
                      </label>
                      <label className="radio-wrapper">
                        <input
                          type="radio"
                          name="chairman"
                          checked={selectedChairman === model.id}
                          onChange={() => setSelectedChairman(model.id)}
                        />
                        <span className="radio-mark"></span>
                        <span className="radio-label">{t('modelSelector.chairman')}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Model */}
              <div className="models-section">
                <h2>{t('modelSelector.custom_model')}</h2>
                <div className="custom-model-input">
                  <input
                    type="text"
                    value={newModelInput}
                    onChange={(e) => setNewModelInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNewModel()}
                    placeholder={t('modelSelector.model_placeholder')}
                  />
                  <button onClick={addNewModel} className="add-model-btn">
                    {t('modelSelector.add_model')}
                  </button>
                </div>
              </div>

              {/* Selected Models */}
              {selectedCouncil.length > 0 && (
                <div className="models-section">
                  <h2>{t('modelSelector.selected_models', { count: selectedCouncil.length })}</h2>
                  <div className="selected-models">
                    {selectedCouncil.map((model) => (
                      <div key={model} className="selected-model">
                        <span className="model-id">{model}</span>
                        {selectedChairman === model && (
                          <span className="chairman-badge">{t('modelSelector.chairman')}</span>
                        )}
                        <button
                          onClick={() => removeModel(model)}
                          className="remove-model-btn"
                          title={t('modelSelector.remove_model')}
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
                <h3>{t('modelSelector.available_providers')}</h3>
                <div className="provider-tags">
                  {availableProviders.map((provider) => (
                    <span key={provider} className="provider-tag">
                      {provider}
                    </span>
                  ))}
                </div>
                <p className="format-help">
                  {t('modelSelector.format_help')}
                </p>
              </div>

              {/* Summary */}
              <div className="selection-summary">
                <div className="summary-item">
                  <span className="summary-label">{t('modelSelector.council_members')}:</span>
                  <span className="summary-value">{selectedCouncil.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t('modelSelector.chairman')}:</span>
                  <span className="summary-value">
                    {selectedChairman || t('modelSelector.not_selected')}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="selector-actions">
          <button
            onClick={onCancel}
            className="cancel-button"
          >
            {t('modelSelector.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedCouncil.length === 0 || !selectedChairman}
            className="confirm-button"
          >
            {t('modelSelector.start_discussion')}
          </button>
        </div>
      </div>
    </div>
  );
}
