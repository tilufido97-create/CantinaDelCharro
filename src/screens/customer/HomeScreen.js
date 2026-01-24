import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CATEGORIES } from '../../constants/mockData';
import { addToCart, getCartCount } from '../../utils/cartManager';
import Button from '../../components/common/Button';
import firebaseProductService from '../../services/firebaseProductService';

export default function HomeScreen({ navigation }) {
  const [cartCount, setCartCount] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    loadCartCount();
    
    const unsubscribe = firebaseProductService.subscribeToProducts((products) => {
      const featured = products.slice(0, 6);
      setFeaturedProducts(featured);
    });

    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCartCount();
    }, [])
  );

  const loadFeaturedProducts = async () => {
    // Ya no es necesario, Firebase maneja todo
  };

  const loadCartCount = async () => {
    const count = await getCartCount();
    setCartCount(count);
  };

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
    await loadCartCount();
    Alert.alert('¡Agregado!', `${product.name} agregado al carrito`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola, amigo!</Text>
            <Text style={styles.location}>📍 La Paz, Bolivia</Text>
          </View>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🍺</Text>
          <Text style={styles.bannerTitle}>Happy Hour</Text>
          <Text style={styles.bannerSubtitle}>2x1 en cervezas seleccionadas</Text>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <View style={styles.quickAccess}>
            <TouchableOpacity style={styles.quickCard}>
              <Text style={styles.quickIcon}>🍸</Text>
              <Text style={styles.quickText}>Bar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickCard}>
              <Text style={styles.quickIcon}>🚚</Text>
              <Text style={styles.quickText}>Express</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickCard}>
              <Text style={styles.quickIcon}>🎉</Text>
              <Text style={styles.quickText}>Happy Hour</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* El Charro Recomienda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>El Charro Recomienda</Text>
          <TouchableOpacity style={styles.charroCard}>
            <Text style={styles.charroEmoji}>🤠</Text>
            <Text style={styles.charroText}>
              Basado en tu última compra...{'\n'}
              <Text style={styles.charroRecipe}>Chuflay Clásico</Text>
            </Text>
            <Button title="Ver receta →" variant="outline" onPress={() => {}} />
          </TouchableOpacity>
        </View>

        {/* Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat.id} style={styles.categoryChip}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Productos Destacados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos Destacados</Text>
          <View style={styles.productsGrid}>
            {featuredProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <Text style={styles.productEmoji}>{product.image}</Text>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productPrice}>Bs. {product.price.toFixed(2)}</Text>
                {product.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{product.discount}%</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddToCart(product)}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  greeting: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  location: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary, marginTop: SPACING.xs },
  cartButton: { position: 'relative' },
  cartIcon: { fontSize: 28 },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: COLORS.accent.gold, borderRadius: BORDER_RADIUS.full, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: '#000' },
  banner: { backgroundColor: COLORS.accent.gold, marginHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginVertical: SPACING.md },
  bannerEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  bannerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: '#000' },
  bannerSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, color: '#000', marginTop: SPACING.xs },
  section: { marginTop: SPACING.xl, paddingHorizontal: SPACING.xl },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.md },
  quickAccess: { flexDirection: 'row', gap: SPACING.md },
  quickCard: { flex: 1, backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.md, padding: SPACING.lg, alignItems: 'center' },
  quickIcon: { fontSize: 32, marginBottom: SPACING.sm },
  quickText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  charroCard: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  charroEmoji: { fontSize: 60, marginBottom: SPACING.md },
  charroText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, textAlign: 'center', marginBottom: SPACING.md },
  charroRecipe: { color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.bold },
  categoryChip: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginRight: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  categoryIcon: { fontSize: 20 },
  categoryName: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.primary },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  productCard: { width: '47%', backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, position: 'relative' },
  productEmoji: { fontSize: 50, textAlign: 'center', marginBottom: SPACING.sm },
  productName: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.primary, marginBottom: SPACING.xs, height: 32 },
  productPrice: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold },
  discountBadge: { position: 'absolute', top: SPACING.sm, right: SPACING.sm, backgroundColor: COLORS.error, borderRadius: BORDER_RADIUS.sm, paddingHorizontal: SPACING.xs, paddingVertical: 2 },
  discountText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold, color: '#FFF' },
  addButton: { position: 'absolute', bottom: SPACING.sm, right: SPACING.sm, backgroundColor: COLORS.accent.gold, width: 32, height: 32, borderRadius: BORDER_RADIUS.full, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { fontSize: 20, fontWeight: TYPOGRAPHY.weights.bold, color: '#000' },
});
