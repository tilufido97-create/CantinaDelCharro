import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import OrderDetailModal from '../components/OrderDetailModal';
import { getCurrentAdmin } from '../utils/adminAuth';
import firebaseOrderService from '../../services/firebaseOrderService';

const ORDER_STATES = {
  pendiente: { label: 'Pedido Realizado', color: '#FF9500', icon: 'receipt-outline', next: ['preparando', 'cancelado'] },
  preparando: { label: 'Preparando Pedido', color: '#007AFF', icon: 'restaurant-outline', next: ['listo_pickup', 'listo_delivery', 'cancelado'] },
  listo_pickup: { label: 'Esperando Recojo', color: '#34C759', icon: 'checkmark-circle-outline', next: ['entregado', 'cancelado'] },
  listo_delivery: { label: 'Esperando Delivery', color: '#5856D6', icon: 'bicycle-outline', next: ['en_camino', 'cancelado'] },
  en_camino: { label: 'En Camino', color: '#FFB800', icon: 'navigate-outline', next: ['entregado', 'cancelado'] },
  entregado: { label: 'Entregado', color: '#30D158', icon: 'checkmark-done-outline', next: [] },
  cancelado: { label: 'Cancelado', color: '#FF3B30', icon: 'close-circle-outline', next: [] }
};

