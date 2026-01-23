import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const CATEGORIES = ['Singani', 'Cerveza', 'Ron', 'Vodka', 'Whisky', 'Vino', 'Tequila', 'Licores', 'Snacks', 'Otros'];

const ProductModal = ({ visible, product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Singani',
    precio: '',
    descripcion: '',
    imagen: '',
    stock: '',
    disponible: true,
    descuento: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.name || '',
        categoria: product.category || 'Singani',
        precio: product.price?.toString() || '',
        descripcion: product.description || '',
        imagen: product.images?.[0] || '',
        stock: product.stock?.toString() || '',
        disponible: product.disponible !== false,
        descuento: product.discount?.toString() || ''
      });
    } else {
      setFormData({
        nombre: '',
        categoria: 'Singani',
        precio: '',
        descripcion: '',
        imagen: '',
        stock: '',
        disponible: true,
        descuento: ''
      });
    }
    setErrors({});
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
    
    const precio = parseFloat(formData.precio);
    if (!formData.precio || isNaN(precio) || precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }
    
    const stock = parseInt(formData.stock);
    if (formData.stock === '' || isNaN(stock) || stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }
    
    if (formData.descuento) {
      const descuento = parseFloat(formData.descuento);
      if (isNaN(descuento) || descuento < 0 || descuento > 100) {
        newErrors.descuento = 'El descuento debe estar entre 0 y 100';
      }
    }
    
    if (formData.imagen && !formData.imagen.match(/^https?:\/\/.+/)) {
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
        price: parseFloat(formData.precio),
        description: formData.descripcion.trim(),
        images: formData.imagen ? [formData.imagen] : [],
        stock: parseInt(formData.stock),
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
      precio: '',
      descripcion: '',
      imagen: '',
      stock: '',
      disponible: true,
      descuento: ''
    });
    setErrors({});
    onClose();
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
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryBtn, formData.categoria === cat && styles.categoryBtnActive]}
                  onPress={() => handleInputChange('categoria', cat)}
                >
                  <Text style={[styles.categoryBtnText, formData.categoria === cat && styles.categoryBtnTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
            
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Precio (Bs) *</Text>
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
            
            <Text style={styles.label}>Stock *</Text>
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
            
            <Text style={styles.label}>URL de imagen</Text>
            <TextInput
              style={[styles.input, errors.imagen && styles.inputError]}
              value={formData.imagen}
              onChangeText={(text) => handleInputChange('imagen', text)}
              placeholder="https://..."
              placeholderTextColor={COLORS.textTertiary}
            />
            {errors.imagen && <Text style={styles.errorText}>{errors.imagen}</Text>}
            
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
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.bgTertiary, borderWidth: 1, borderColor: COLORS.bgTertiary },
  categoryBtnActive: { backgroundColor: COLORS.accentGold + '20', borderColor: COLORS.accentGold },
  categoryBtnText: { fontSize: 13, color: COLORS.textSecondary },
  categoryBtnTextActive: { color: COLORS.accentGold, fontWeight: '600' },
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
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.bgPrimary }
});

export default ProductModal;
