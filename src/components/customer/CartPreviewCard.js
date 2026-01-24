import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

const CartPreviewCard = ({ cartItems, deliveryEstimate, onPress }) => {
  
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);
  
  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);
  
  const estimatedTotal = useMemo(() => {
    const deliveryFee = deliveryEstimate?.priceRange?.average || 10;
    return subtotal + deliveryFee;
  }, [subtotal, deliveryEstimate]);
  
  if (cartItems.length === 0) {
    return null;
  }
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[COLORS.accent.gold, '#FF9500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Left: Cart Info */}
        <View style={styles.left}>
          <View style={styles.badge}>
            <Ionicons name="cart" size={16} color="#000000" />
            <Text style={styles.badgeText}>{itemCount}</Text>
          </View>
          
          <View style={styles.info}>
            <Text style={styles.itemsText}>
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </Text>
            {deliveryEstimate && (
              <Text style={styles.deliveryText}>
                + Delivery ~Bs {deliveryEstimate.priceRange.average}
              </Text>
            )}
          </View>
        </View>
        
        {/* Right: Total + Arrow */}
        <View style={styles.right}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total aprox.</Text>
            <Text style={styles.totalValue}>
              Bs {estimatedTotal.toFixed(2)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#000000" />
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
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  gradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#000000'
  },
  info: {
    flex: 1
  },
  itemsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#000000'
  },
  deliveryText: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.7)',
    marginTop: 2
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  totalContainer: {
    alignItems: 'flex-end'
  },
  totalLabel: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.7)'
  },
  totalValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#000000'
  }
});

export default CartPreviewCard;
