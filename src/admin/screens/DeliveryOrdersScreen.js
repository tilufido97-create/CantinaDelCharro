import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import { getCurrentAdmin } from '../utils/adminAuth';
import firebaseOrderService from '../../services/firebaseOrderService';
import { ref, get } from 'firebase/database';
import { database } from '../../config/firebase';

export default function DeliveryOrdersScreen() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRepartidor, setSelectedRepartidor] = useState(null);

  const loadRepartidores = async () => {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      const reps = Object.entries(users)
        .filter(([id, userData]) => userData.role === 'repartidor')
        .map(([id, userData]) => ({ id, ...userData }));
      setRepartidores(reps);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
    loadRepartidores();
    
    const unsubscribe = firebaseOrderService.subscribeToOrders((ordersData) => {
      const available = ordersData.filter(o => 
        (o.status === 'preparando' || o.status === 'listo_delivery') && 
        o.deliveryType === 'delivery' && 
        !o.assignedDeliveryId
      );
      setOrders(available);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const assignOrder = async () => {
    if (!selectedRepartidor) {
      alert('Selecciona un repartidor');
      return;
    }
    
    const result = await firebaseOrderService.assignDelivery(
      selectedOrder.id,
      selectedRepartidor.id,
      selectedRepartidor.name
    );
    
    if (result.success) {
      alert('Pedido asignado exitosamente');
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedRepartidor(null);
    } else {
      alert('Error al asignar pedido');
    }
  };

  const autoAssign = async (order) => {
    const result = await firebaseOrderService.assignDelivery(
      order.id,
      user.id,
      user.name
    );
    
    if (result.success) {
      alert('Pedido asignado a ti');
    } else {
      alert('Error al asignar pedido');
    }
  };

  if (!user) return null;

  const isRepartidor = user.role === 'repartidor';
  const isAdmin = user.role === 'admin';

  return (
    <AdminLayout title="Pedidos Disponibles" user={user}>
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos listos para entrega</Text>
        <Text style={styles.subtitle}>{orders.length} pedidos disponibles</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accentGold} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.ordersContainer}>
          {orders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                <Text style={styles.orderTotal}>Bs {order.total?.toFixed(2)}</Text>
              </View>
              
              <View style={styles.orderBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.infoText}>{order.customerName}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.infoText}>
                    {order.deliveryAddress?.street || order.deliveryAddress?.zona}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="cube-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.infoText}>
                    {order.items?.length} producto{order.items?.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              
              <View style={styles.orderFooter}>
                {isRepartidor && (
                  <TouchableOpacity 
                    style={styles.assignBtn}
                    onPress={() => autoAssign(order)}
                  >
                    <Ionicons name="bicycle" size={20} color={COLORS.bgPrimary} />
                    <Text style={styles.assignBtnText}>Tomar Pedido</Text>
                  </TouchableOpacity>
                )}
                
                {isAdmin && (
                  <TouchableOpacity 
                    style={styles.assignBtn}
                    onPress={() => {
                      setSelectedOrder(order);
                      setShowAssignModal(true);
                    }}
                  >
                    <Ionicons name="person-add" size={20} color={COLORS.bgPrimary} />
                    <Text style={styles.assignBtnText}>Asignar Repartidor</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          
          {orders.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="bicycle-outline" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No hay pedidos disponibles</Text>
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={showAssignModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Asignar Repartidor</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Pedido #{selectedOrder?.orderNumber}
            </Text>
            
            <ScrollView style={styles.repartidoresList}>
              {repartidores.map(rep => (
                <TouchableOpacity
                  key={rep.id}
                  style={[
                    styles.repartidorCard,
                    selectedRepartidor?.id === rep.id && styles.repartidorCardSelected
                  ]}
                  onPress={() => setSelectedRepartidor(rep)}
                >
                  <View style={styles.repartidorInfo}>
                    <Ionicons name="person-circle" size={40} color={COLORS.accentGold} />
                    <View style={styles.repartidorDetails}>
                      <Text style={styles.repartidorName}>{rep.name}</Text>
                      <Text style={styles.repartidorPhone}>{rep.phone}</Text>
                    </View>
                  </View>
                  {selectedRepartidor?.id === rep.id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.accentGold} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.confirmBtn}
              onPress={assignOrder}
            >
              <Text style={styles.confirmBtnText}>Confirmar Asignación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  ordersContainer: { flex: 1 },
  orderCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  orderNumber: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  orderTotal: { fontSize: 18, fontWeight: '700', color: COLORS.accentGold },
  orderBody: { gap: 12, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  orderFooter: { paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.bgTertiary },
  assignBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentGold, padding: 14, borderRadius: 12, gap: 8 },
  assignBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.bgPrimary },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textTertiary, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 24, width: '100%', maxWidth: 500, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  repartidoresList: { maxHeight: 300, marginBottom: 20 },
  repartidorCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.bgTertiary, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  repartidorCardSelected: { borderColor: COLORS.accentGold },
  repartidorInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  repartidorDetails: { gap: 4 },
  repartidorName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  repartidorPhone: { fontSize: 13, color: COLORS.textSecondary },
  confirmBtn: { backgroundColor: COLORS.accentGold, padding: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.bgPrimary }
});
