import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CharroRecommendation = ({ product, onPress }) => {
  if (!product) return null;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={['#2A2A2A', '#1A1A1A']}
        style={styles.container}
      >
        <Text style={styles.emoji}>🤠</Text>
        <Text style={styles.subtitle}>Basado en tu última compra...</Text>
        <Text style={styles.productName}>{product.name || product.nombre}</Text>
        <Text style={styles.price}>Bs {product.price || product.precio}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>✨ Recomendado por IA</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB800',
    marginHorizontal: 20,
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFB800',
    textAlign: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFB800',
  },
});

export default CharroRecommendation;
