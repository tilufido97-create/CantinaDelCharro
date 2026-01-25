import React, { useState } from 'react';
import geminiService from '../../services/geminiService';
import './CharroAnalyst.css';

const CharroAnalyst = ({ salesData, productsData, ordersData }) => {
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    '¿Qué productos tienen mejor margen de ganancia?',
    '¿Cuáles son las tendencias de ventas este mes?',
    '¿Qué productos debo promocionar?',
    '¿Cómo optimizar los precios?',
    'Analiza la rentabilidad por categoría',
    '¿Qué productos tienen bajo rendimiento?'
  ];

  const handleAnalyze = async (customQuery = null) => {
    const questionToAsk = customQuery || query;
    if (!questionToAsk.trim()) return;

    setLoading(true);
    setAnalysis('');

    try {
      const data = {
        sales: salesData,
        products: productsData,
        orders: ordersData,
        summary: {
          totalSales: salesData?.length || 0,
          totalProducts: productsData?.length || 0,
          totalOrders: ordersData?.length || 0
        }
      };

      const response = await geminiService.adminAnalysis(questionToAsk, data);

      if (response.success) {
        setAnalysis(response.analysis);
      } else {
        setAnalysis('Error al analizar datos. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      setAnalysis('Error al conectar con el servicio de análisis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="charro-analyst">
      <div className="analyst-header">
        <h2>🤠 El Charro Analista</h2>
        <p>Análisis inteligente de tu negocio con IA</p>
      </div>

      <div className="quick-questions">
        <h3>Preguntas rápidas:</h3>
        <div className="questions-grid">
          {quickQuestions.map((q, index) => (
            <button
              key={index}
              className="quick-question-btn"
              onClick={() => handleAnalyze(q)}
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-query">
        <h3>O haz tu propia pregunta:</h3>
        <div className="query-input-group">
          <textarea
            className="query-input"
            placeholder="Ejemplo: ¿Qué estrategia de marketing recomiendas para aumentar ventas?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            disabled={loading}
          />
          <button
            className="analyze-btn"
            onClick={() => handleAnalyze()}
            disabled={loading || !query.trim()}
          >
            {loading ? 'Analizando...' : 'Analizar'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>El Charro está analizando tus datos...</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="analysis-result">
          <h3>📊 Análisis:</h3>
          <div className="analysis-content">
            {analysis.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharroAnalyst;
