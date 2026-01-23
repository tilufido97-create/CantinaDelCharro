import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import { getCurrentAdmin } from '../utils/adminAuth';

const PROMOTION_TYPES = {
  discount: { name: 'Descuento', icon: 'pricetag', color: COLORS.info },
  combo: { name: 'Combo', icon: 'gift', color: COLORS.accentGold },
  flash: { name: 'Flash', icon: 'flash', color: COLORS.error },
  happy_hour: { name: 'Happy Hour', icon: 'time', color: COLORS.warning }
};

export default function PromotionsScreen() {
  const [user, setUser] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [stats, setStats] = useState({ active: 0, scheduled: 0, finished: 0 });
  
  const [formData, setFormData] = useState({
    type: 'discount',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '0',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true
  });

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const promoData = await AsyncStorage.getItem('promotions');
      let promos = promoData ? JSON.parse(promoData) : [];
      
      const now = new Date();
      promos = promos.map(promo => {
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);
        let status;
        if (now < start) status = 'scheduled';
        else if (now > end) status = 'finished';
        else status = promo.active ? 'active' : 'paused';
        return { ...promo, status };
      });
      
      setPromotions(promos);
      setStats({
        active: promos.filter(p => p.status === 'active').length,
        scheduled: promos.filter(p => p.status === 'scheduled').length,
        finished: promos.filter(p => p.status === 'finished').length
      });
    } catch (error) {
      console.error('Error loading promotions:', error);
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
    loadPromotions();
  }, []);

  const handleCreate = () => {
    setEditingPromotion(null);
    setFormData({
      type: 'discount',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '0',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      Alert.alert('Error', 'El descuento debe ser mayor a 0');
      return;
    }
    if (formData.discountType === 'percentage' && parseFloat(formData.discountValue) > 100) {
      Alert.alert('Error', 'El porcentaje no puede ser mayor a 100%');
      return;
    }
    
    try {
      const promoData = {
        id: editingPromotion?.id || `promo-${Date.now()}`,
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minPurchase: parseFloat(formData.minPurchase) || 0,
        createdAt: editingPromotion?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      let updatedPromotions;
      if (editingPromotion) {
        updatedPromotions = promotions.map(p => p.id === editingPromotion.id ? promoData : p);
        Alert.alert('Éxito', 'Promoción actualizada');
      } else {
        updatedPromotions = [...promotions, promoData];
        Alert.alert('Éxito', 'Promoción creada');
      }
      
      await AsyncStorage.setItem('promotions', JSON.stringify(updatedPromotions));
      setPromotions(updatedPromotions);
      setShowModal(false);
      loadPromotions();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la promoción');
    }
  };

  const togglePromotion = async (promo) => {
    try {
      const updatedPromotions = promotions.map(p =>
        p.id === promo.id ? { ...p, active: !p.active } : p
      );
      await AsyncStorage.setItem('promotions', JSON.stringify(updatedPromotions));
      setPromotions(updatedPromotions);
      loadPromotions();
      Alert.alert('Éxito', `Promoción ${!promo.active ? 'activada' : 'desactivada'}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado');
    }
  };

  const deletePromotion = (promo) => {
    Alert.alert(
      'Eliminar promoción',
      `¿Estás seguro de eliminar "${promo.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPromotions = promotions.filter(p => p.id !== promo.id);
              await AsyncStorage.setItem('promotions', JSON.stringify(updatedPromotions));
              setPromotions(updatedPromotions);
              loadPromotions();
              Alert.alert('Éxito', 'Promoción eliminada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          }
        }
      ]
    );
  };

  const quickActivateHappyHour = async () => {
    const happyHour = {
      id: `promo-${Date.now()}`,
      type: 'happy_hour',
      name: 'Happy Hour',
      description: '25% de descuento en todos los productos',
      discountType: 'percentage',
      discountValue: 25,
      minPurchase: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedPromotions = [...promotions, happyHour];
    await AsyncStorage.setItem('promotions', JSON.stringify(updatedPromotions));
    setPromotions(updatedPromotions);
    loadPromotions();
    Alert.alert('¡Happy Hour Activado! 🎉', 'Válido de 18:00 a 21:00 hoy');
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: COLORS.success, text: 'Activa' },
      scheduled: { color: COLORS.warning, text: 'Programada' },
      finished: { color: COLORS.textTertiary, text: 'Finalizada' },
      paused: { color: COLORS.error, text: 'Pausada' }
    };
    return badges[status] || badges.paused;
  };

  if (!user) return null;

  return (
    <AdminLayout title="Gestión de Promociones" user={user} showBackButton={true}>
      <View style={styles.statsBar}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Activas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.scheduled}</Text>
          <Text style={styles.statLabel}>Programadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.textTertiary }]}>{stats.finished}</Text>
          <Text style={styles.statLabel}>Finalizadas</Text>
        </View>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.newButton} onPress={handleCreate}>
          <Ionicons name="add" size={24} color={COLORS.bgPrimary} />
          <Text style={styles.newButtonText}>Nueva Promoción</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Promociones Rápidas</Text>
        <View style={styles.quickButtonsRow}>
          <TouchableOpacity style={styles.quickButton} onPress={quickActivateHappyHour}>
            <Ionicons name="time" size={24} color={COLORS.warning} />
            <Text style={styles.quickButtonText}>Activar Happy Hour</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton} onPress={() => {
            setFormData({ ...formData, type: 'flash', name: 'Flash Sale', discountValue: '30' });
            setShowModal(true);
          }}>
            <Ionicons name="flash" size={24} color={COLORS.error} />
            <Text style={styles.quickButtonText}>Nueva Oferta Flash</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accentGold} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { width: 60 }]}>Tipo</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Nombre</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Descuento</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>Fechas</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Estado</Text>
            <Text style={[styles.headerCell, { width: 80 }]}>Activa</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Acciones</Text>
          </View>
          
          {promotions.map(promo => {
            const type = PROMOTION_TYPES[promo.type];
            const badge = getStatusBadge(promo.status);
            
            return (
              <View key={promo.id} style={styles.promotionRow}>
                <View style={[styles.typeCell, { backgroundColor: type.color + '20' }]}>
                  <Ionicons name={type.icon} size={24} color={type.color} />
                </View>
                
                <View style={styles.nameCell}>
                  <Text style={styles.promoName}>{promo.name}</Text>
                  <Text style={styles.promoDesc}>{promo.description}</Text>
                </View>
                
                <Text style={styles.discountValue}>
                  {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `Bs ${promo.discountValue}`}
                </Text>
                
                <View style={styles.datesCell}>
                  <Text style={styles.dateText}>
                    {new Date(promo.startDate).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
                  </Text>
                  <Text style={styles.dateSeparator}>→</Text>
                  <Text style={styles.dateText}>
                    {new Date(promo.endDate).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: badge.color + '20' }]}>
                  <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
                </View>
                
                <Switch
                  value={promo.active}
                  onValueChange={() => togglePromotion(promo)}
                  disabled={promo.status === 'finished'}
                  trackColor={{ false: COLORS.textTertiary, true: COLORS.success }}
                />
                
                <View style={styles.actionsCell}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => {
                    setEditingPromotion(promo);
                    setFormData(promo);
                    setShowModal(true);
                  }}>
                    <Ionicons name="pencil" size={20} color={COLORS.info} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => deletePromotion(promo)}>
                    <Ionicons name="trash" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          
          {promotions.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No hay promociones creadas</Text>
            </View>
          )}
        </View>
      )}

      <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.fieldLabel}>Tipo de Promoción *</Text>
              <View style={styles.typeButtons}>
                {Object.entries(PROMOTION_TYPES).map(([key, type]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.typeButton, formData.type === key && styles.typeButtonActive, { borderColor: type.color }]}
                    onPress={() => setFormData(prev => ({ ...prev, type: key }))}
                  >
                    <Ionicons name={type.icon} size={24} color={formData.type === key ? type.color : COLORS.textTertiary} />
                    <Text style={[styles.typeButtonText, formData.type === key && { color: type.color }]}>{type.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.fieldLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Ej: Happy Hour de Viernes"
                placeholderTextColor={COLORS.textTertiary}
              />
              
              <Text style={styles.fieldLabel}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Descripción de la promoción..."
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.fieldLabel}>Tipo de Descuento *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioButton, formData.discountType === 'percentage' && styles.radioButtonActive]}
                  onPress={() => setFormData(prev => ({ ...prev, discountType: 'percentage' }))}
                >
                  <Text style={styles.radioText}>Porcentaje (%)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, formData.discountType === 'fixed' && styles.radioButtonActive]}
                  onPress={() => setFormData(prev => ({ ...prev, discountType: 'fixed' }))}
                >
                  <Text style={styles.radioText}>Monto Fijo (Bs)</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.fieldLabel}>Valor del Descuento * {formData.discountType === 'percentage' ? '(%)' : '(Bs)'}</Text>
              <TextInput
                style={styles.input}
                value={formData.discountValue}
                onChangeText={(text) => setFormData(prev => ({ ...prev, discountValue: text }))}
                placeholder={formData.discountType === 'percentage' ? '25' : '50'}
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="numeric"
              />
              
              <Text style={styles.fieldLabel}>Compra Mínima (Bs)</Text>
              <TextInput
                style={styles.input}
                value={formData.minPurchase}
                onChangeText={(text) => setFormData(prev => ({ ...prev, minPurchase: text }))}
                placeholder="0 (sin mínimo)"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="numeric"
              />
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.fieldLabel}>Fecha Inicio *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.startDate}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, startDate: text }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.fieldLabel}>Fecha Fin *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.endDate}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, endDate: text }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
              </View>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Activar promoción inmediatamente</Text>
                <Switch
                  value={formData.active}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, active: value }))}
                  trackColor={{ false: COLORS.textTertiary, true: COLORS.accentGold }}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>{editingPromotion ? 'Actualizar' : 'Crear'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  statsBar: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgTertiary },
  statValue: { fontSize: 32, fontWeight: '700' },
  statLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  toolbar: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 24 },
  newButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accentGold, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8, cursor: 'pointer' },
  newButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.bgPrimary },
  quickActions: { marginBottom: 24 },
  quickActionsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  quickButtonsRow: { flexDirection: 'row', gap: 12 },
  quickButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.bgSecondary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.bgTertiary, cursor: 'pointer' },
  quickButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  table: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  tableHeader: { flexDirection: 'row', paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: COLORS.bgTertiary },
  headerCell: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  promotionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.bgTertiary },
  typeCell: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  nameCell: { flex: 2, paddingHorizontal: 12 },
  promoName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  promoDesc: { fontSize: 12, color: COLORS.textTertiary },
  discountValue: { width: 100, fontSize: 16, fontWeight: '700', color: COLORS.accentGold },
  datesCell: { width: 120, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: COLORS.textSecondary },
  dateSeparator: { fontSize: 12, color: COLORS.textTertiary },
  statusBadge: { width: 100, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: '600' },
  actionsCell: { width: 100, flexDirection: 'row', gap: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.bgTertiary, justifyContent: 'center', alignItems: 'center' },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textTertiary, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.bgPrimary, borderRadius: 16, padding: 24, width: '100%', maxWidth: 600, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 16, fontSize: 14, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.bgTertiary },
  textArea: { height: 100, textAlignVertical: 'top' },
  typeButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeButton: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderRadius: 12, backgroundColor: COLORS.bgSecondary, borderWidth: 2 },
  typeButtonActive: { backgroundColor: COLORS.bgTertiary },
  typeButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  radioGroup: { flexDirection: 'row', gap: 12 },
  radioButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.bgSecondary, borderWidth: 2, borderColor: COLORS.bgTertiary, alignItems: 'center' },
  radioButtonActive: { borderColor: COLORS.accentGold, backgroundColor: COLORS.accentGold + '20' },
  radioText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  row: { flexDirection: 'row', gap: 16 },
  halfWidth: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: 16, backgroundColor: COLORS.bgSecondary, borderRadius: 12 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.bgSecondary, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgTertiary },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  saveButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.accentGold, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.bgPrimary }
});
