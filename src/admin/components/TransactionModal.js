import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { TRANSACTION_CATEGORIES, validateTransactionData } from '../utils/financialCalculator';

const CATEGORY_OPTIONS = [
  { id: TRANSACTION_CATEGORIES.INVENTARIO, label: 'Compra de Inventario', icon: 'cart' },
  { id: TRANSACTION_CATEGORIES.SALARIOS, label: 'Salarios y Pagos', icon: 'people' },
  { id: TRANSACTION_CATEGORIES.OPERATIVOS, label: 'Gastos Operativos', icon: 'settings' },
  { id: TRANSACTION_CATEGORIES.OTROS, label: 'Otros', icon: 'ellipsis-horizontal' }
];

const TransactionModal = ({ visible, transaction, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    categoria: '',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString(),
    proveedor: '',
    comprobante: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        categoria: transaction.categoria || '',
        monto: transaction.monto?.toString() || '',
        descripcion: transaction.descripcion || '',
        fecha: transaction.fecha || new Date().toISOString(),
        proveedor: transaction.proveedor || '',
        comprobante: transaction.comprobante || ''
      });
    } else {
      setFormData({
        categoria: '',
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString(),
        proveedor: '',
        comprobante: ''
      });
    }
    setErrors({});
  }, [transaction, visible]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async () => {
    const dataToValidate = {
      ...formData,
      monto: parseFloat(formData.monto)
    };
    
    const validationErrors = validateTransactionData(dataToValidate);
    
    if (validationErrors) {
      setErrors(validationErrors);
      Alert.alert('Errores de validación', 'Por favor corrige los errores antes de continuar');
      return;
    }
    
    if (parseFloat(formData.monto) > 10000) {
      Alert.alert(
        '⚠️ Monto Alto',
        '¿Estás seguro del monto? Es mayor a Bs 10,000',
        [
          { text: 'Revisar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => saveTransaction() }
        ]
      );
      return;
    }
    
    saveTransaction();
  };

  const saveTransaction = async () => {
    setIsSaving(true);
    try {
      await onSave({
        categoria: formData.categoria,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion.trim(),
        fecha: formData.fecha,
        proveedor: formData.proveedor.trim(),
        comprobante: formData.comprobante.trim()
      });
      handleClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el gasto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      categoria: '',
      monto: '',
      descripcion: '',
      fecha: new Date().toISOString(),
      proveedor: '',
      comprobante: ''
    });
    setErrors({});
    onClose();
  };

  const getExampleText = () => {
    switch (formData.categoria) {
      case TRANSACTION_CATEGORIES.INVENTARIO:
        return 'Ej: Compra 20 cajas Singani Rujero';
      case TRANSACTION_CATEGORIES.SALARIOS:
        return 'Ej: Pago delivery Juan Pérez - semana 3';
      case TRANSACTION_CATEGORIES.OPERATIVOS:
        return 'Ej: Factura de luz - Enero 2025';
      case TRANSACTION_CATEGORIES.OTROS:
        return 'Ej: Reparación refrigerador';
      default:
        return '';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{transaction ? 'Editar Gasto' : 'Registrar Gasto'}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Categoría del Gasto *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, formData.categoria === cat.id && styles.categoryChipActive]}
                  onPress={() => handleInputChange('categoria', cat.id)}
                >
                  <Ionicons name={cat.icon} size={24} color={formData.categoria === cat.id ? COLORS.bgPrimary : COLORS.textSecondary} />
                  <Text style={[styles.categoryChipText, formData.categoria === cat.id && styles.categoryChipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
            
            <Text style={styles.label}>Monto (Bs) *</Text>
            <View style={styles.montoContainer}>
              <Text style={styles.currency}>Bs</Text>
              <TextInput
                style={[styles.montoInput, errors.monto && styles.inputError]}
                value={formData.monto}
                onChangeText={(text) => handleInputChange('monto', text)}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            {errors.monto && <Text style={styles.errorText}>{errors.monto}</Text>}
            
            <Text style={styles.label}>Fecha del Gasto *</Text>
            <TouchableOpacity style={styles.dateButton}>
              <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
              <Text style={styles.dateText}>
                {new Date(formData.fecha).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {errors.fecha && <Text style={styles.errorText}>{errors.fecha}</Text>}
            
            <Text style={styles.label}>Descripción *</Text>
            {getExampleText() && <Text style={styles.hint}>{getExampleText()}</Text>}
            <TextInput
              style={[styles.textArea, errors.descripcion && styles.inputError]}
              value={formData.descripcion}
              onChangeText={(text) => {
                if (text.length <= 200) handleInputChange('descripcion', text);
              }}
              placeholder="Describe el gasto detalladamente..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={3}
            />
            <Text style={styles.charCount}>{formData.descripcion.length}/200</Text>
            {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}
            
            <Text style={styles.label}>Proveedor (Opcional)</Text>
            <TextInput
              style={styles.input}
              value={formData.proveedor}
              onChangeText={(text) => handleInputChange('proveedor', text)}
              placeholder="Nombre del proveedor o vendedor"
              placeholderTextColor={COLORS.textTertiary}
            />
            
            <Text style={styles.label}>Nº Comprobante (Opcional)</Text>
            <TextInput
              style={styles.input}
              value={formData.comprobante}
              onChangeText={(text) => handleInputChange('comprobante', text)}
              placeholder="Número de factura o recibo"
              placeholderTextColor={COLORS.textTertiary}
            />
            
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveBtnText}>{isSaving ? 'Guardando...' : 'Guardar Gasto'}</Text>
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
  hint: { fontSize: 12, color: COLORS.textTertiary, marginBottom: 8, fontStyle: 'italic' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryChip: { width: '48%', backgroundColor: COLORS.bgTertiary, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: COLORS.bgTertiary },
  categoryChipActive: { backgroundColor: COLORS.accentGold, borderColor: COLORS.accentGold },
  categoryChipText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
  categoryChipTextActive: { color: COLORS.bgPrimary, fontWeight: '600' },
  montoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgTertiary, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  currency: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginRight: 12 },
  montoInput: { flex: 1, fontSize: 24, fontWeight: '600', color: COLORS.textPrimary, paddingVertical: 16 },
  dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgTertiary, borderRadius: 12, padding: 16, gap: 12 },
  dateText: { fontSize: 14, color: COLORS.textPrimary },
  input: { backgroundColor: COLORS.bgTertiary, borderRadius: 12, padding: 16, fontSize: 14, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.bgTertiary },
  textArea: { backgroundColor: COLORS.bgTertiary, borderRadius: 12, padding: 16, fontSize: 14, color: COLORS.textPrimary, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.bgTertiary },
  inputError: { borderColor: COLORS.error },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },
  charCount: { fontSize: 12, color: COLORS.textTertiary, textAlign: 'right', marginTop: 4 },
  footer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.bgTertiary, alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.error, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' }
});

export default TransactionModal;
