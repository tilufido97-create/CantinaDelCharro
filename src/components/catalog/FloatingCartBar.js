import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function FloatingCartBar({ cartItems, onPress }) {
  if (!cartItems || cartItems.length === 0) return null;

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cartItems.reduce((sum, item) => 
    sum + (item.precio || item.price || 0) * (item.quantity || 1), 0
  );

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#FFB800', '#FF9500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
            <Text style={styles.itemsText}>
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.priceText}>Bs {totalPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.rightSection}>
            <Text style={styles.viewCartText}>Ver Carrito</Text>
            <Ionicons name="arrow-forward" size={20} color="#000000" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#000000',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFB800',
  },
  itemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
