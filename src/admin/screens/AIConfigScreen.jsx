import React, { useState, useEffect } from 'react';
import aiConfigService from '../../services/aiConfigService';
import AdminLayout from '../components/AdminLayout';
import './AIConfigScreen.css';

const AIConfigScreen = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const cfg = await aiConfigService.getConfig();
    setConfig(cfg);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await aiConfigService.saveConfig(config);
    setSaving(false);
    alert('✅ Configuración guardada exitosamente');
  };

  const handleReset = async () => {
    if (confirm('¿Seguro que quieres restaurar los valores por defecto?')) {
      await aiConfigService.resetToDefault();
      await loadConfig();
      alert('✅ Configuración restaurada');
    }
  };

  if (loading) return (
    <AdminLayout title="Configurar IA" showBackButton>
      <div className="loading">Cargando configuración...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Configurar IA" showBackButton>
      <div className="ai-config-screen">
      <div className="config-header">
        <div>
          <h1>🤠 Configuración de El Charro</h1>
          <p>Personaliza cómo tu asistente IA interactúa con los clientes</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleReset}>
            Restaurar por defecto
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: PERSONALIDAD */}
      <div className="config-section">
        <h2>🎭 Personalidad y Tono</h2>
        <p className="section-desc">Cómo debe hablar El Charro</p>

        <div className="form-group">
          <label>Tono de voz:</label>
          <select 
            value={config.personality_tone}
            onChange={(e) => setConfig({...config, personality_tone: e.target.value})}
          >
            <option value="mexican_friendly">🇲🇽 Mexicano amigable (wey, compa, carnal) ⭐</option>
            <option value="formal">👔 Formal y profesional</option>
            <option value="fun_relaxed">😎 Divertido y relajado</option>
            <option value="mysterious">🕶️ Misterioso y cool</option>
          </select>
        </div>

        <div className="form-group">
          <label>Uso de emojis:</label>
          <select 
            value={config.emoji_level}
            onChange={(e) => setConfig({...config, emoji_level: e.target.value})}
          >
            <option value="none">Sin emojis</option>
            <option value="few">Pocos emojis</option>
            <option value="moderate">Moderado (1-2 por mensaje) ⭐</option>
            <option value="many">Muchos emojis</option>
          </select>
        </div>

        <div className="form-group">
          <label>Palabras que debe usar:</label>
          <input 
            type="text"
            value={config.custom_phrases.join(', ')}
            onChange={(e) => setConfig({...config, custom_phrases: e.target.value.split(', ')})}
            placeholder="wey, compa, carnal, órale"
          />
        </div>

        <div className="form-group">
          <label>Palabras prohibidas:</label>
          <input 
            type="text"
            value={config.forbidden_words.join(', ')}
            onChange={(e) => setConfig({...config, forbidden_words: e.target.value.split(', ')})}
            placeholder="groserías, vulgaridades"
          />
        </div>
      </div>

      {/* SECCIÓN 2: LÍMITES */}
      <div className="config-section">
        <h2>⚙️ Límites y Restricciones</h2>
        <p className="section-desc">Controla cuánto puede responder</p>

        <div className="form-group">
          <label>Longitud máxima de respuestas:</label>
          <select 
            value={config.response_length_limit}
            onChange={(e) => setConfig({...config, response_length_limit: parseInt(e.target.value)})}
          >
            <option value="100">Muy cortas (100 caracteres)</option>
            <option value="200">Cortas (200 caracteres) ⭐</option>
            <option value="400">Medianas (400 caracteres)</option>
            <option value="1000">Largas (1000 caracteres)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Mensajes por usuario al día:</label>
          <input 
            type="number"
            value={config.daily_message_limit}
            onChange={(e) => setConfig({...config, daily_message_limit: parseInt(e.target.value)})}
            min="5"
            max="100"
          />
        </div>

        <div className="form-group">
          <label>Tiempo de espera entre mensajes (segundos):</label>
          <input 
            type="range"
            value={config.message_delay}
            onChange={(e) => setConfig({...config, message_delay: parseInt(e.target.value)})}
            min="0"
            max="60"
          />
          <span>{config.message_delay}s</span>
        </div>
      </div>

      {/* SECCIÓN 3: INFORMACIÓN */}
      <div className="config-section">
        <h2>📊 Información que puede compartir</h2>
        <p className="section-desc">Qué datos puede dar a los clientes</p>

        <div className="checkbox-grid">
          {Object.entries(config.allowed_info).map(([key, value]) => (
            <label key={key} className="checkbox-item">
              <input 
                type="checkbox"
                checked={value}
                onChange={(e) => setConfig({
                  ...config,
                  allowed_info: {...config.allowed_info, [key]: e.target.checked}
                })}
                disabled={['product_names', 'supplier_names', 'profit_margins'].includes(key)}
              />
              <span>{key.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SECCIÓN 4: MENSAJES PERSONALIZADOS */}
      <div className="config-section">
        <h2>💬 Mensajes Personalizados</h2>
        <p className="section-desc">Personaliza cómo saluda y se despide</p>

        <div className="form-group">
          <label>Saludo inicial:</label>
          <textarea 
            value={config.custom_messages.greeting}
            onChange={(e) => setConfig({
              ...config,
              custom_messages: {...config.custom_messages, greeting: e.target.value}
            })}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Despedida:</label>
          <textarea 
            value={config.custom_messages.farewell}
            onChange={(e) => setConfig({
              ...config,
              custom_messages: {...config.custom_messages, farewell: e.target.value}
            })}
            rows="2"
          />
        </div>

        <div className="form-group">
          <label>Cuando agradecen:</label>
          <input 
            type="text"
            value={config.custom_messages.thanks_response}
            onChange={(e) => setConfig({
              ...config,
              custom_messages: {...config.custom_messages, thanks_response: e.target.value}
            })}
          />
        </div>
      </div>

      {/* SECCIÓN 5: MULTIIDIOMA */}
      <div className="config-section">
        <h2>🌎 Idiomas y Modismos</h2>
        <p className="section-desc">Idiomas que debe entender</p>

        <div className="form-group">
          <label>
            <input 
              type="checkbox"
              checked={config.auto_detect_country}
              onChange={(e) => setConfig({...config, auto_detect_country: e.target.checked})}
            />
            Detectar automáticamente el país del usuario
          </label>
        </div>

        <div className="slang-grid">
          {Object.entries(config.regional_slang).map(([country, words]) => (
            <div key={country} className="slang-card">
              <h4>{country.toUpperCase()}</h4>
              <p>{words.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default AIConfigScreen;
