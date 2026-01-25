import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import firebaseProductService from '../../services/firebaseProductService';
import firebaseOrderService from '../../services/firebaseOrderService';
import { addToCart, getCartCount } from '../../utils/cartManager';

export default function TrendingProductsScreen({ navigation }) {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadCartCount();
    loadTrendingProducts();
  }, []);

  const loadCartCount = async () => {
    const count = await getCartCount();
    setCartCount(count);
  };

  const loadTrendingProducts = async () => {
    const unsubscribeOrders = firebaseOrderService.subscribeToOrders((orders) => {
      const unsubscribeProducts = firebaseProductService.subscribeToProducts((products) => {
        // Contar ventas por producto
        const salesCount = {};
        orders.forEach(order => {
          if (order.status === 'entregado') {
            order.items?.forEach(item => {
              salesCount[item.productId] = (salesCount[item.productId] || 0) + item.quantity;
            });
          }
        });

        // Ordenar productos por ventas
        const productsWithSales = products.map(p => ({
          ...p,
          totalSales: salesCount[p.id] || 0
        }));

        const sorted = productsWithSales
          .filter(p => p.totalSales > 0)
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, 10);

        setTrendingProducts(sorted);
      });

      return () => unsubscribeProducts();
    });

    return () => unsubscribeOrders();
  };

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
    await loadCartCount();
    Alert.alert('¡Agregado! 🔥', `${product.name} agregado al carrito`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Más Pedidos 🔥</Text>
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
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🔥📊</Text>
          <Text style={styles.bannerTitle}>LOS FAVORITOS</Text>
          <Text style={styles.bannerSubtitle}>Los productos que más aman nuestros clientes</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Productos</Text>
          
          {trendingProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>Aún no hay datos de ventas</Text>
              <Text style={styles.emptySubtext}>Los productos más vendidos aparecerán aquí</Text>
            </View>
          ) : (
            <View style={styles.productsList}>
              {trendingProducts.map((product, index) => {
                const price = product.price || 0;
                const discount = product.discount || 0;
                const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
                const imageUrl = product.images?.[0];

                return (
                  <TouchableOpacity 
                    key={product.id} 
                    style={styles.productCard}
                    onPress={() => handleAddToCart(product)}
                  >
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>

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

                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      
                      <View style={styles.priceRow}>
                        <Text style={styles.price}>Bs {finalPrice.toFixed(2)}</Text>
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
    backgroundColor: '#FF3B30', 
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
    color: '#FFF' 
  },
  bannerSubtitle: { fontSize: TYPOGRAPHY.sizes.base, color: '#FFF', marginTop: SPACING.xs },
  section: { paddingHorizontal: SPACING.xl, marginTop: SPACING.lg },
  sectionTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: TYPOGRAPHY.weights.bold, 
    color: COLORS.text.primary, 
    marginBottom: SPACING.md 
  },
  productsList: { gap: SPACING.md },
  productCard: { 
    backgroundColor: COLORS.bg.secondary, 
    borderRadius: BORDER_RADIUS.lg, 
    flexDirection: 'row',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FF3B30' + '40',
    position: 'relative',
  },
  rankBadge: { 
    position: 'absolute', 
    top: SPACING.sm, 
    left: SPACING.sm, 
    backgroundColor: '#FF3B30', 
    paddingHorizontal: SPACING.sm, 
    paddingVertical: 4, 
    borderRadius: BORDER_RADIUS.sm,
    zIndex: 10,
  },
  rankText: { 
    fontSize: 12, 
    fontWeight: TYPOGRAPHY.weights.bold, 
    color: '#FFF' 
  },
  imageContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: BORDER_RADIUS.md, 
    overflow: 'hidden',
    backgroundColor: COLORS.bg.tertiary,
    marginRight: SPACING.md,
  },
  productImage: { width: '100%', height: '100%' },
  imagePlaceholder: { 
    width: '100%', 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeholderEmoji: { fontSize: 32 },
  productInfo: { flex: 1, justifyContent: 'space-between' },
  productName: { 
    fontSize: TYPOGRAPHY.sizes.base, 
    fontWeight: TYPOGRAPHY.weights.semibold, 
    color: COLORS.text.primary, 
    marginBottom: SPACING.xs,
  },
  priceRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  price: { 
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
