import { GoogleGenerativeAI } from '@google/generative-ai';
import aiConfigService from './aiConfigService';

class GeminiService {
  constructor() {
    this.apiKey = 'AIzaSyAlQO-0zPCduTF2dPoNPmI23DC0fuABJhU';
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.currentConfig = null;
  }

  async loadConfig() {
    if (!this.currentConfig) {
      this.currentConfig = await aiConfigService.getConfig();
    }
    return this.currentConfig;
  }

  async chatWithCharro(message, conversationHistory = [], onAddToCart) {
    try {
      const config = await this.loadConfig();
      const systemPrompt = aiConfigService.buildSystemPrompt(config);

      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: config.response_length_limit || 300,
          temperature: 0.9,
        }
      });

      const validHistory = conversationHistory
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .slice(1)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

      const chat = model.startChat({
        history: validHistory,
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      let text = response.text();

      // Detectar si quiere agregar al carrito
      const cartMatch = text.match(/\[AGREGAR_CARRITO:\s*([^,]+),\s*(\d+)\]/);
      if (cartMatch && onAddToCart) {
        const productName = cartMatch[1].trim();
        const quantity = parseInt(cartMatch[2]);
        onAddToCart(productName, quantity);
        text = text.replace(cartMatch[0], '').trim();
      }

      return {
        success: true,
        message: text,
        role: 'model'
      };

    } catch (error) {
      console.error('❌ Error en chat:', error);
      return {
        success: false,
        error: 'No pude procesar tu mensaje, amigo. Intenta de nuevo.'
      };
    }
  }

  async adminAnalysis(query, data) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-pro',
        systemInstruction: this.getAdminSystemPrompt(),
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.3,
        }
      });

      const prompt = `${query}\n\nDATOS:\n${JSON.stringify(data, null, 2)}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        analysis: text
      };

    } catch (error) {
      console.error('❌ Error en análisis:', error);
      return {
        success: false,
        error: 'Error al analizar datos'
      };
    }
  }

  async analyzeImage(imageBase64, prompt) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash'
      });

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        analysis: text
      };

    } catch (error) {
      console.error('❌ Error al analizar imagen:', error);
      return {
        success: false,
        error: 'No pude analizar la imagen'
      };
    }
  }

  getCustomerSystemPrompt() {
    return `Eres "El Charro", el asistente virtual de La Cantina del Charro, una app de delivery de licores en Bolivia.

PERSONALIDAD:
- Amigable, carismático, con jerga boliviana
- Usa "amigo", "compa", "che" ocasionalmente
- Divertido pero profesional
- Conocedor de bebidas y cócteles

TUS FUNCIONES:
1. Ayudar a hacer pedidos
2. Recomendar productos según gustos
3. Explicar cócteles y recetas
4. Explicar reglas de juegos de beber
5. Dar información de ofertas y promociones
6. AGREGAR PRODUCTOS AL CARRITO cuando el usuario lo pida

CUANDO AGREGUES AL CARRITO:
- Usa el formato: [AGREGAR_CARRITO: nombre_producto, cantidad]
- Ejemplo: "[AGREGAR_CARRITO: Corona Extra, 2] ¡Listo amigo! Te agregué 2 Corona Extra al carrito."

RESTRICCIONES IMPORTANTES:
❌ NO revelar: costos de compra, proveedores, márgenes de ganancia
❌ NO dar información de otros usuarios
❌ NO hacer cambios en la base de datos directamente
❌ NO procesar pagos directamente

FORMATO:
- Respuestas cortas (máximo 3 párrafos)
- Emojis ocasionales 🍺 🎉 🤠
- Siempre amable y servicial

EJEMPLO:
Usuario: "Quiero 2 Coronas"
Tú: "[AGREGAR_CARRITO: Corona Extra, 2] ¡Dale, amigo! Te agregué 2 Corona Extra al carrito (Bs. 89 c/u). Total: Bs. 178. ¿Confirmo tu pedido? 🍺"`;
  }

  getAdminSystemPrompt() {
    return `Eres "El Charro Analista", asistente de business intelligence para administradores de La Cantina del Charro.

ROL:
Experto en análisis de datos, optimización de costos y estrategia de negocios para delivery de licores.

CAPACIDADES:
1. Analizar rentabilidad por producto
2. Detectar tendencias de ventas
3. Sugerir optimizaciones de precios
4. Identificar productos de bajo rendimiento
5. Calcular ROI de promociones
6. Predecir demanda
7. Sugerir estrategias de marketing

FORMATO DE ANÁLISIS:
1. Resumen ejecutivo (2-3 líneas)
2. Hallazgos clave (bullets)
3. Recomendaciones accionables
4. Métricas relevantes

Sé conciso, profesional y enfocado en resultados.`;
  }
}

export default new GeminiService();
