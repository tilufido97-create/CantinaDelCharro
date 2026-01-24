import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert, ActivityIndicator, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import ProductModal from '../components/ProductModal';
import TooltipButton from '../components/TooltipButton';
import TooltipIcon from '../components/TooltipIcon';
import { getCurrentAdmin } from '../utils/adminAuth';
import firebaseProductService from '../../services/firebaseProductService';

const CATEGORIES = [
  { id: 'all', name: 'Todas las categorías' },
  { id: 'Singani', name: 'Singani' },
  { id: 'Cerveza', name: 'Cerveza' },
  { id: 'Ron', name: 'Ron' },
  { id: 'Whisky', name: 'Whisky' },
  { id: 'Vodka', name: 'Vodka' },
  { id: 'Vino', name: 'Vino' },
  { id: 'Licores', name: 'Licores' },
  { id: 'Snacks', name: 'Snacks' }
];

const ProductsManagementScreen = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const itemsPerPage = 10;

  const loadProducts = async () => {
    try {
      setLoading(true);
      const unsubscribe = firebaseProductService.subscribeToProducts((prods) => {
        setProducts(prods);
        setFilteredProducts(prods);
        setLoading(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
    
    let unsubscribe;
    loadProducts().then(unsub => {
      unsubscribe = unsub;
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = [...products];
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
        );
      }
      
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
      
      if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'price') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'stock') {
        filtered.sort((a, b) => a.stock - b.stock);
      }
      
      setFilteredProducts(filtered);
      setCurrentPage(1);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy, products]);

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        const result = await firebaseProductService.updateProduct(editingProduct.id, productData);
        if (result.success) {
          Alert.alert('Éxito', 'Producto actualizado. Los cambios se sincronizarán instantáneamente.');
        } else {
          Alert.alert('Error', result.error);
        }
      } else {
        const result = await firebaseProductService.addProduct(productData);
        if (result.success) {
          Alert.alert('Éxito', 'Producto creado. Se sincronizará instantáneamente con la app móvil.');
        } else {
          Alert.alert('Error', result.error);
        }
      }
      
      setShowModal(false);
      
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  const handleDelete = (product) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Estás seguro de eliminar "${product.name}"? Esta acción se sincronizará instantáneamente con la app móvil.`)) {
        deleteProductFromFirebase(product.id);
      }
    } else {
      Alert.alert(
        '⚠️ Eliminar Producto',
        `¿Estás seguro de eliminar "${product.name}"? Esta acción se sincronizará instantáneamente con la app móvil.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sí, eliminar',
            style: 'destructive',
            onPress: () => deleteProductFromFirebase(product.id)
          }
        ]
      );
    }
  };

  const deleteProductFromFirebase = async (productId) => {
    try {
      console.log('🗑️ Eliminando producto:', productId);
      const result = await firebaseProductService.deleteProduct(productId);
      
      if (result.success) {
        console.log('✅ Producto eliminado correctamente');
        if (Platform.OS === 'web') {
          window.alert('Producto eliminado exitosamente');
        } else {
          Alert.alert('Éxito', 'Producto eliminado. Los cambios se sincronizaron instantáneamente.');
        }
      } else {
        console.error('❌ Error:', result.error);
        if (Platform.OS === 'web') {
          window.alert('Error: ' + result.error);
        } else {
          Alert.alert('Error', result.error);
        }
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      if (Platform.OS === 'web') {
        window.alert('Error al eliminar el producto');
      } else {
        Alert.alert('Error', 'No se pudo eliminar el producto');
      }
    }
  };

  const handleToggleAvailability = async (productId) => {
    try {
      const updatedProducts = products.map(p =>
        p.id === productId ? { ...p, disponible: !p.disponible } : p
      );
      await AsyncStorage.setItem('all_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la disponibilidad');
    }
  };

  const ProductRow = ({ product }) => {
    const hasLowStock = product.stock < 10;
    const isOutOfStock = product.stock === 0;
    const isAvailable = product.disponible !== false;
    
    return (
      <View style={styles.productRow}>
        <Image
          source={{ uri: product.images?.[0] || 'https://via.placeholder.com/60' }}
          style={styles.productImage}
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          {!isAvailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>No disponible</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.productCategory}>{product.category}</Text>
        
        <View style={styles.stockContainer}>
          <Text style={[
            styles.stockText,
            isOutOfStock && styles.stockOutText,
            hasLowStock && !isOutOfStock && styles.stockLowText
          ]}>
            {product.stock}
          </Text>
          {hasLowStock && !isOutOfStock && (
            <Ionicons name="warning" size={16} color={COLORS.warning} />
          )}
          {isOutOfStock && (
            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          )}
        </View>
        
        <View style={styles.priceContainer}>
          {product.discount > 0 ? (
            <>
              <Text style={styles.priceOld}>Bs {product.price.toFixed(2)}</Text>
              <Text style={styles.price}>
                Bs {(product.price * (1 - product.discount / 100)).toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={styles.price}>Bs {product.price.toFixed(2)}</Text>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          <TooltipButton
            icon={isAvailable ? "checkmark-circle" : "close-circle"}
            tooltip="Activar/desactivar disponibilidad del producto en la tienda"
            onPress={() => handleToggleAvailability(product.id)}
            variant="secondary"
            size="small"
            iconOnly
          />
          <TooltipButton
            icon="pencil"
            tooltip="Editar información de este producto"
            onPress={() => handleEdit(product)}
            variant="secondary"
            size="small"
            iconOnly
          />
          <TooltipButton
            icon="trash"
            tooltip="Eliminar este producto del catálogo"
            onPress={() => handleDelete(product)}
            variant="danger"
            size="small"
            iconOnly
          />
        </View>
      </View>
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const Pagination = () => (
    <View style={styles.pagination}>
      <TouchableOpacity
        style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
        disabled={currentPage === 1}
        onPress={() => setCurrentPage(prev => prev - 1)}
      >
        <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>
      
      <Text style={styles.pageInfo}>
        Página {currentPage} de {totalPages}
      </Text>
      
      <TouchableOpacity
        style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
        disabled={currentPage === totalPages}
        onPress={() => setCurrentPage(prev => prev + 1)}
      >
        <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  if (!user) return null;

  return (
    <AdminLayout title="Productos" user={user}>
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre, categoría..."
            placeholderTextColor={COLORS.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TooltipButton
              icon="close-circle"
              tooltip="Limpiar búsqueda"
              onPress={() => setSearchQuery('')}
              variant="secondary"
              size="small"
              iconOnly
            />
          )}
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <TooltipButton
              key={cat.id}
              label={cat.name}
              tooltip={`Filtrar productos de categoría ${cat.name}`}
              onPress={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? 'primary' : 'secondary'}
              size="medium"
            />
          ))}
        </ScrollView>
        
        <View style={styles.sortContainer}>
          <Ionicons name="swap-vertical" size={16} color={COLORS.textTertiary} />
          <TouchableOpacity onPress={() => setSortBy('name')}>
            <Text style={[styles.sortText, sortBy === 'name' && styles.sortTextActive]}>Nombre</Text>
          </TouchableOpacity>
          <Text style={styles.sortDivider}>|</Text>
          <TouchableOpacity onPress={() => setSortBy('price')}>
            <Text style={[styles.sortText, sortBy === 'price' && styles.sortTextActive]}>Precio</Text>
          </TouchableOpacity>
          <Text style={styles.sortDivider}>|</Text>
          <TouchableOpacity onPress={() => setSortBy('stock')}>
            <Text style={[styles.sortText, sortBy === 'stock' && styles.sortTextActive]}>Stock</Text>
          </TouchableOpacity>
          <TooltipIcon tooltip="Ordenar productos por nombre, precio o stock" size={16} />
        </View>
        
        <TooltipButton
          icon="add"
          label="Nuevo"
          tooltip="Crear un nuevo producto en el catálogo"
          onPress={handleCreate}
          variant="primary"
          size="large"
        />
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accentGold} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: 80 }]}>Imagen</Text>
              <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.headerCell}>Nombre</Text>
              </View>
              <Text style={[styles.headerCell, { width: 100 }]}>Categoría</Text>
              <View style={{ width: 80, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.headerCell}>Stock</Text>
                <TooltipIcon tooltip="Cantidad de unidades disponibles para venta" size={14} color={COLORS.textTertiary} />
              </View>
              <Text style={[styles.headerCell, { width: 100 }]}>Precio</Text>
              <Text style={[styles.headerCell, { width: 140 }]}>Acciones</Text>
            </View>
            
            {currentProducts.map(product => (
              <ProductRow key={product.id} product={product} />
            ))}
            
            {currentProducts.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={64} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>No se encontraron productos</Text>
                {(searchQuery || selectedCategory !== 'all') && (
                  <TouchableOpacity 
                    style={styles.clearFiltersBtn}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    <Text style={styles.clearFiltersBtnText}>Limpiar filtros</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          
          {filteredProducts.length > itemsPerPage && <Pagination />}
        </>
      )}
      
      <ProductModal
        visible={showModal}
        product={editingProduct}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', gap: 16, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgSecondary, borderRadius: 12, paddingHorizontal: 16, height: 48, flex: 1, minWidth: 250, borderWidth: 1, borderColor: COLORS.bgTertiary },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, color: COLORS.textPrimary },
  categoryScroll: { maxWidth: 400 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: COLORS.bgSecondary, marginRight: 8, borderWidth: 1, borderColor: COLORS.bgTertiary },
  categoryChipActive: { backgroundColor: COLORS.accentGold + '20', borderColor: COLORS.accentGold },
  categoryChipText: { fontSize: 14, color: COLORS.textSecondary },
  categoryChipTextActive: { color: COLORS.accentGold, fontWeight: '600' },
  sortContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.bgSecondary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.bgTertiary },
  sortText: { fontSize: 13, color: COLORS.textSecondary },
  sortTextActive: { color: COLORS.accentGold, fontWeight: '600' },
  sortDivider: { fontSize: 13, color: COLORS.textTertiary },
  newButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accentGold, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },
  newButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.bgPrimary },
  table: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  tableHeader: { flexDirection: 'row', paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: COLORS.bgTertiary },
  headerCell: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.bgTertiary },
  productImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: COLORS.bgTertiary },
  productInfo: { flex: 2, paddingLeft: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  discountBadge: { backgroundColor: COLORS.error + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  discountText: { fontSize: 11, fontWeight: '600', color: COLORS.error },
  unavailableBadge: { backgroundColor: COLORS.textTertiary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  unavailableText: { fontSize: 11, fontWeight: '600', color: COLORS.textTertiary },
  productCategory: { width: 100, fontSize: 13, color: COLORS.textSecondary },
  stockContainer: { width: 80, flexDirection: 'row', alignItems: 'center', gap: 4 },
  stockText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  stockLowText: { color: COLORS.warning },
  stockOutText: { color: COLORS.error },
  priceContainer: { width: 100 },
  price: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  priceOld: { fontSize: 12, color: COLORS.textTertiary, textDecorationLine: 'line-through' },
  actionsContainer: { width: 140, flexDirection: 'row', gap: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.bgTertiary, justifyContent: 'center', alignItems: 'center' },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textTertiary, marginTop: 16 },
  clearFiltersBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.accentGold, borderRadius: 8 },
  clearFiltersBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.bgPrimary },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 },
  pageButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: COLORS.bgSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgTertiary },
  pageButtonDisabled: { opacity: 0.3 },
  pageInfo: { fontSize: 14, color: COLORS.textPrimary }
});

export default ProductsManagementScreen;
