import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import geminiService from '../../services/geminiService';

export default function CharroChatBotScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: '¡Hola, amigo! Soy El Charro 🤠\n\n¿En qué te puedo ayudar hoy? Puedo recomendarte bebidas, explicarte recetas de cócteles o ayudarte con tu pedido.',
      role: 'model',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.text
      }));

      const handleAddToCart = (productName, quantity) => {
        console.log(`🛍️ Agregar al carrito: ${quantity}x ${productName}`);
        // TODO: Implementar lógica de agregar al carrito
      };

      const response = await geminiService.chatWithCharro(inputText, history, handleAddToCart);

      if (response.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          role: 'model',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Perdón amigo, tuve un problema técnico. ¿Puedes intentar de nuevo? 🤠',
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

  const renderMessage = (message) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble
        ]}
      >
        {!isUser && <Text style={styles.aiIcon}>🤠</Text>}
        <View style={{ flex: 1 }}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.aiText
          ]}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>El Charro 🤠</Text>
        <Text style={styles.headerSubtitle}>Tu asistente personal</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          
          {loading && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={COLORS.accent.gold} />
              <Text style={styles.typingText}>El Charro está escribiendo...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor={COLORS.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !loading ? '#0A0A0A' : COLORS.text.tertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.tertiary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent.gold,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bg.secondary,
  },
  aiIcon: {
    fontSize: 20,
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 22,
  },
  userText: {
    color: '#0A0A0A',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  aiText: {
    color: COLORS.text.primary,
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bg.secondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  typingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.bg.tertiary,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.bg.tertiary,
  },
});
