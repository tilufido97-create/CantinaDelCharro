import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert, Modal, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import { getCurrentAdmin } from '../utils/adminAuth';

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
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    category: 'Singani',
    price: '',
    discount: '0',
    stock: '',
    description: '',
    images: []
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await AsyncStorage.getItem('products');
      let prods = productsData ? JSON.parse(productsData) : [];
      
      if (prods.length === 0) {
        const { MOCK_PRODUCTS } = require('../../constants/mockData');
        prods = MOCK_PRODUCTS;
        await AsyncStorage.setItem('products', JSON.stringify(prods));
      }
      
      setProducts(prods);
      setFilteredProducts(prods);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, products]);

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Singani',
      price: '',
      discount: '0',
      stock: '',
      description: '',
      images: []
    });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      discount: product.discount?.toString() || '0',
      stock: product.stock.toString(),
      description: product.description || '',
      images: product.images || []
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        Alert.alert('Error', 'El nombre es requerido');
        return;
      }
      
      if (!formData.price || parseFloat(formData.price) <= 0) {
        Alert.alert('Error', 'El precio debe ser mayor a 0');
        return;
      }
      
      if (!formData.stock || parseInt(formData.stock) < 0) {
        Alert.alert('Error', 'El stock no puede ser negativo');
        return;
      }
      
      const productData = {
        id: editingProduct?.id || `prod-${Date.now()}`,
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        stock: parseInt(formData.stock),
        description: formData.description.trim(),
        images: formData.images,
        updatedAt: new Date().toISOString(),
        ...(editingProduct ? {} : { createdAt: new Date().toISOString() })
      };
      
      let updatedProducts;
      
      if (editingProduct) {
        updatedProducts = products.map(p =>
          p.id === editingProduct.id ? productData : p
        );
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        updatedProducts = [...products, productData];
        Alert.alert('Éxito', 'Producto creado correctamente');
      }
      
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      setShowModal(false);
      
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedProducts = products.filter(p => p.id !== product.id);
              await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
              setProducts(updatedProducts);
              Alert.alert('Éxito', 'Producto eliminado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          }
        }
      ]
    );
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        aspect: [1, 1]
      });
      
      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          images: [result.assets[0].uri, ...prev.images].slice(0, 5)
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const ProductRow = ({ product }) => {
    const hasLowStock = product.stock < 10;
    const isOutOfStock = product.stock === 0;
    
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
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(product)}
          >
            <Ionicons name="pencil" size={20} color={COLORS.info} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(product)}
          >
            <Ionicons name="trash" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ProductFormModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.fieldLabel}>Imágenes (máx 5)</Text>
            <ScrollView horizontal style={styles.imagesScroll} showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleImagePicker}
              >
                <Ionicons name="camera" size={32} color={COLORS.accentGold} />
                <Text style={styles.addImageText}>Agregar</Text>
              </TouchableOpacity>
              
              {formData.images.map((uri, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri }} style={styles.imagePreviewImg} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            <Text style={styles.fieldLabel}>Nombre del producto *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Ej: Singani Casa Real 750ml"
              placeholderTextColor={COLORS.textTertiary}
            />
            
            <Text style={styles.fieldLabel}>Categoría *</Text>
            <View style={styles.categoryButtons}>
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    formData.category === cat.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    formData.category === cat.id && styles.categoryButtonTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.fieldLabel}>Precio (Bs) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textTertiary}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.fieldLabel}>Descuento (%)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.discount}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, discount: text }))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textTertiary}
                />
              </View>
            </View>
            
            <Text style={styles.fieldLabel}>Stock *</Text>
            <TextInput
              style={styles.input}
              value={formData.stock}
              onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textTertiary}
            />
            
            <Text style={styles.fieldLabel}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Descripción del producto..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
            placeholder="Buscar productos..."
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity
          style={styles.newButton}
          onPress={handleCreate}
        >
          <Ionicons name="add" size={24} color={COLORS.bgPrimary} />
          <Text style={styles.newButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accentGold} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: 80 }]}>Imagen</Text>
              <Text style={[styles.headerCell, { flex: 2 }]}>Nombre</Text>
              <Text style={[styles.headerCell, { width: 100 }]}>Categoría</Text>
              <Text style={[styles.headerCell, { width: 80 }]}>Stock</Text>
              <Text style={[styles.headerCell, { width: 100 }]}>Precio</Text>
              <Text style={[styles.headerCell, { width: 120 }]}>Acciones</Text>
            </View>
            
            {currentProducts.map(product => (
              <ProductRow key={product.id} product={product} />
            ))}
            
            {currentProducts.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={64} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>No se encontraron productos</Text>
              </View>
            )}
          </View>
          
          {filteredProducts.length > itemsPerPage && <Pagination />}
        </>
      )}
      
      <ProductFormModal />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  categoryScroll: {
    maxWidth: 400,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.bgSecondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  categoryChipActive: {
    backgroundColor: COLORS.accentGold + '20',
    borderColor: COLORS.accentGold,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.accentGold,
    fontWeight: '600',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  newButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.bgPrimary,
  },
  table: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.bgTertiary,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgTertiary,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.bgTertiary,
  },
  productInfo: {
    flex: 2,
    paddingLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  discountBadge: {
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.error,
  },
  productCategory: {
    width: 100,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  stockContainer: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  stockLowText: {
    color: COLORS.warning,
  },
  stockOutText: {
    color: COLORS.error,
  },
  priceContainer: {
    width: 100,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  priceOld: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },
  actionsContainer: {
    width: 120,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.bgTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginTop: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageInfo: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagesScroll: {
    marginBottom: 8,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 2,
    borderColor: COLORS.accentGold,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.accentGold,
    marginTop: 4,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 12,
    position: 'relative',
  },
  imagePreviewImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.accentGold + '20',
    borderColor: COLORS.accentGold,
  },
  categoryButtonText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  categoryButtonTextActive: {
    color: COLORS.accentGold,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.bgSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.accentGold,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.bgPrimary,
  },
});

export default ProductsManagementScreen;
