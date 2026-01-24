import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProductListItem({ product, onPress, onAddToCart, cartQuantity = 0 }) {
  // Normalizar datos del producto
  const price = product.precio || product.price || 0;
  const discount = product.descuento || product.discount || 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;
  const categoryName = product.categoria || product.category || '';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Info Left */}
        <View style={styles.infoSection}>
          <Text style={styles.name} numberOfLines={2}>
            {product.nombre || product.name}
          </Text>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryName}</Text>
          </View>
          
          <Text style={styles.price}>Bs. {finalPrice.toFixed(2)}</Text>

          {/* Add Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            <Ionicons name="add" size={20} color="#0A0A0A" />
            <Text style={styles.addButtonText}>AGREGAR</Text>
          </TouchableOpacity>
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
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.1)',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFB800',
    fontWeight: '500',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  imageSection: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 150,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 100,
    height: 150,
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
    height: 0,
  },
});
