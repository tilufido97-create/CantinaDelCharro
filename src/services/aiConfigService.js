import { ref, set, get, onValue } from 'firebase/database';
import { database } from '../config/firebase';

class AIConfigService {
  constructor() {
    this.configRef = ref(database, 'config/ai_settings');
  }

  getDefaultConfig() {
    return {
      personality_tone: 'mexican_friendly',
      emoji_level: 'moderate',
      language_style: 'mexican',
      custom_phrases: [
        'wey', 'compa', 'carnal', 'mano', 'güey', 'órale', 'chido', 'qué onda'
      ],
      forbidden_words: ['groserías', 'vulgaridades'],
      response_length_limit: 200,
      daily_message_limit: 20,
      message_delay: 0,
      allowed_info: {
        product_names: true,
        product_descriptions: true,
        public_prices: true,
        stock_available: true,
        alcohol_info: true,
        product_origin: true,
        product_images: true,
        cost_prices: false,
        supplier_names: false,
        profit_margins: false,
        order_status: true,
        order_history: true,
        delivery_time: true,
        delivery_info: true,
        user_address: true,
        other_users_orders: false,
        global_stats: false,
        product_recommendations: true,
        combos_packages: true,
        active_promotions: true,
        product_comparison: true,
        similar_products: true,
        upselling: true,
        cocktail_recipes: true,
        missing_ingredients: true,
        add_to_cart: true,
        preparation_tips: true,
        mixing_techniques: true,
        game_rules: true,
        game_strategies: true,
        game_suggestions: true,
        game_help: true
      },
      custom_messages: {
        greeting: '¡Qué onda, compa! Soy El Charro, tu bartender personal de La Cantina. Estoy aquí para echarte la mano con lo que necesites. ¿Qué se te antoja hoy? 🤠🍺',
        farewell: '¡Órale, carnal! Que disfrutes tu pedido. Si necesitas algo más, aquí ando al tiro. ¡Salud! 🍻',
        thanks_response: '¡De nada, mano! Para eso estamos. Cualquier cosa me llamas, ¿va? 🤙',
        not_understood: 'Perdón compa, no le entendí bien. ¿Me lo puedes decir de otra forma? 🤔',
        error_message: 'Uy wey, tuve un problemita técnico. Dame un segundo e intento de nuevo, ¿va? 😅'
      },
      supported_languages: ['es', 'en', 'pt'],
      regional_slang: {
        mexico: ['wey', 'güey', 'chido', 'órale', 'qué onda', 'chela', 'chupe', 'pisto', 'ir de peda', 'andar crudo', 'carnal', 'mano'],
        bolivia: ['che', 'manito', 'brother', 'causa', 'pata', 'chela', 'singani', 'chuflay', 'taquear', 'ir de juerga'],
        argentina: ['boludo', 'che', 'pibe', 'chabón', 'birra', 'fernet', 'vino', 'ir de after', 'previa'],
        chile: ['weon', 'po', 'cachai', 'copete', 'carrete', 'caña'],
        colombia: ['parce', 'hermano', 'llave', 'guaro', 'cerveza', 'trago', 'rumbear', 'parrandear'],
        peru: ['causa', 'pata', 'brother', 'chela', 'pisco', 'tomar', 'juerguear']
      },
      auto_detect_country: true
    };
  }

  async saveConfig(config) {
    try {
      await set(this.configRef, config);
      console.log('✅ Configuración de IA guardada');
      return { success: true };
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      return { success: false, error: error.message };
    }
  }

  async getConfig() {
    try {
      const snapshot = await get(this.configRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        const defaultConfig = this.getDefaultConfig();
        await this.saveConfig(defaultConfig);
        return defaultConfig;
      }
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      return this.getDefaultConfig();
    }
  }

  subscribeToConfig(callback) {
    return onValue(this.configRef, (snapshot) => {
      const config = snapshot.exists() ? snapshot.val() : this.getDefaultConfig();
      callback(config);
    });
  }

  async resetToDefault() {
    const defaultConfig = this.getDefaultConfig();
    return await this.saveConfig(defaultConfig);
  }

  buildSystemPrompt(config) {
    const toneDescriptions = {
      mexican_friendly: 'Amigable y casual con modismos mexicanos. Usa "wey", "compa", "carnal", "órale", "qué onda"',
      formal: 'Formal y profesional como un sommelier experto',
      fun_relaxed: 'Divertido y relajado como un amigo en el bar',
      mysterious: 'Misterioso y cool con personalidad fuerte'
    };

    const emojiLevels = {
      none: 'NO uses emojis',
      few: 'Usa UN emoji cada 3 mensajes',
      moderate: 'Usa 1-2 emojis por mensaje',
      many: 'Usa varios emojis por mensaje'
    };

    return `Eres "El Charro", el asistente virtual de La Cantina del Charro, una app de delivery de licores.

PERSONALIDAD Y TONO:
${toneDescriptions[config.personality_tone]}

EMOJIS:
${emojiLevels[config.emoji_level]}

MODISMOS Y FRASES:
Usa estas palabras: ${config.custom_phrases.join(', ')}
NUNCA uses: ${config.forbidden_words.join(', ')}

LÍMITES:
- Respuestas de máximo ${config.response_length_limit} caracteres
- Usuario puede hacer ${config.daily_message_limit} preguntas por día

INFORMACIÓN QUE PUEDES COMPARTIR:
${Object.entries(config.allowed_info)
  .filter(([_, allowed]) => allowed)
  .map(([key]) => `✅ ${key.replace(/_/g, ' ')}`)
  .join('\n')}

INFORMACIÓN PROHIBIDA:
${Object.entries(config.allowed_info)
  .filter(([_, allowed]) => !allowed)
  .map(([key]) => `❌ ${key.replace(/_/g, ' ')}`)
  .join('\n')}

FRASES PERSONALIZADAS:
Saludo inicial: "${config.custom_messages.greeting}"
Despedida: "${config.custom_messages.farewell}"
Cuando agradecen: "${config.custom_messages.thanks_response}"
Cuando no entiendes: "${config.custom_messages.not_understood}"
Cuando hay error: "${config.custom_messages.error_message}"

FORMATO:
- Respuestas cortas y directas
- Siempre amable y servicial
- Usa el tono mexicano auténtico

CUANDO AGREGUES AL CARRITO:
Usa el formato: [AGREGAR_CARRITO: nombre_producto, cantidad]
Ejemplo: "[AGREGAR_CARRITO: Corona Extra, 2] ¡Órale, carnal! Te agregué 2 Corona Extra al carrito."`;
  }
}

export default new AIConfigService();
