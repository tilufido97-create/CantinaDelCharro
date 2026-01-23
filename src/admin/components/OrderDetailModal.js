import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const ORDER_STATES = {
  pending: { label: 'Pendiente', color: COLORS.warning, icon: 'time' },
  preparing: { label: 'Preparando', color: COLORS.info, icon: 'hourglass' },
  ready: { label: 'Listo', color: COLORS.success, icon: 'checkmark-circle' },
  assigned: { label: 'Asignado', color: COLORS.accentGold, icon: 'bicycle' },
  on_way: { label: 'En camino', color: COLORS.accentGold, icon: 'bicycle' },
  delivered: { label: 'Entregado', color: COLORS.success, icon: 'checkmark-done' },
  cancelled: { label: 'Cancelado', color: COLORS.error, icon: 'close-circle' }
};

const OrderDetailModal = ({ visible, order, deliveries, onClose, onUpdateStatus, onAssignDelivery, onUnassignDelivery, onCancelOrder }) => {
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!order) return null;

  const state = ORDER_STATES[order.status];
  const availableDeliveries = deliveries?.filter(d => d.status === 'active' && d.available) || [];

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'on_way' && !order.assignedDeliveryId) {
      Alert.alert('Error', 'Debes asignar un delivery antes de marcar el pedido en camino');
      return;
    }

    Alert.alert(
      'Cambiar estado',
      `¿Cambiar a: ${ORDER_STATES[newStatus].label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setIsProcessing(true);
            await onUpdateStatus(order.id, newStatus);
            setIsProcessing(false);
          }
        }
      ]
    );
  };

  const handleAssign = () => {
    if (!selectedDelivery) {
      Alert.alert('Error', 'Selecciona un delivery');
      return;
    }

    Alert.alert(
      'Asignar delivery',
      `¿Asignar este pedido a ${deliveries.find(d => d.id === selectedDelivery)?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Asignar',
          onPress: async () => {
            setIsProcessing(true);
            await onAssignDelivery(order.id, selectedDelivery);
            setShowDeliveryPicker(false);
            setSelectedDelivery(null);
            setIsProcessing(false);
          }
        }
      ]
    );
  };

  const handleUnassign = () => {
    Alert.alert(
      'Quitar delivery',
      '¿Estás seguro de quitar el delivery asignado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            await onUnassignDelivery(order.id);
            setIsProcessing(false);
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      '⚠️ Cancelar pedido',
      `¿Estás seguro de cancelar el pedido #${order.orderNumber}? Esta acción no se puede deshacer.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            await onCancelOrder(order.id);
            setIsProcessing(false);
            onClose();
          }
        }
      ]
    );
  };

  const getNextStates = () => {
    const flow = {
      pending: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['assigned', 'cancelled'],
      assigned: ['on_way', 'cancelled'],
      on_way: ['delivered', 'cancelled']
    };
    return flow[order.status] || [];
  };

  const nextStates = getNextStates();
  const canChangeStatus = !['delivered', 'cancelled'].includes(order.status);
  const canAssignDelivery = ['preparing', 'ready'].includes(order.status);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: state.color + '20' }]}>
            <Ionicons name={state.icon} size={20} color={state.color} />
            <Text style={[styles.statusText, { color: state.color }]}>{state.label}</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.orderTitle}>Pedido #{order.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleString('es-BO', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Cliente</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{order.customerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{order.customerPhone || 'No disponible'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={COLORS.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoText}>{order.deliveryAddress?.street}</Text>
                  <Text style={styles.infoTextSmall}>{order.deliveryAddress?.zone}</Text>
                  {order.deliveryAddress?.reference && (
                    <Text style={styles.infoTextSmall}>Ref: {order.deliveryAddress.reference}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos del Pedido</Text>
            <View style={styles.card}>
              {order.items?.map((item, index) => (
                <View key={index} style={styles.productRow}>
                  <Text style={styles.productQty}>{item.quantity}x</Text>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>Bs {(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen de Pago</Text>
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>Bs {order.subtotal?.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery:</Text>
                <Text style={styles.summaryValue}>Bs {order.delivery?.toFixed(2) || '0.00'}</Text>
              </View>
              {order.discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Descuento:</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                    -Bs {order.discount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>Bs {order.total?.toFixed(2)}</Text>
              </View>
              <View style={styles.paymentBadge}>
                <Ionicons 
                  name={order.paymentMethod === 'cash' ? 'cash' : 'qr-code'} 
                  size={16} 
                  color={COLORS.textSecondary} 
                />
                <Text style={styles.paymentText}>
                  {order.paymentMethod === 'cash' ? 'Efectivo' : 'QR'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Asignado</Text>
            <View style={styles.card}>
              {order.assignedDeliveryId ? (
                <>
                  <View style={styles.deliveryInfo}>
                    <Ionicons name="bicycle" size={24} color={COLORS.accentGold} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.deliveryName}>{order.assignedDeliveryName}</Text>
                      <Text style={styles.deliveryCode}>{order.assignedDeliveryCode}</Text>
                    </View>
                  </View>
                  {canAssignDelivery && (
                    <View style={styles.deliveryActions}>
                      <TouchableOpacity 
                        style={styles.changeBtn} 
                        onPress={() => setShowDeliveryPicker(true)}
                      >
                        <Text style={styles.changeBtnText}>Cambiar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.removeBtn} onPress={handleUnassign}>
                        <Text style={styles.removeBtnText}>Quitar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : canAssignDelivery ? (
                <TouchableOpacity 
                  style={styles.assignBtn} 
                  onPress={() => setShowDeliveryPicker(true)}
                >
                  <Ionicons name="add-circle" size={24} color={COLORS.accentGold} />
                  <Text style={styles.assignBtnText}>Asignar Delivery</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.noDeliveryText}>No asignado</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline del Pedido</Text>
            <View style={styles.card}>
              <View style={styles.timelineItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Pedido creado</Text>
                  <Text style={styles.timelineTime}>
                    {new Date(order.createdAt).toLocaleString('es-BO')}
                  </Text>
                </View>
              </View>
              {order.assignedAt && (
                <View style={styles.timelineItem}>
                  <Ionicons name="bicycle" size={20} color={COLORS.accentGold} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineLabel}>Delivery asignado</Text>
                    <Text style={styles.timelineTime}>
                      {new Date(order.assignedAt).toLocaleString('es-BO')}
                    </Text>
                  </View>
                </View>
              )}
              {order.deliveredAt && (
                <View style={styles.timelineItem}>
                  <Ionicons name="checkmark-done" size={20} color={COLORS.success} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineLabel}>Pedido entregado</Text>
                    <Text style={styles.timelineTime}>
                      {new Date(order.deliveredAt).toLocaleString('es-BO')}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {canChangeStatus && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acciones</Text>
              {nextStates.filter(s => s !== 'cancelled').map(status => (
                <TouchableOpacity
                  key={status}
                  style={[styles.actionBtn, { backgroundColor: ORDER_STATES[status].color }]}
                  onPress={() => handleStatusChange(status)}
                  disabled={isProcessing}
                >
                  <Ionicons name={ORDER_STATES[status].icon} size={20} color="#FFF" />
                  <Text style={styles.actionBtnText}>
                    Marcar como: {ORDER_STATES[status].label}
                  </Text>
                </TouchableOpacity>
              ))}
              {nextStates.includes('cancelled') && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={handleCancel}
                  disabled={isProcessing}
                >
                  <Ionicons name="close-circle" size={20} color="#FFF" />
                  <Text style={styles.actionBtnText}>Cancelar Pedido</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        <Modal visible={showDeliveryPicker} animationType="slide" transparent={true}>
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Seleccionar Delivery</Text>
                <TouchableOpacity onPress={() => setShowDeliveryPicker(false)}>
                  <Ionicons name="close" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={availableDeliveries}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.deliveryOption,
                      selectedDelivery === item.id && styles.deliveryOptionSelected
                    ]}
                    onPress={() => setSelectedDelivery(item.id)}
                  >
                    <View style={styles.deliveryOptionInfo}>
                      <Text style={styles.deliveryOptionName}>{item.name}</Text>
                      <Text style={styles.deliveryOptionCode}>{item.code}</Text>
                      <Text style={styles.deliveryOptionVehicle}>
                        {item.vehicleType} - {item.vehiclePlate}
                      </Text>
                    </View>
                    <View style={styles.deliveryOptionStats}>
                      <Text style={styles.deliveryOptionStat}>
                        {item.completedToday || 0} entregas hoy
                      </Text>
                      <View style={styles.availableBadge}>
                        <Text style={styles.availableText}>✓ Disponible</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <Ionicons name="bicycle-outline" size={64} color={COLORS.textTertiary} />
                    <Text style={styles.emptyText}>No hay deliverys disponibles</Text>
                  </View>
                )}
              />
              
              <TouchableOpacity
                style={[styles.confirmBtn, !selectedDelivery && styles.confirmBtnDisabled]}
                onPress={handleAssign}
                disabled={!selectedDelivery || isProcessing}
              >
                <Text style={styles.confirmBtnText}>
                  {isProcessing ? 'Asignando...' : 'Confirmar Asignación'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.bgTertiary },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { fontSize: 16, color: COLORS.textPrimary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  statusText: { fontSize: 14, fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  orderTitle: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  orderDate: { fontSize: 14, color: COLORS.textTertiary, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  card: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  infoText: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  infoTextSmall: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.bgTertiary },
  productQty: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, width: 40 },
  productName: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  productPrice: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: COLORS.textPrimary },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.bgTertiary, paddingTop: 12, marginTop: 8 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  totalValue: { fontSize: 18, fontWeight: '700', color: COLORS.accentGold },
  paymentBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.bgTertiary },
  paymentText: { fontSize: 13, color: COLORS.textSecondary },
  deliveryInfo: { flexDirection: 'row', alignItems: 'center' },
  deliveryName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  deliveryCode: { fontSize: 13, color: COLORS.accentGold, marginTop: 2 },
  deliveryActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  changeBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: COLORS.bgTertiary, alignItems: 'center' },
  changeBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  removeBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: COLORS.error + '20', alignItems: 'center' },
  removeBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.error },
  assignBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  assignBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.accentGold },
  noDeliveryText: { fontSize: 14, color: COLORS.textTertiary, textAlign: 'center', padding: 16 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  timelineContent: { marginLeft: 12, flex: 1 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  timelineTime: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16, borderRadius: 12, marginBottom: 12 },
  actionBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  cancelBtn: { backgroundColor: COLORS.error },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  pickerContainer: { backgroundColor: COLORS.bgPrimary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pickerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  deliveryOption: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: COLORS.bgTertiary },
  deliveryOptionSelected: { borderColor: COLORS.accentGold, backgroundColor: COLORS.accentGold + '10' },
  deliveryOptionInfo: { marginBottom: 8 },
  deliveryOptionName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  deliveryOptionCode: { fontSize: 13, color: COLORS.accentGold, marginTop: 2 },
  deliveryOptionVehicle: { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },
  deliveryOptionStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deliveryOptionStat: { fontSize: 12, color: COLORS.textSecondary },
  availableBadge: { backgroundColor: COLORS.success + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  availableText: { fontSize: 11, fontWeight: '600', color: COLORS.success },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textTertiary, marginTop: 16 },
  confirmBtn: { backgroundColor: COLORS.accentGold, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.bgPrimary }
});

export default OrderDetailModal;
