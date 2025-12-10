import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import './ConfigPanel.css';

export default function ConfigPanel({ isOpen, onClose, onConfigUpdated }) {
  const { t } = useTranslation();
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
      console.error(t('configPanel.load_error'), error);
      alert(t('configPanel.load_error'))
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
      alert(t('configPanel.update_success'));
      onClose();
    } catch (error) {
      console.error(t('configPanel.update_error'), error);
      alert(t('configPanel.update_error'));
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addModel();
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
          <h2>{t('configPanel.title')}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="config-content">
          {loading ? (
            <div className="loading">{t('configPanel.loading')}</div>
          ) : (
            <>
              <div className="config-section">
                <h3>{t('configPanel.council_models')}</h3>
                <p className="section-description">
                  {t('configPanel.council_description')}
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
                        placeholder={t('configPanel.model_placeholder')}
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
                          title={t('configPanel.remove_model')}
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
                    onKeyDown={handleKeyDown}
                    className="new-model-input"
                    placeholder={t('configPanel.add_model_placeholder')}
                  />
                  <button onClick={addModel} className="add-button">
                    {t('configPanel.add_model')}
                  </button>
                </div>
              </div>

              <div className="config-section">
                <h3>{t('configPanel.chairman_model')}</h3>
                <p className="section-description">
                  {t('configPanel.chairman_description')}
                </p>
                <input
                  type="text"
                  value={config.chairman_model}
                  onChange={(e) =>
                    setConfig({ ...config, chairman_model: e.target.value })
                  }
                  className="chairman-input"
                  placeholder={t('configPanel.model_placeholder')}
                />
              </div>

              <div className="config-info">
                <h4>{t('configPanel.available_providers')}</h4>
                <div className="provider-list">
                  {availableProviders.map((provider) => (
                    <span key={provider} className="provider-tag">
                      {provider}
                    </span>
                  ))}
                </div>
                <p className="format-help">
                  {t('configPanel.format_help')}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="config-actions">
          <button onClick={onClose} className="cancel-button">
            {t('configPanel.cancel')}
          </button>
          <button
            onClick={handleUpdateConfig}
            disabled={saving || loading}
            className="save-button"
          >
            {saving ? t('configPanel.saving') : t('configPanel.save_changes')}
          </button>
        </div>
      </div>
    </div>
  );
}