const OrdersManagementScreen = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    const unsubscribe = firebaseOrderService.subscribeToOrders((ordersData) => {
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setLoading(false);
    });
    return unsubscribe;
  };

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
    const unsubscribe = loadOrders();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = [...orders];
    if (searchQuery.trim()) {
      filtered = filtered.filter(o =>
        o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    const additionalData = {};
    if (newStatus === 'entregado') {
      additionalData.deliveredAt = new Date().toISOString();
    }
    
    const result = await firebaseOrderService.updateOrderStatus(orderId, newStatus, additionalData);
    
    if (result.success) {
      if (Platform.OS === 'web') {
        window.alert(`Pedido actualizado a: ${ORDER_STATES[newStatus].label}`);
      } else {
        Alert.alert('Éxito', `Pedido actualizado a: ${ORDER_STATES[newStatus].label}`);
      }
    } else {
      if (Platform.OS === 'web') {
        window.alert('Error: No se pudo actualizar el pedido');
      } else {
        Alert.alert('Error', 'No se pudo actualizar el pedido');
      }
    }
  };

  const assignDelivery = async (orderId, deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      if (Platform.OS === 'web') {
        window.alert('Error: Delivery no encontrado');
      } else {
        Alert.alert('Error', 'Delivery no encontrado');
      }
      return;
    }
    
    const result = await firebaseOrderService.assignDelivery(orderId, deliveryId, delivery.name);
    
    if (result.success) {
      if (Platform.OS === 'web') {
        window.alert(`Pedido asignado a ${delivery.name}`);
      } else {
        Alert.alert('Éxito', `Pedido asignado a ${delivery.name}`);
      }
    } else {
      if (Platform.OS === 'web') {
        window.alert('Error: No se pudo asignar el delivery');
      } else {
        Alert.alert('Error', 'No se pudo asignar el delivery');
      }
    }
  };

  const unassignDelivery = async (orderId) => {
    // Implementar si es necesario
  };

  const cancelOrder = async (orderId) => {
    const result = await firebaseOrderService.cancelOrder(orderId);
    
    if (result.success) {
      if (Platform.OS === 'web') {
        window.alert('Pedido cancelado y stock restaurado');
      } else {
        Alert.alert('Éxito', 'Pedido cancelado y stock restaurado');
      }
    } else {
      if (Platform.OS === 'web') {
        window.alert('Error: No se pudo cancelar el pedido');
      } else {
        Alert.alert('Error', 'No se pudo cancelar el pedido');
      }
    }
  };

  const getNextStates = (currentState) => {
    return ORDER_STATES[currentState]?.next || [];
  };

  const showStatusMenu = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const OrderRow = ({ order }) => {
    const state = ORDER_STATES[order.status] || ORDER_STATES.pendiente;
    const isDelivery = order.deliveryType === 'delivery';
    const displayName = order.customerName || order.customerEmail?.split('@')[0] || 'Cliente';
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => { setSelectedOrder(order); setShowDetailModal(true); }}
      >
        <View style={styles.orderCardHeader}>
          <View>
            <Text style={styles.orderNumber}>#{order.orderNumber || order.orderId}</Text>
            <Text style={styles.orderTime}>
              {new Date(order.createdAt).toLocaleString('es-BO', { 
                day: '2-digit', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: state.color + '20' }]}>
            <Ionicons name={state.icon} size={16} color={state.color} />
            <Text style={[styles.statusText, { color: state.color }]}>{state.label}</Text>
          </View>
        </View>
        
        <View style={styles.orderCardBody}>
          <View style={styles.customerInfo}>
            <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.customerName}>{displayName}</Text>
          </View>
          
          {isDelivery && order.deliveryAddress && (
            <View style={styles.addressInfo}>
              <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.addressText} numberOfLines={1}>
                {order.deliveryAddress.street || order.deliveryAddress.zona}
              </Text>
            </View>
          )}
          
          {!isDelivery && (
            <View style={styles.pickupInfo}>
              <Ionicons name="storefront-outline" size={16} color={COLORS.accentGold} />
              <Text style={styles.pickupText}>
                Recojo: {order.pickupPersonName || displayName}
              </Text>
            </View>
          )}
          
          <View style={styles.orderItems}>
            <Text style={styles.itemsLabel}>
              {order.items?.length || 0} producto{order.items?.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.orderTotal}>Bs {order.total?.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.orderCardFooter}>
          {getNextStates(order.status).filter(nextState => {
            // Filtrar estados según tipo de entrega
            if (nextState === 'listo_pickup' && order.deliveryType !== 'pickup') return false;
            if (nextState === 'listo_delivery' && order.deliveryType !== 'delivery') return false;
            return true;
          }).map(nextState => (
            <TouchableOpacity
              key={nextState}
              style={[
                styles.actionButton,
                nextState === 'cancelado' && styles.cancelButton
              ]}
              onPress={(e) => {
                e.stopPropagation();
                if (nextState === 'cancelado') {
                  if (Platform.OS === 'web') {
                    if (window.confirm('¿Cancelar este pedido?')) {
                      cancelOrder(order.id || order.orderId);
                    }
                  } else {
                    Alert.alert(
                      'Cancelar Pedido',
                      '¿Estás seguro?',
                      [
                        { text: 'No', style: 'cancel' },
                        { text: 'Sí', onPress: () => cancelOrder(order.id || order.orderId) }
                      ]
                    );
                  }
                } else {
                  // Validar que el estado sea correcto según el tipo de entrega
                  if (nextState === 'listo_pickup' && order.deliveryType !== 'pickup') {
                    return;
                  }
                  if (nextState === 'listo_delivery' && order.deliveryType !== 'delivery') {
                    return;
                  }
                  updateOrderStatus(order.id || order.orderId, nextState);
                }
              }}
            >
              <Text style={[
                styles.actionButtonText,
                nextState === 'cancelado' && styles.cancelButtonText
              ]}>
                {ORDER_STATES[nextState].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const QuickFilters = () => {
    const counts = {
      pendiente: orders.filter(o => o.status === 'pendiente').length,
      preparando: orders.filter(o => o.status === 'preparando').length,
      en_camino: orders.filter(o => o.status === 'en_camino').length,
      today: orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length
    };
    
    return (
      <View style={styles.quickFilters}>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'pendiente' && styles.filterChipActive]}
          onPress={() => setStatusFilter(statusFilter === 'pendiente' ? 'all' : 'pendiente')}
        >
          <Text style={styles.filterChipText}>Nuevos: {counts.pendiente}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'preparando' && styles.filterChipActive]}
          onPress={() => setStatusFilter(statusFilter === 'preparando' ? 'all' : 'preparando')}
        >
          <Text style={styles.filterChipText}>Preparando: {counts.preparando}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'en_camino' && styles.filterChipActive]}
          onPress={() => setStatusFilter(statusFilter === 'en_camino' ? 'all' : 'en_camino')}
        >
          <Text style={styles.filterChipText}>En Camino: {counts.en_camino}</Text>
        </TouchableOpacity>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipText}>Hoy: {counts.today}</Text>
        </View>
      </View>
    );
  };

  if (!user) return null;

  return (
    <AdminLayout title="Pedidos" user={user}>
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar pedidos..."
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>
        
        <TouchableOpacity style={styles.refreshButton} onPress={loadOrders}>
          <Ionicons name="refresh" size={20} color={COLORS.textPrimary} />
          <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      <QuickFilters />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accentGold} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.ordersContainer} showsVerticalScrollIndicator={false}>
          {filteredOrders.map(order => (
            <OrderRow key={order.id || order.orderId} order={order} />
          ))}
          
          {filteredOrders.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No se encontraron pedidos</Text>
            </View>
          )}
        </ScrollView>
      )}

      <OrderDetailModal
        visible={showDetailModal}
        order={selectedOrder}
        deliveries={deliveries}
        onClose={() => setShowDetailModal(false)}
        onUpdateStatus={updateOrderStatus}
        onAssignDelivery={assignDelivery}
        onUnassignDelivery={unassignDelivery}
        onCancelOrder={cancelOrder}
      />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', gap: 16, marginBottom: 16, alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgSecondary, borderRadius: 12, paddingHorizontal: 16, height: 48, flex: 1, borderWidth: 1, borderColor: COLORS.bgTertiary },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, color: COLORS.textPrimary },
  refreshButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgSecondary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: COLORS.bgTertiary },
  refreshText: { fontSize: 14, color: COLORS.textPrimary },
  quickFilters: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.bgTertiary },
  filterChipActive: { backgroundColor: COLORS.accentGold + '20', borderColor: COLORS.accentGold },
  filterChipText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
  ordersContainer: { flex: 1 },
  orderCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderNumber: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  orderTime: { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 13, fontWeight: '600' },
  orderCardBody: { gap: 12, marginBottom: 16 },
  customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customerName: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  addressInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  pickupInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pickupText: { fontSize: 13, color: COLORS.accentGold, fontWeight: '600' },
  orderItems: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.bgTertiary },
  itemsLabel: { fontSize: 13, color: COLORS.textSecondary },
  orderTotal: { fontSize: 18, fontWeight: '700', color: COLORS.accentGold },
  orderCardFooter: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  actionButton: { flex: 1, minWidth: 120, backgroundColor: COLORS.accentGold, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.bgPrimary },
  cancelButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF3B30' },
  cancelButtonText: { color: '#FF3B30' },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textTertiary, marginTop: 16 }
});

export default OrdersManagementScreen;
