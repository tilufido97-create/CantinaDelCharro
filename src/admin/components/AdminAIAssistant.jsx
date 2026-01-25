import React, { useState, useRef, useEffect } from 'react';
import geminiService from '../../services/geminiService';
import './AdminAIAssistant.css';

const AdminAIAssistant = ({ salesData, productsData, ordersData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: '¡Qué onda, jefe! Soy El Charro Analista. Puedo ayudarte con análisis de ventas, sugerencias de precios, predicciones y más. ¿En qué te ayudo?',
      role: 'model',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    '¿Qué productos vendo más?',
    '¿Qué producto tiene mejor margen?',
    '¿Cuánto vendí hoy?',
    '¿Qué debo reordenar?',
  ];

  const handleSend = async (customMessage = null) => {
    const messageToSend = customMessage || inputText;
    if (!messageToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: messageToSend,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const data = {
        sales: salesData,
        products: productsData,
        orders: ordersData,
      };

      const response = await geminiService.adminAnalysis(messageToSend, data);

      if (response.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: response.analysis,
          role: 'model',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Uy wey, tuve un problema. Intenta de nuevo.',
          role: 'model',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Burbuja flotante */}
      <div 
        className={`ai-bubble ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <span className="ai-bubble-icon">🤠</span>
        <div className="ai-bubble-tooltip">El Charro Analista</div>
      </div>

      {/* Modal de chat */}
      {isOpen && (
        <div className="ai-chat-modal">
          <div className="ai-chat-header">
            <div>
              <h3>🤠 El Charro Analista</h3>
              <p>Tu asistente inteligente</p>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="ai-chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.role}`}>
                {msg.role === 'model' && <span className="message-icon">🤠</span>}
                <div className="message-content">
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message model">
                <span className="message-icon">🤠</span>
                <div className="message-content typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-questions">
            {quickQuestions.map((q, i) => (
              <button 
                key={i}
                className="quick-btn"
                onClick={() => handleSend(q)}
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>

          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Pregúntame lo que quieras..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button 
              className="send-btn"
              onClick={() => handleSend()}
              disabled={!inputText.trim() || loading}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAIAssistant;
