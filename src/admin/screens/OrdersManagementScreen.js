import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import OrderDetailModal from '../components/OrderDetailModal';
import { getCurrentAdmin } from '../utils/adminAuth';

const ORDER_STATES = {
  pending: { label: 'Pendiente', color: COLORS.warning, icon: 'time' },
  preparing: { label: 'Preparando', color: COLORS.info, icon: 'hourglass' },
  ready: { label: 'Listo', color: COLORS.success, icon: 'checkmark-circle' },
  assigned: { label: 'Asignado', color: COLORS.accentGold, icon: 'bicycle' },
  on_way: { label: 'En camino', color: COLORS.accentGold, icon: 'bicycle' },
  delivered: { label: 'Entregado', color: COLORS.success, icon: 'checkmark-done' },
  cancelled: { label: 'Cancelado', color: COLORS.error, icon: 'close-circle' }
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

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await AsyncStorage.getItem('order_history');
      let loadedOrders = ordersData ? JSON.parse(ordersData) : [];
      loadedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(loadedOrders);
      setFilteredOrders(loadedOrders);
      
      const deliveriesData = await AsyncStorage.getItem('active_deliveries');
      const activeDeliveries = deliveriesData ? JSON.parse(deliveriesData) : [
        { id: 'dlv1', name: 'Juan Pérez', code: 'DLV-001', status: 'active', available: true, vehicleType: 'Moto', vehiclePlate: 'LP-1234', completedToday: 5 },
        { id: 'dlv2', name: 'María López', code: 'DLV-002', status: 'active', available: false, vehicleType: 'Bicicleta', vehiclePlate: 'N/A', completedToday: 3 },
        { id: 'dlv3', name: 'Carlos Ruiz', code: 'DLV-003', status: 'active', available: true, vehicleType: 'Moto', vehiclePlate: 'LP-5678', completedToday: 7 }
      ];
      setDeliveries(activeDeliveries);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
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
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
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
    try {
      const updatedOrders = orders.map(o => {
        if (o.id === orderId) {
          const updated = { ...o, status: newStatus, updatedAt: new Date().toISOString() };
          if (newStatus === 'delivered') {
            updated.deliveredAt = new Date().toISOString();
            if (o.assignedDeliveryId) {
              const delivery = deliveries.find(d => d.id === o.assignedDeliveryId);
              if (delivery) {
                delivery.available = true;
                delivery.completedToday = (delivery.completedToday || 0) + 1;
              }
            }
          }
          return updated;
        }
        return o;
      });
      await AsyncStorage.setItem('order_history', JSON.stringify(updatedOrders));
      await AsyncStorage.setItem('active_deliveries', JSON.stringify(deliveries));
      setOrders(updatedOrders);
      Alert.alert('Éxito', `Pedido actualizado a: ${ORDER_STATES[newStatus].label}`);
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'No se pudo actualizar el pedido');
    }
  };

  const assignDelivery = async (orderId, deliveryId) => {
    try {
      const delivery = deliveries.find(d => d.id === deliveryId);
      if (!delivery) {
        Alert.alert('Error', 'Delivery no encontrado');
        return;
      }
      const updatedOrders = orders.map(o =>
        o.id === orderId ? {
          ...o,
          assignedDeliveryId: deliveryId,
          assignedDeliveryName: delivery.name,
          assignedDeliveryCode: delivery.code,
          status: 'assigned',
          assignedAt: new Date().toISOString()
        } : o
      );
      const updatedDeliveries = deliveries.map(d =>
        d.id === deliveryId ? { ...d, available: false } : d
      );
      await AsyncStorage.setItem('order_history', JSON.stringify(updatedOrders));
      await AsyncStorage.setItem('active_deliveries', JSON.stringify(updatedDeliveries));
      setOrders(updatedOrders);
      setDeliveries(updatedDeliveries);
      Alert.alert('Éxito', `Pedido asignado a ${delivery.name}`);
    } catch (error) {
      console.error('Error assigning delivery:', error);
      Alert.alert('Error', 'No se pudo asignar el delivery');
    }
  };

  const unassignDelivery = async (orderId) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.assignedDeliveryId) return;
      
      const updatedOrders = orders.map(o =>
        o.id === orderId ? {
          ...o,
          assignedDeliveryId: null,
          assignedDeliveryName: null,
          assignedDeliveryCode: null,
          status: 'ready'
        } : o
      );
      const updatedDeliveries = deliveries.map(d =>
        d.id === order.assignedDeliveryId ? { ...d, available: true } : d
      );
      await AsyncStorage.setItem('order_history', JSON.stringify(updatedOrders));
      await AsyncStorage.setItem('active_deliveries', JSON.stringify(updatedDeliveries));
      setOrders(updatedOrders);
      setDeliveries(updatedDeliveries);
      Alert.alert('Éxito', 'Delivery liberado');
    } catch (error) {
      console.error('Error unassigning delivery:', error);
      Alert.alert('Error', 'No se pudo quitar el delivery');
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const updatedOrders = orders.map(o =>
        o.id === orderId ? {
          ...o,
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        } : o
      );
      
      if (order.assignedDeliveryId) {
        const updatedDeliveries = deliveries.map(d =>
          d.id === order.assignedDeliveryId ? { ...d, available: true } : d
        );
        await AsyncStorage.setItem('active_deliveries', JSON.stringify(updatedDeliveries));
        setDeliveries(updatedDeliveries);
      }
      
      await AsyncStorage.setItem('order_history', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      Alert.alert('Éxito', 'Pedido cancelado');
    } catch (error) {
      console.error('Error cancelling order:', error);
      Alert.alert('Error', 'No se pudo cancelar el pedido');
    }
  };

  const getNextStates = (currentState) => {
    const flow = {
      pending: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['assigned', 'cancelled'],
      assigned: ['on_way', 'cancelled'],
      on_way: ['delivered', 'cancelled']
    };
    return flow[currentState] || [];
  };

  const showStatusMenu = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const OrderRow = ({ order }) => {
    const state = ORDER_STATES[order.status];
    const canAssignDelivery = ['preparing', 'ready'].includes(order.status);
    
    return (
      <View style={styles.orderRow}>
        <View style={styles.orderNumberContainer}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderTime}>
            {new Date(order.createdAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        <View style={styles.orderClient}>
          <Text style={styles.clientName}>{order.customerName}</Text>
          <Text style={styles.clientAddress}>{order.deliveryAddress?.street}</Text>
        </View>
        
        <Text style={styles.orderTotal}>Bs {order.total?.toFixed(2)}</Text>
        
        <View style={[styles.statusBadge, { backgroundColor: state.color + '20' }]}>
          <Ionicons name={state.icon} size={16} color={state.color} />
          <Text style={[styles.statusText, { color: state.color }]}>{state.label}</Text>
        </View>
        
        <View style={styles.deliveryCell}>
          {order.assignedDeliveryCode ? (
            <View style={styles.assignedDelivery}>
              <Text style={styles.deliveryCode}>{order.assignedDeliveryCode}</Text>
              <Text style={styles.deliveryName}>{order.assignedDeliveryName}</Text>
            </View>
          ) : canAssignDelivery ? (
            <TouchableOpacity style={styles.assignButton} onPress={() => { setSelectedOrder(order); setShowDetailModal(true); }}>
              <Text style={styles.assignButtonText}>Asignar</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noDeliveryText}>-</Text>
          )}
        </View>
        
        <View style={styles.actionsCell}>
          <TouchableOpacity style={styles.actionButton} onPress={() => { setSelectedOrder(order); setShowDetailModal(true); }}>
            <Ionicons name="eye" size={20} color={COLORS.info} />
          </TouchableOpacity>
          {!['delivered', 'cancelled'].includes(order.status) && (
            <TouchableOpacity style={styles.actionButton} onPress={() => showStatusMenu(order)}>
              <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const QuickFilters = () => {
    const counts = {
      pending: orders.filter(o => o.status === 'pending').length,
      on_way: orders.filter(o => o.status === 'on_way').length,
      today: orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length
    };
    
    return (
      <View style={styles.quickFilters}>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'pending' && styles.filterChipActive]}
          onPress={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
        >
          <Text style={styles.filterChipText}>Pendientes: {counts.pending}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'on_way' && styles.filterChipActive]}
          onPress={() => setStatusFilter(statusFilter === 'on_way' ? 'all' : 'on_way')}
        >
          <Text style={styles.filterChipText}>En camino: {counts.on_way}</Text>
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
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { width: 120 }]}>Pedido</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Cliente</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Total</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>Estado</Text>
            <Text style={[styles.headerCell, { width: 140 }]}>Delivery</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Acciones</Text>
          </View>
          
          {filteredOrders.map(order => (
            <OrderRow key={order.id} order={order} />
          ))}
          
          {filteredOrders.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No se encontraron pedidos</Text>
            </View>
          )}
        </View>
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
  quickFilters: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.bgTertiary },
  filterChipActive: { backgroundColor: COLORS.accentGold + '20', borderColor: COLORS.accentGold },
  filterChipText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
  table: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  tableHeader: { flexDirection: 'row', paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: COLORS.bgTertiary },
  headerCell: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.bgTertiary },
  orderNumberContainer: { width: 120 },
  orderNumber: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  orderTime: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  orderClient: { flex: 2, paddingRight: 12 },
  clientName: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 2 },
  clientAddress: { fontSize: 12, color: COLORS.textTertiary },
  orderTotal: { width: 100, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  statusBadge: { width: 120, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  deliveryCell: { width: 140, paddingHorizontal: 8 },
  assignedDelivery: {},
  deliveryCode: { fontSize: 13, fontWeight: '600', color: COLORS.accentGold },
  deliveryName: { fontSize: 11, color: COLORS.textTertiary },
  assignButton: { backgroundColor: COLORS.accentGold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  assignButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.bgPrimary },
  noDeliveryText: { fontSize: 14, color: COLORS.textTertiary },
  actionsCell: { width: 100, flexDirection: 'row', gap: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.bgTertiary, justifyContent: 'center', alignItems: 'center' },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textTertiary, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.bgPrimary, borderRadius: 16, padding: 24, width: '100%', maxWidth: 600, maxHeight: '80%' },
  detailModalContent: { backgroundColor: COLORS.bgPrimary, borderRadius: 16, padding: 24, width: '100%', maxWidth: 700, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  orderSummary: { backgroundColor: COLORS.bgSecondary, padding: 16, borderRadius: 12, marginBottom: 16 },
  summaryText: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 12 },
  deliveryOption: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.bgSecondary, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.bgTertiary },
  deliveryInfo: { flex: 1 },
  deliveryNameText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  deliveryCodeText: { fontSize: 13, color: COLORS.accentGold, marginTop: 2 },
  deliveryVehicleText: { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },
  deliveryStats: { alignItems: 'flex-end' },
  statsText: { fontSize: 12, color: COLORS.textSecondary },
  availableText: { color: COLORS.success, fontWeight: '600' },
  busyText: { color: COLORS.warning, fontWeight: '600' },
  detailSection: { marginBottom: 20 },
  detailLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  detailText: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 4 },
  productItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.bgTertiary },
  productName: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  productPrice: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: COLORS.textPrimary },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.bgTertiary, paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  totalValue: { fontSize: 16, fontWeight: '700', color: COLORS.accentGold },
  paymentMethod: { fontSize: 13, color: COLORS.textTertiary, marginTop: 8 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  timelineContent: { marginLeft: 12, flex: 1 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  timelineTime: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 }
});

export default OrdersManagementScreen;
