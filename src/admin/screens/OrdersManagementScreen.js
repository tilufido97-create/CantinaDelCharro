import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState(null);

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
      const updatedOrders = orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
      );
      await AsyncStorage.setItem('order_history', JSON.stringify(updatedOrders));
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
      await AsyncStorage.setItem('order_history', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      setShowAssignModal(false);
      Alert.alert('Éxito', `Pedido asignado a ${delivery.name}`);
    } catch (error) {
      console.error('Error assigning delivery:', error);
      Alert.alert('Error', 'No se pudo asignar el delivery');
    }
  };

  const cancelOrder = (order) => {
    Alert.alert(
      'Cancelar pedido',
      `¿Estás seguro de cancelar el pedido #${order.orderNumber}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => updateOrderStatus(order.id, 'cancelled') }
      ]
    );
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
    const nextStates = getNextStates(order.status);
    const options = nextStates.map(state => ({
      text: `Cambiar a: ${ORDER_STATES[state].label}`,
      onPress: () => updateOrderStatus(order.id, state)
    }));
    options.push({ text: 'Cancelar pedido', onPress: () => cancelOrder(order), style: 'destructive' });
    options.push({ text: 'Cerrar', style: 'cancel' });
    Alert.alert(`Pedido #${order.orderNumber}`, 'Selecciona una acción', options);
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
            <TouchableOpacity style={styles.assignButton} onPress={() => { setAssigningOrder(order); setShowAssignModal(true); }}>
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

      <AssignDeliveryModal />
      <OrderDetailModal />
    </AdminLayout>
  );

  function AssignDeliveryModal() {
    return (
      <Modal visible={showAssignModal} animationType="slide" transparent={true} onRequestClose={() => setShowAssignModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Asignar Delivery</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {assigningOrder && (
              <View style={styles.orderSummary}>
                <Text style={styles.summaryText}>Pedido: #{assigningOrder.orderNumber}</Text>
                <Text style={styles.summaryText}>Cliente: {assigningOrder.customerName}</Text>
                <Text style={styles.summaryText}>Dirección: {assigningOrder.deliveryAddress?.street}</Text>
              </View>
            )}
            
            <Text style={styles.sectionTitle}>Deliverys Disponibles:</Text>
            
            <FlatList
              data={deliveries.filter(d => d.status === 'active')}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.deliveryOption} onPress={() => assignDelivery(assigningOrder.id, item.id)}>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryNameText}>{item.name}</Text>
                    <Text style={styles.deliveryCodeText}>{item.code}</Text>
                    <Text style={styles.deliveryVehicleText}>{item.vehicleType} - {item.vehiclePlate}</Text>
                  </View>
                  <View style={styles.deliveryStats}>
                    <Text style={styles.statsText}>{item.completedToday || 0} entregas hoy</Text>
                    <Text style={[styles.statsText, item.available ? styles.availableText : styles.busyText]}>
                      {item.available ? '✓ Disponible' : '⏳ Ocupado'}
                    </Text>
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
          </View>
        </View>
      </Modal>
    );
  }

  function OrderDetailModal() {
    if (!selectedOrder) return null;
    
    return (
      <Modal visible={showDetailModal} animationType="slide" transparent={true} onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detalle del Pedido #{selectedOrder.orderNumber}</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <Ionicons name="close" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Estado:</Text>
                <View style={[styles.statusBadge, { backgroundColor: ORDER_STATES[selectedOrder.status].color + '20' }]}>
                  <Ionicons name={ORDER_STATES[selectedOrder.status].icon} size={20} color={ORDER_STATES[selectedOrder.status].color} />
                  <Text style={[styles.statusText, { color: ORDER_STATES[selectedOrder.status].color }]}>
                    {ORDER_STATES[selectedOrder.status].label}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Cliente</Text>
                <Text style={styles.detailText}>Nombre: {selectedOrder.customerName}</Text>
                <Text style={styles.detailText}>Teléfono: {selectedOrder.customerPhone || 'N/A'}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Dirección de entrega</Text>
                <Text style={styles.detailText}>{selectedOrder.deliveryAddress?.street}</Text>
                <Text style={styles.detailText}>{selectedOrder.deliveryAddress?.zone}</Text>
                {selectedOrder.deliveryAddress?.reference && (
                  <Text style={styles.detailText}>Ref: {selectedOrder.deliveryAddress.reference}</Text>
                )}
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Productos</Text>
                {selectedOrder.items?.map((item, index) => (
                  <View key={index} style={styles.productItem}>
                    <Text style={styles.productName}>{item.quantity}x {item.name}</Text>
                    <Text style={styles.productPrice}>Bs {(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Resumen</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>Bs {selectedOrder.subtotal?.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery:</Text>
                  <Text style={styles.summaryValue}>Bs {selectedOrder.delivery?.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>TOTAL:</Text>
                  <Text style={styles.totalValue}>Bs {selectedOrder.total?.toFixed(2)}</Text>
                </View>
                <Text style={styles.paymentMethod}>
                  Método: {selectedOrder.paymentMethod === 'cash' ? 'Efectivo' : 'QR'}
                </Text>
              </View>
              
              {selectedOrder.assignedDeliveryCode && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Delivery Asignado</Text>
                  <Text style={styles.detailText}>Código: {selectedOrder.assignedDeliveryCode}</Text>
                  <Text style={styles.detailText}>Nombre: {selectedOrder.assignedDeliveryName}</Text>
                </View>
              )}
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Timeline</Text>
                <View style={styles.timelineItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineLabel}>Pedido creado</Text>
                    <Text style={styles.timelineTime}>{new Date(selectedOrder.createdAt).toLocaleString('es-BO')}</Text>
                  </View>
                </View>
                {selectedOrder.assignedAt && (
                  <View style={styles.timelineItem}>
                    <Ionicons name="bicycle" size={20} color={COLORS.accentGold} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>Delivery asignado</Text>
                      <Text style={styles.timelineTime}>{new Date(selectedOrder.assignedAt).toLocaleString('es-BO')}</Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }
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
