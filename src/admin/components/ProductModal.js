import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/theme';

const DEFAULT_CATEGORIES = ['Singani', 'Cerveza', 'Ron', 'Vodka', 'Whisky', 'Vino', 'Tequila', 'Licores', 'Snacks', 'Otros'];

const ProductModal = ({ visible, product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Singani',
    costo: '',
    precio: '',
    descripcion: '',
    imagen: '',
    stock: '',
    stockMinimo: '',
    disponible: true,
    descuento: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('url');

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.name || '',
        categoria: product.category || 'Singani',
        costo: product.cost?.toString() || '',
        precio: product.price?.toString() || '',
        descripcion: product.description || '',
        imagen: product.images?.[0] || '',
        stock: product.stock?.toString() || '',
        stockMinimo: product.minStock?.toString() || '',
        disponible: product.disponible !== false,
        descuento: product.discount?.toString() || ''
      });
    } else {
      setFormData({
        nombre: '',
        categoria: 'Singani',
        costo: '',
        precio: '',
        descripcion: '',
        imagen: '',
        stock: '',
        stockMinimo: '',
        disponible: true,
        descuento: ''
      });
    }
    setErrors({});
    setShowCategoryInput(false);
    setNewCategory('');
    setShowCategoryDropdown(false);
    setImageInputMode('url');
  }, [product, visible]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim() || formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.categoria) {
      newErrors.categoria = 'Selecciona una categoría';
    }
    
    const costo = parseFloat(formData.costo);
    if (!formData.costo || isNaN(costo) || costo <= 0) {
      newErrors.costo = 'El costo debe ser mayor a 0';
    }
    
    const precio = parseFloat(formData.precio);
    if (!formData.precio || isNaN(precio) || precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }
    
    if (!isNaN(costo) && !isNaN(precio) && precio < costo) {
      newErrors.precio = 'El precio no puede ser menor al costo';
    }
    
    const stock = parseInt(formData.stock);
    if (formData.stock === '' || isNaN(stock) || stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }
    
    const stockMinimo = parseInt(formData.stockMinimo);
    if (formData.stockMinimo && (isNaN(stockMinimo) || stockMinimo < 0)) {
      newErrors.stockMinimo = 'El stock mínimo no puede ser negativo';
    }
    
    if (!isNaN(stock) && !isNaN(stockMinimo) && stockMinimo > stock) {
      newErrors.stockMinimo = 'El stock mínimo no puede ser mayor al stock actual';
    }
    
    if (formData.descuento) {
      const descuento = parseFloat(formData.descuento);
      if (isNaN(descuento) || descuento < 0 || descuento > 100) {
        newErrors.descuento = 'El descuento debe estar entre 0 y 100';
      }
    }
    
    if (formData.imagen && !formData.imagen.match(/^https?:\/\/.+/) && !formData.imagen.startsWith('data:image') && !formData.imagen.startsWith('file://')) {
      newErrors.imagen = 'La URL debe comenzar con http:// o https://';
    }
    
    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert('Errores de validación', 'Por favor corrige los errores antes de continuar');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const productData = {
        name: formData.nombre.trim(),
        category: formData.categoria,
        cost: parseFloat(formData.costo),
        price: parseFloat(formData.precio),
        description: formData.descripcion.trim(),
        images: formData.imagen ? [formData.imagen] : [],
        stock: parseInt(formData.stock),
        minStock: formData.stockMinimo ? parseInt(formData.stockMinimo) : 0,
        disponible: formData.disponible,
        discount: formData.descuento ? parseFloat(formData.descuento) : 0
      };
      
      await onSave(productData);
      handleClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      categoria: 'Singani',
      costo: '',
      precio: '',
      descripcion: '',
      imagen: '',
      stock: '',
      stockMinimo: '',
      disponible: true,
      descuento: ''
    });
    setErrors({});
    setShowCategoryInput(false);
    setNewCategory('');
    setShowCategoryDropdown(false);
    setImageInputMode('url');
    onClose();
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      handleInputChange('categoria', newCategory.trim());
      setNewCategory('');
      setShowCategoryInput(false);
    }
  };

  const handlePickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            if (file.size > 5 * 1024 * 1024) {
              Alert.alert('Error', 'La imagen no puede superar 5MB');
              return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
              handleInputChange('imagen', event.target.result);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos');
          return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        
        if (!result.canceled) {
          handleInputChange('imagen', result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo cargar la imagen');
    }
  };

  const calculateProfit = () => {
    const costo = parseFloat(formData.costo);
    const precio = parseFloat(formData.precio);
    if (!isNaN(costo) && !isNaN(precio) && costo > 0) {
      const profit = ((precio - costo) / costo) * 100;
      return profit.toFixed(1);
    }
    return '0';
  };

  const getProfitColor = () => {
    const profit = parseFloat(calculateProfit());
    if (profit < 10) return COLORS.error;
    if (profit < 20) return COLORS.warning;
    return COLORS.success;
  };

  const isLowStock = () => {
    const stock = parseInt(formData.stock);
    const minStock = parseInt(formData.stockMinimo);
    return !isNaN(stock) && !isNaN(minStock) && stock <= minStock && stock > 0;
  };

  const isOutOfStock = () => {
    const stock = parseInt(formData.stock);
    return !isNaN(stock) && stock === 0;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{product ? 'Editar Producto' : 'Crear Producto'}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nombre del producto *</Text>
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              value={formData.nombre}
              onChangeText={(text) => handleInputChange('nombre', text)}
              placeholder="Ej: Singani Rujero 750ml"
              placeholderTextColor={COLORS.textTertiary}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
            
            <Text style={styles.label}>Categoría *</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={styles.dropdownButtonText}>{formData.categoria}</Text>
              <Ionicons 
                name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </TouchableOpacity>
            
            {showCategoryDropdown && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.dropdownItem,
                        formData.categoria === cat && styles.dropdownItemActive
                      ]}
                      onPress={() => {
                        handleInputChange('categoria', cat);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        formData.categoria === cat && styles.dropdownItemTextActive
                      ]}>
                        {cat}
                      </Text>
                      {formData.categoria === cat && (
                        <Ionicons name="checkmark" size={20} color={COLORS.accentGold} />
                      )}
                    </TouchableOpacity>
                  ))}
                  <View style={styles.dropdownDivider} />
                  <TouchableOpacity
                    style={styles.dropdownAddNew}
                    onPress={() => {
                      setShowCategoryDropdown(false);
                      setShowCategoryInput(true);
                    }}
                  >
                    <Ionicons name="add-circle" size={20} color={COLORS.accentGold} />
                    <Text style={styles.dropdownAddNewText}>Agregar nueva categoría</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
            
            {showCategoryInput && (
              <View style={styles.newCategoryRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newCategory}
                  onChangeText={setNewCategory}
                  placeholder="Nombre de nueva categoría"
                  placeholderTextColor={COLORS.textTertiary}
                />
                <TouchableOpacity style={styles.addCategoryConfirmBtn} onPress={handleAddCategory}>
                  <Ionicons name="checkmark" size={20} color={COLORS.bgPrimary} />
                </TouchableOpacity>
              </View>
            )}
            {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
            
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Costo (Bs) *</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.currency}>Bs</Text>
                  <TextInput
                    style={[styles.input, styles.inputNoBorder, errors.costo && styles.inputError]}
                    value={formData.costo}
                    onChangeText={(text) => handleInputChange('costo', text)}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
                {errors.costo && <Text style={styles.errorText}>{errors.costo}</Text>}
              </View>
              
              <View style={styles.half}>
                <Text style={styles.label}>Descuento (%)</Text>
                <View style={styles.priceInput}>
                  <TextInput
                    style={[styles.input, styles.inputNoBorder]}
                    value={formData.descuento}
                    onChangeText={(text) => handleInputChange('descuento', text)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                  <Text style={styles.currency}>%</Text>
                </View>
                {errors.descuento && <Text style={styles.errorText}>{errors.descuento}</Text>}
              </View>
            </View>
            
            <Text style={styles.label}>Precio de Venta (Bs) *</Text>
            <View style={styles.priceInput}>
              <Text style={styles.currency}>Bs</Text>
              <TextInput
                style={[styles.input, styles.inputNoBorder, errors.precio && styles.inputError]}
                value={formData.precio}
                onChangeText={(text) => handleInputChange('precio', text)}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            {errors.precio && <Text style={styles.errorText}>{errors.precio}</Text>}
            {formData.costo && formData.precio && !errors.precio && !errors.costo && (
              <View style={styles.profitBadge}>
                <Ionicons name="trending-up" size={16} color={getProfitColor()} />
                <Text style={[styles.profitText, { color: getProfitColor() }]}>
                  {calculateProfit()}% profit
                </Text>
              </View>
            )}
            
            <Text style={styles.label}>Stock Actual *</Text>
            <View style={styles.stockControl}>
              <TouchableOpacity
                style={styles.stockBtn}
                onPress={() => {
                  const current = parseInt(formData.stock) || 0;
                  if (current > 0) handleInputChange('stock', (current - 1).toString());
                }}
              >
                <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TextInput
                style={[styles.stockInput, errors.stock && styles.inputError]}
                value={formData.stock}
                onChangeText={(text) => handleInputChange('stock', text)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textTertiary}
              />
              <TouchableOpacity
                style={styles.stockBtn}
                onPress={() => {
                  const current = parseInt(formData.stock) || 0;
                  handleInputChange('stock', (current + 1).toString());
                }}
              >
                <Ionicons name="add" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
            {isOutOfStock() && (
              <View style={styles.alertBadge}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={[styles.alertText, { color: COLORS.error }]}>⚠️ Producto agotado</Text>
              </View>
            )}
            {isLowStock() && (
              <View style={[styles.alertBadge, { backgroundColor: COLORS.warning + '20' }]}>
                <Ionicons name="warning" size={16} color={COLORS.warning} />
                <Text style={[styles.alertText, { color: COLORS.warning }]}>⚠️ Stock bajo - Reabastecer pronto</Text>
              </View>
            )}
            
            <Text style={styles.label}>Stock Mínimo (Alerta)</Text>
            <View style={styles.stockControl}>
              <TouchableOpacity
                style={styles.stockBtn}
                onPress={() => {
                  const current = parseInt(formData.stockMinimo) || 0;
                  if (current > 0) handleInputChange('stockMinimo', (current - 1).toString());
                }}
              >
                <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TextInput
                style={[styles.stockInput, errors.stockMinimo && styles.inputError]}
                value={formData.stockMinimo}
                onChangeText={(text) => handleInputChange('stockMinimo', text)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textTertiary}
              />
              <TouchableOpacity
                style={styles.stockBtn}
                onPress={() => {
                  const current = parseInt(formData.stockMinimo) || 0;
                  handleInputChange('stockMinimo', (current + 1).toString());
                }}
              >
                <Ionicons name="add" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>💡 Se mostrará alerta cuando el stock llegue a este nivel</Text>
            {errors.stockMinimo && <Text style={styles.errorText}>{errors.stockMinimo}</Text>}
            
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descripcion}
              onChangeText={(text) => {
                if (text.length <= 200) handleInputChange('descripcion', text);
              }}
              placeholder="Describe el producto..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{formData.descripcion.length}/200</Text>
            
            <Text style={styles.label}>Imagen del producto</Text>
            <View style={styles.imageModeTabs}>
              <TouchableOpacity
                style={[styles.imageModeTab, imageInputMode === 'url' && styles.imageModeTabActive]}
                onPress={() => setImageInputMode('url')}
              >
                <Ionicons name="link" size={18} color={imageInputMode === 'url' ? COLORS.accentGold : COLORS.textSecondary} />
                <Text style={[styles.imageModeTabText, imageInputMode === 'url' && styles.imageModeTabTextActive]}>URL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.imageModeTab, imageInputMode === 'upload' && styles.imageModeTabActive]}
                onPress={() => setImageInputMode('upload')}
              >
                <Ionicons name="cloud-upload" size={18} color={imageInputMode === 'upload' ? COLORS.accentGold : COLORS.textSecondary} />
                <Text style={[styles.imageModeTabText, imageInputMode === 'upload' && styles.imageModeTabTextActive]}>Subir</Text>
              </TouchableOpacity>
            </View>
            
            {imageInputMode === 'url' ? (
              <>
                <TextInput
                  style={[styles.input, errors.imagen && styles.inputError]}
                  value={formData.imagen}
                  onChangeText={(text) => handleInputChange('imagen', text)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  placeholderTextColor={COLORS.textTertiary}
                />
                {errors.imagen && <Text style={styles.errorText}>{errors.imagen}</Text>}
              </>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                <Ionicons name="cloud-upload-outline" size={32} color={COLORS.accentGold} />
                <Text style={styles.uploadButtonText}>Seleccionar imagen</Text>
                <Text style={styles.uploadButtonHint}>JPG, PNG (máx 5MB)</Text>
              </TouchableOpacity>
            )}
            
            {formData.imagen && (
              <View style={styles.imagePreview}>
                <Text style={styles.imagePreviewLabel}>Vista previa:</Text>
                <Text style={styles.imagePreviewUrl} numberOfLines={1}>{formData.imagen}</Text>
              </View>
            )}
            
            <View style={styles.switchRow}>
              <Text style={styles.label}>Disponible para venta</Text>
              <Switch
                value={formData.disponible}
                onValueChange={(value) => handleInputChange('disponible', value)}
                trackColor={{ false: COLORS.bgTertiary, true: COLORS.accentGold + '60' }}
                thumbColor={formData.disponible ? COLORS.accentGold : COLORS.textTertiary}
              />
            </View>
            
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Text style={styles.saveBtnText}>Guardando...</Text>
                ) : (
                  <Text style={styles.saveBtnText}>{product ? 'Actualizar' : 'Guardar'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { backgroundColor: COLORS.bgSecondary, borderRadius: 20, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: COLORS.bgTertiary, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.bgTertiary },
  inputError: { borderColor: COLORS.error },
  inputNoBorder: { borderWidth: 0, flex: 1 },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },
  helperText: { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.bgTertiary, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.bgTertiary },
  dropdownButtonText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  dropdownMenu: { backgroundColor: COLORS.bgTertiary, borderRadius: 12, marginTop: 8, maxHeight: 250, borderWidth: 1, borderColor: COLORS.accentGold + '40' },
  dropdownScroll: { maxHeight: 250 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.bgSecondary },
  dropdownItemActive: { backgroundColor: COLORS.accentGold + '10' },
  dropdownItemText: { fontSize: 14, color: COLORS.textSecondary },
  dropdownItemTextActive: { color: COLORS.accentGold, fontWeight: '600' },
  dropdownDivider: { height: 1, backgroundColor: COLORS.bgSecondary, marginVertical: 4 },
  dropdownAddNew: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  dropdownAddNewText: { fontSize: 14, color: COLORS.accentGold, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 16 },
  half: { flex: 1 },
  priceInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgTertiary, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.bgTertiary },
  currency: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginRight: 8 },
  stockControl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stockBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.bgTertiary, justifyContent: 'center', alignItems: 'center' },
  stockInput: { flex: 1, backgroundColor: COLORS.bgTertiary, borderRadius: 12, padding: 12, fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center', borderWidth: 1, borderColor: COLORS.bgTertiary },
  textArea: { height: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'right', marginTop: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  footer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.bgTertiary, alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.accentGold, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.bgPrimary },
  newCategoryRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  addCategoryConfirmBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.accentGold, justifyContent: 'center', alignItems: 'center' },
  profitBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.bgTertiary, borderRadius: 8, alignSelf: 'flex-start' },
  profitText: { fontSize: 14, fontWeight: '700' },
  alertBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.error + '20', borderRadius: 8 },
  alertText: { fontSize: 13, fontWeight: '600' },
  imageModeTabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  imageModeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.bgTertiary, borderWidth: 2, borderColor: 'transparent' },
  imageModeTabActive: { backgroundColor: COLORS.accentGold + '20', borderColor: COLORS.accentGold },
  imageModeTabText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  imageModeTabTextActive: { color: COLORS.accentGold },
  uploadButton: { backgroundColor: COLORS.bgTertiary, borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.accentGold + '40' },
  uploadButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginTop: 8 },
  uploadButtonHint: { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },
  imagePreview: { backgroundColor: COLORS.bgTertiary, borderRadius: 8, padding: 12, marginTop: 8 },
  imagePreviewLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  imagePreviewUrl: { fontSize: 12, color: COLORS.textTertiary }
});

export default ProductModal;
