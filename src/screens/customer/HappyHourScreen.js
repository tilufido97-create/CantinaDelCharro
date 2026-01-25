import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import firebaseProductService from '../../services/firebaseProductService';
import { addToCart, getCartCount } from '../../utils/cartManager';

export default function HappyHourScreen({ navigation }) {
  const [promoProducts, setPromoProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadCartCount();
    
    const unsubscribe = firebaseProductService.subscribeToProducts((products) => {
      // Filtrar productos con descuento > 0
      const withPromo = products.filter(p => p.discount > 0);
      setPromoProducts(withPromo);
    });

    return () => unsubscribe();
  }, []);

  const loadCartCount = async () => {
    const count = await getCartCount();
    setCartCount(count);
  };

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
    await loadCartCount();
    Alert.alert('¡Agregado! 🎉', `${product.name} agregado al carrito`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Happy Hour 🎉</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Checkout')}>
          <View>
            <Text style={styles.cartIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🍺🎉</Text>
          <Text style={styles.bannerTitle}>¡OFERTAS ESPECIALES!</Text>
          <Text style={styles.bannerSubtitle}>Aprovecha nuestras promociones 2x1</Text>
        </View>

        {/* Productos en Promoción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos en Oferta</Text>
          
          {promoProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>😔</Text>
              <Text style={styles.emptyText}>No hay promociones activas</Text>
              <Text style={styles.emptySubtext}>Vuelve pronto para ver nuevas ofertas</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {promoProducts.map(product => {
                const price = product.price || 0;
                const discount = product.discount || 0;
                const finalPrice = price * (1 - discount / 100);
                const imageUrl = product.images?.[0];

                return (
                  <TouchableOpacity 
                    key={product.id} 
                    style={styles.productCard}
                    onPress={() => handleAddToCart(product)}
                  >
                    {/* Badge de Descuento */}
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{discount}%</Text>
                    </View>

                    {/* Imagen */}
                    <View style={styles.imageContainer}>
                      {imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Text style={styles.placeholderEmoji}>🍺</Text>
                        </View>
                      )}
                    </View>

                    {/* Info */}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      
                      <View style={styles.priceRow}>
                        <View>
                          <Text style={styles.oldPrice}>Bs {price.toFixed(2)}</Text>
                          <Text style={styles.newPrice}>Bs {finalPrice.toFixed(2)}</Text>
                        </View>
                        
                        <TouchableOpacity 
                          style={styles.addButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          <Ionicons name="add" size={20} color="#000" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.xl, 
    paddingVertical: SPACING.md 
  },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: TYPOGRAPHY.weights.bold, 
    color: COLORS.text.primary 
  },
  cartIcon: { fontSize: 28 },
  badge: { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    backgroundColor: COLORS.accent.gold, 
    borderRadius: BORDER_RADIUS.full, 
    width: 20, 
    height: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  badgeText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: '#000' },
  banner: { 
    backgroundColor: COLORS.accent.gold, 
    marginHorizontal: SPACING.xl, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.xl, 
    alignItems: 'center', 
    marginVertical: SPACING.md 
  },
  bannerEmoji: { fontSize: 50, marginBottom: SPACING.sm },
  bannerTitle: { 
    fontSize: TYPOGRAPHY.sizes['2xl'], 
    fontWeight: TYPOGRAPHY.weights.bold, 
    color: '#000' 
  },
  bannerSubtitle: { fontSize: TYPOGRAPHY.sizes.base, color: '#000', marginTop: SPACING.xs },
  section: { paddingHorizontal: SPACING.xl, marginTop: SPACING.lg },
  sectionTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: TYPOGRAPHY.weights.bold, 
    color: COLORS.text.primary, 
    marginBottom: SPACING.md 
  },
  productsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    gap: SPACING.md 
  },
  productCard: { 
    width: '48%', 
    backgroundColor: COLORS.bg.secondary, 
    borderRadius: BORDER_RADIUS.lg, 
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.accent.gold + '40',
  },
  discountBadge: { 
    position: 'absolute', 
    top: SPACING.sm, 
    right: SPACING.sm, 
    backgroundColor: '#FF3B30', 
    paddingHorizontal: SPACING.sm, 
    paddingVertical: 4, 
    borderRadius: BORDER_RADIUS.sm,
    zIndex: 10,
  },
  discountText: { 
    fontSize: 12, 
    fontWeight: TYPOGRAPHY.weights.bold, 
    color: '#FFF' 
  },
  imageContainer: { 
    width: '100%', 
    height: 140, 
    backgroundColor: COLORS.bg.tertiary 
  },
  productImage: { width: '100%', height: '100%' },
  imagePlaceholder: { 
    width: '100%', 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeholderEmoji: { fontSize: 50 },
  productInfo: { padding: SPACING.md },
  productName: { 
    fontSize: TYPOGRAPHY.sizes.base, 
    fontWeight: TYPOGRAPHY.weights.semibold, 
    color: COLORS.text.primary, 
    marginBottom: SPACING.sm,
    minHeight: 40,
  },
  priceRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end' 
  },
  oldPrice: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: COLORS.text.tertiary, 
    textDecorationLine: 'line-through' 
  },
  newPrice: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: TYPOGRAPHY.weights.bold, 
    color: COLORS.accent.gold 
  },
  addButton: { 
    width: 36, 
    height: 36, 
    borderRadius: BORDER_RADIUS.full, 
    backgroundColor: COLORS.accent.gold, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: SPACING.xxl * 2 
  },
  emptyEmoji: { fontSize: 60, marginBottom: SPACING.md },
  emptyText: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: TYPOGRAPHY.weights.bold, 
    color: COLORS.text.primary, 
    marginBottom: SPACING.xs 
  },
  emptySubtext: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: COLORS.text.tertiary 
  },
});
