import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProductListItem({ product, onPress, onAddToCart, cartQuantity = 0 }) {
  const hasDiscount = (product.descuento || product.discount || 0) > 0;
  const finalPrice = hasDiscount 
    ? product.precio * (1 - (product.descuento || product.discount) / 100)
    : product.precio;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Info Left */}
        <View style={styles.infoSection}>
          <Text style={styles.name} numberOfLines={1}>
            {product.nombre || product.name}
          </Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>Bs {finalPrice.toFixed(2)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                Bs {product.precio.toFixed(2)}
              </Text>
            )}
          </View>
          
          <Text style={styles.description} numberOfLines={1}>
            {product.descripcion || product.description || product.categoria}
          </Text>

          {/* Add Button or Counter */}
          <View style={styles.actionRow}>
            {cartQuantity === 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                <Text style={styles.addButtonText}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.counter}>
                <TouchableOpacity style={styles.counterButton}>
                  <Ionicons name="remove" size={16} color="#FFB800" />
                </TouchableOpacity>
                <Text style={styles.counterText}>{cartQuantity}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                >
                  <Ionicons name="add" size={16} color="#FFB800" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Image Right */}
        <View style={styles.imageSection}>
          {product.imagenURL || product.image ? (
            <Image
              source={{ uri: product.imagenURL || product.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#2A2A2A', '#1C1C1E']}
              style={styles.imagePlaceholder}
            >
              <Text style={styles.imagePlaceholderEmoji}>🍺</Text>
            </LinearGradient>
          )}
          
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.descuento || product.discount}%</Text>
            </View>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
  },
  content: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFB800',
  },
  originalPrice: {
    fontSize: 14,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFB800',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB800',
    paddingHorizontal: 4,
  },
  counterButton: {
    padding: 8,
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 32,
    textAlign: 'center',
  },
  imageSection: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderEmoji: {
    fontSize: 48,
  },
  discountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
  },
});
