import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import firebaseFinanceService from '../../services/firebaseFinanceService';
import firebaseProductService from '../../services/firebaseProductService';

const EXPENSE_CATEGORIES = {
  INVENTARIO: { id: 'inventario', label: 'Compra de Inventario', icon: 'cart', color: '#FF9500' },
  SALARIOS: { id: 'salarios', label: 'Salarios y Pagos', icon: 'people', color: '#007AFF' },
  OPERATIVOS: { id: 'operativos', label: 'Gastos Operativos', icon: 'settings', color: '#AF52DE' },
  OTROS: { id: 'otros', label: 'Otros', icon: 'ellipsis-horizontal', color: '#8E8E93' }
};

const OPERATIONAL_SUBCATEGORIES = [
  'Luz/Electricidad',
  'Agua',
  'Internet',
  'Alquiler de local',
  'Mantenimiento',
  'Limpieza',
  'Publicidad',
  'Otros'
];

const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Tarjeta'];

export default function ExpenseModal({ visible, onClose, onSave }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [subcategory, setSubcategory] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && selectedCategory === EXPENSE_CATEGORIES.INVENTARIO.id) {
      const unsubscribe = firebaseProductService.subscribeToProducts((prods) => {
        setProducts(prods);
      });
      return () => unsubscribe();
    }
  }, [visible, selectedCategory]);

  const handleClose = () => {
    setSelectedCategory(null);
    setAmount('');
    setDescription('');
    setProvider('');
    setPaymentMethod('Efectivo');
    setSubcategory('');
    setSelectedProducts([]);
    onClose();
  };

  const handleSave = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }

    if (selectedCategory === EXPENSE_CATEGORIES.INVENTARIO.id) {
      if (selectedProducts.length === 0) {
        Alert.alert('Error', 'Selecciona al menos un producto');
        return;
      }
      await handleInventoryPurchase();
    } else {
      if (!amount || parseFloat(amount) <= 0) {
        Alert.alert('Error', 'Ingresa un monto válido');
        return;
      }
      await handleRegularExpense();
    }
  };

  const handleInventoryPurchase = async () => {
    setLoading(true);
    try {
      const totalAmount = selectedProducts.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
      
      // Crear transacción
      const result = await firebaseFinanceService.createTransaction({
        type: 'gasto',
        category: 'inventario',
        amount: totalAmount,
        description: `Compra de inventario - ${selectedProducts.length} productos`,
        provider: provider || 'N/A',
        paymentMethod,
        date: new Date().toISOString(),
        products: selectedProducts.map(p => ({
          productId: p.id,
          name: p.name,
          quantity: p.quantity,
          cost: p.cost,
          subtotal: p.cost * p.quantity
        }))
      });

      if (result.success) {
        // Actualizar stock de productos
        for (const p of selectedProducts) {
          const product = products.find(prod => prod.id === p.id);
          await firebaseProductService.updateProduct(p.id, {
            stock: (product.stock || 0) + p.quantity
          });
        }

        if (Platform.OS === 'web') {
          window.alert('Gasto registrado y stock actualizado');
        } else {
          Alert.alert('Éxito', 'Gasto registrado y stock actualizado');
        }
        handleClose();
        if (onSave) onSave();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleRegularExpense = async () => {
    setLoading(true);
    try {
      const result = await firebaseFinanceService.createTransaction({
        type: 'gasto',
        category: selectedCategory,
        subcategory: subcategory || undefined,
        amount: parseFloat(amount),
        description: description || 'Sin descripción',
        provider: provider || undefined,
        paymentMethod,
        date: new Date().toISOString()
      });

      if (result.success) {
        if (Platform.OS === 'web') {
          window.alert('Gasto registrado correctamente');
        } else {
          Alert.alert('Éxito', 'Gasto registrado correctamente');
        }
        handleClose();
        if (onSave) onSave();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (product) => {
    const exists = selectedProducts.find(p => p.id === product.id);
    if (exists) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1, cost: product.cost || 0 }]);
    }
  };

  const updateProductQuantity = (productId, quantity) => {
    setSelectedProducts(selectedProducts.map(p =>
      p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
    ));
  };

  const updateProductCost = (productId, cost) => {
    setSelectedProducts(selectedProducts.map(p =>
      p.id === productId ? { ...p, cost: Math.max(0, cost) } : p
    ));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Gasto</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {!selectedCategory ? (
              <>
                <Text style={styles.label}>Selecciona una categoría</Text>
                {Object.values(EXPENSE_CATEGORIES).map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryCard}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                      <Ionicons name={cat.icon} size={28} color={cat.color} />
                    </View>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                ))}
              </>
            ) : selectedCategory === EXPENSE_CATEGORIES.INVENTARIO.id ? (
              <>
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedCategory(null)}>
                  <Ionicons name="arrow-back" size={20} color={COLORS.accentGold} />
                  <Text style={styles.backText}>Cambiar categoría</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Selecciona productos</Text>
                {products.map(product => {
                  const selected = selectedProducts.find(p => p.id === product.id);
                  return (
                    <View key={product.id} style={styles.productRow}>
                      <TouchableOpacity
                        style={[styles.checkbox, selected && styles.checkboxActive]}
                        onPress={() => toggleProduct(product)}
                      >
                        {selected && <Ionicons name="checkmark" size={16} color={COLORS.bgPrimary} />}
                      </TouchableOpacity>
                      <Text style={styles.productName}>{product.name}</Text>
                      {selected && (
                        <View style={styles.productInputs}>
                          <TextInput
                            style={styles.smallInput}
                            value={selected.quantity.toString()}
                            onChangeText={(text) => updateProductQuantity(product.id, parseInt(text) || 1)}
                            keyboardType="numeric"
                            placeholder="Cant"
                          />
                          <TextInput
                            style={styles.smallInput}
                            value={selected.cost.toString()}
                            onChangeText={(text) => updateProductCost(product.id, parseFloat(text) || 0)}
                            keyboardType="numeric"
                            placeholder="Costo"
                          />
                        </View>
                      )}
                    </View>
                  );
                })}

                {selectedProducts.length > 0 && (
                  <>
                    <Text style={styles.label}>Proveedor (opcional)</Text>
                    <TextInput
                      style={styles.input}
                      value={provider}
                      onChangeText={setProvider}
                      placeholder="Nombre del proveedor"
                      placeholderTextColor={COLORS.textTertiary}
                    />

                    <Text style={styles.label}>Método de Pago</Text>
                    <View style={styles.paymentMethods}>
                      {PAYMENT_METHODS.map(method => (
                        <TouchableOpacity
                          key={method}
                          style={[styles.paymentChip, paymentMethod === method && styles.paymentChipActive]}
                          onPress={() => setPaymentMethod(method)}
                        >
                          <Text style={[styles.paymentChipText, paymentMethod === method && styles.paymentChipTextActive]}>
                            {method}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.totalCard}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>
                        Bs {selectedProducts.reduce((sum, p) => sum + (p.cost * p.quantity), 0).toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedCategory(null)}>
                  <Ionicons name="arrow-back" size={20} color={COLORS.accentGold} />
                  <Text style={styles.backText}>Cambiar categoría</Text>
                </TouchableOpacity>

                {selectedCategory === EXPENSE_CATEGORIES.OPERATIVOS.id && (
                  <>
                    <Text style={styles.label}>Subcategoría</Text>
                    <View style={styles.subcategories}>
                      {OPERATIONAL_SUBCATEGORIES.map(sub => (
                        <TouchableOpacity
                          key={sub}
                          style={[styles.subChip, subcategory === sub && styles.subChipActive]}
                          onPress={() => setSubcategory(sub)}
                        >
                          <Text style={[styles.subChipText, subcategory === sub && styles.subChipTextActive]}>
                            {sub}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <Text style={styles.label}>Monto (Bs) *</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textTertiary}
                />

                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe el gasto..."
                  placeholderTextColor={COLORS.textTertiary}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.label}>Proveedor (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={provider}
                  onChangeText={setProvider}
                  placeholder="Nombre del proveedor"
                  placeholderTextColor={COLORS.textTertiary}
                />

                <Text style={styles.label}>Método de Pago</Text>
                <View style={styles.paymentMethods}>
                  {PAYMENT_METHODS.map(method => (
                    <TouchableOpacity
                      key={method}
                      style={[styles.paymentChip, paymentMethod === method && styles.paymentChipActive]}
                      onPress={() => setPaymentMethod(method)}
                    >
                      <Text style={[styles.paymentChipText, paymentMethod === method && styles.paymentChipTextActive]}>
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={loading || !selectedCategory}
              >
                <Text style={styles.saveBtnText}>{loading ? 'Guardando...' : 'Guardar Gasto'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { backgroundColor: COLORS.bgSecondary, borderRadius: 20, padding: 24, width: '100%', maxWidth: 600, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgTertiary, borderRadius: 12, padding: 16, marginBottom: 12, gap: 12 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  categoryLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  backText: { fontSize: 14, color: COLORS.accentGold, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgTertiary, borderRadius: 8, padding: 12, marginBottom: 8, gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.textTertiary, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: COLORS.accentGold, borderColor: COLORS.accentGold },
  productName: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  productInputs: { flexDirection: 'row', gap: 8 },
  smallInput: { width: 60, backgroundColor: COLORS.bgPrimary, borderRadius: 6, padding: 8, fontSize: 12, color: COLORS.textPrimary, textAlign: 'center' },
  input: { backgroundColor: COLORS.bgTertiary, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.bgTertiary },
  textArea: { height: 80, textAlignVertical: 'top' },
  subcategories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  subChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.bgTertiary, borderWidth: 1, borderColor: COLORS.bgTertiary },
  subChipActive: { backgroundColor: COLORS.accentGold + '20', borderColor: COLORS.accentGold },
  subChipText: { fontSize: 12, color: COLORS.textSecondary },
  subChipTextActive: { color: COLORS.accentGold, fontWeight: '600' },
  paymentMethods: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  paymentChip: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: COLORS.bgTertiary, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgTertiary },
  paymentChipActive: { backgroundColor: COLORS.accentGold + '20', borderColor: COLORS.accentGold },
  paymentChipText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  paymentChipTextActive: { color: COLORS.accentGold },
  totalCard: { backgroundColor: COLORS.accentGold + '20', borderRadius: 12, padding: 16, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  totalValue: { fontSize: 24, fontWeight: '700', color: COLORS.accentGold },
  footer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.bgTertiary, alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.accentGold, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.bgPrimary }
});
