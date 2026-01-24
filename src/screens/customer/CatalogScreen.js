import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TextInput,
  TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator,
  Alert, RefreshControl, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import StoreHeader from '../../components/catalog/StoreHeader';
import CategoryChip from '../../components/catalog/CategoryChip';
import ProductListItem from '../../components/catalog/ProductListItem';
import FloatingCartBar from '../../components/catalog/FloatingCartBar';
import firebaseProductService from '../../services/firebaseProductService';
import CartModal from '../../components/cart/CartModal';
import { addToCart as addToCartUtil, getCart, getCartTotal } from '../../utils/cartManager';

const CATEGORIES = [
  { id: 'all', icon: 'apps', label: 'Todo' },
  { id: 'cerveza', icon: 'beer', label: 'Cervezas' },
  { id: 'vino', icon: 'wine', label: 'Vinos' },
  { id: 'whisky', icon: 'flask', label: 'Whisky' },
  { id: 'snacks', icon: 'fast-food', label: 'Snacks' },
  { id: 'ron', icon: 'wine', label: 'Ron' },
  { id: 'vodka', icon: 'wine', label: 'Vodka' },
];

export default function CatalogScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    console.log('🔥 Iniciando listener de Firebase...');
    
    const unsubscribe = firebaseProductService.subscribeToProducts((updatedProducts) => {
      console.log('📦 Productos recibidos:', updatedProducts.length);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setIsLoading(false);
    });

    loadCartData();
    
    return () => {
      console.log('🔌 Desconectando listener de Firebase');
      unsubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCartData();
    }, [])
  );

  const loadCartData = async () => {
    const items = await getCart();
    const total = await getCartTotal();
    setCartItems(items);
    setCartTotal(total);
  };

  const loadInitialData = async () => {
    // Ya no es necesario, Firebase maneja todo
  };

  const loadProducts = async () => {
    // Ya no es necesario, Firebase maneja todo
  };
  
  const loadProductsFromStorage = async () => {
    // Ya no es necesario, Firebase maneja todo
  };

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart_items');
      if (cartData) {
        setCartItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const filterByCategory = useCallback((category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    
    if (category === 'all') {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(p => 
      (p.categoria || p.category || '').toLowerCase() === category.toLowerCase()
    );
    
    setFilteredProducts(filtered);
  }, [products]);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      filterByCategory(selectedCategory);
      return;
    }
    
    const query = text.toLowerCase();
    const filtered = products.filter(p =>
      (p.nombre || p.name || '').toLowerCase().includes(query) ||
      (p.descripcion || p.description || '').toLowerCase().includes(query) ||
      (p.categoria || p.category || '').toLowerCase().includes(query)
    );
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, filterByCategory]);

  const handleAddToCart = async (product) => {
    try {
      const stock = product.stock || 0;
      
      if (stock === 0) {
        Alert.alert('Producto agotado', 'Este producto no está disponible');
        return;
      }
      
      if (product.disponible === false) {
        Alert.alert('No disponible', 'Este producto no está disponible por el momento');
        return;
      }
      
      await addToCartUtil(product, 1);
      await loadCartData();
      Alert.alert('✅ Agregado', `${product.name} agregado al carrito`);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Mostrar el mensaje de error específico
      Alert.alert('Stock insuficiente', error.message || 'No se pudo agregar al carrito');
    }
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find(i => i.id === productId);
    return item ? item.quantity || 0 : 0;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCartData();
    setRefreshing(false);
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFB800" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Store Header */}
      <StoreHeader onBackPress={() => navigation.goBack()} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(cat => (
          <CategoryChip
            key={cat.id}
            icon={cat.icon}
            label={cat.label}
            active={selectedCategory === cat.id}
            onPress={() => filterByCategory(cat.id)}
          />
        ))}
      </ScrollView>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>BESTSELLER</Text>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductListItem
            product={item}
            onAddToCart={handleAddToCart}
            cartQuantity={getCartQuantity(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>No se encontraron productos</Text>
            <TouchableOpacity onPress={() => filterByCategory('all')}>
              <Text style={styles.clearSearch}>Ver todos</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFB800"
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Floating Cart Bar */}
      <FloatingCartBar
        cartItems={cartItems}
        onPress={() => navigation.navigate('CartTab')}
      />

      {/* Botón Flotante del Carrito */}
      {cartItems.length > 0 && (
        <TouchableOpacity
          style={styles.floatingCartButton}
          onPress={() => setCartModalVisible(true)}
          activeOpacity={0.9}
        >
          <View style={styles.cartButtonContent}>
            <View style={styles.cartButtonLeft}>
              <View style={styles.itemCountBadge}>
                <Text style={styles.itemCountText}>{cartItemCount}</Text>
              </View>
              <Text style={styles.cartButtonText}>
                {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}
              </Text>
            </View>

            <View style={styles.cartButtonDivider} />

            <View style={styles.cartButtonRight}>
              <Text style={styles.cartTotalText}>
                Bs. {cartTotal.toFixed(2)}
              </Text>
              <Ionicons name="chevron-up" size={20} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Modal del Carrito */}
      <CartModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
        cartItems={cartItems}
        onUpdateCart={loadCartData}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  categoriesScroll: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 24,
  },
  clearSearch: {
    fontSize: 16,
    color: '#FFB800',
    fontWeight: '600',
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemCountBadge: {
    backgroundColor: '#FFB800',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A0A0A',
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cartButtonDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cartButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartTotalText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFB800',
  },
});
