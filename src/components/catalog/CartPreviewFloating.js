import React, { useMemo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const CartPreviewFloating = ({ cartItems, onPress }) => {
  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || item.cantidad || 1), 0);
  }, [cartItems]);

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.price || item.precio || 0;
      const quantity = item.quantity || item.cantidad || 1;
      return sum + (price * quantity);
    }, 0);
  }, [cartItems]);

  if (cartItems.length === 0) return null;

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
        <View style={styles.left}>
          <Ionicons name="cart" size={24} color="#000000" />
          <Text style={styles.itemCount}>{itemCount} items</Text>
        </View>
        
        <View style={styles.right}>
          <Text style={styles.total}>Bs {total.toFixed(2)}</Text>
          <Text style={styles.action}>Ver Carrito →</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  right: {
    alignItems: 'flex-end',
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.7)',
  },
});

export default CartPreviewFloating;
