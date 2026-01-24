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

  useEffect(() => {
    console.log('🔥 Iniciando listener de Firebase...');
    
    const unsubscribe = firebaseProductService.subscribeToProducts((updatedProducts) => {
      console.log('📦 Productos recibidos:', updatedProducts.length);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setIsLoading(false);
    });

    loadCart();
    
    return () => {
      console.log('🔌 Desconectando listener de Firebase');
      unsubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

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
      if ((product.stock || 0) === 0) {
        Alert.alert('Producto agotado', 'Este producto no está disponible');
        return;
      }
      
      const cartData = await AsyncStorage.getItem('cart_items');
      let cart = cartData ? JSON.parse(cartData) : [];
      
      const existingIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      
      await AsyncStorage.setItem('cart_items', JSON.stringify(cart));
      setCartItems(cart);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'No se pudo agregar al carrito');
    }
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find(i => i.id === productId);
    return item ? item.quantity || 0 : 0;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  };

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
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
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
});
