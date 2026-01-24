import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AdminLayout from '../components/AdminLayout';
import { getCurrentAdmin } from '../utils/adminAuth';
import firebaseOrderService from '../../services/firebaseOrderService';
import firebaseFinanceService from '../../services/firebaseFinanceService';
import firebaseProductService from '../../services/firebaseProductService';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime() && o.status === 'entregado';
    });
    
    const todayTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      txDate.setHours(0, 0, 0, 0);
      return txDate.getTime() === today.getTime();
    });
    
    const ventasHoy = todayTransactions.filter(t => t.type === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
    const gastosHoy = todayTransactions.filter(t => t.type === 'gasto').reduce((sum, t) => sum + t.amount, 0);
    const profitHoy = ventasHoy - gastosHoy;
    const pedidosHoy = todayOrders.length;
    const ticketPromedio = pedidosHoy > 0 ? ventasHoy / pedidosHoy : 0;
    
    const pendientes = orders.filter(o => o.status === 'pendiente').length;
    const enCamino = orders.filter(o => o.status === 'en_camino').length;
    const stockBajo = products.filter(p => p.stock <= (p.minStock || 5)).length;
    
    return {
      ventasHoy,
      gastosHoy,
      profitHoy,
      pedidosHoy,
      ticketPromedio,
      pendientes,
      enCamino,
      stockBajo
    };
  }, [orders, transactions, products]);

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
    
    const unsubOrders = firebaseOrderService.subscribeToOrders((data) => {
      setOrders(data);
    });
    
    const unsubTransactions = firebaseFinanceService.subscribeToTransactions((data) => {
      setTransactions(data);
    });
    
    const unsubProducts = firebaseProductService.subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    
    return () => {
      if (unsubOrders) unsubOrders();
      if (unsubTransactions) unsubTransactions();
      if (unsubProducts) unsubProducts();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  if (!user) return null;

  return (
    <AdminLayout title="Dashboard" user={user}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFB800" />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Bienvenido {user?.name || 'Admin'}</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
            <Ionicons name="reload" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Ionicons name="cash" size={32} color="#34C759" />
            <Text style={styles.kpiValue}>Bs {summary.ventasHoy.toFixed(2)}</Text>
            <Text style={styles.kpiLabel}>Ventas Hoy</Text>
          </View>
          
          <View style={styles.kpiCard}>
            <Ionicons name="trending-up" size={32} color="#FFB800" />
            <Text style={styles.kpiValue}>Bs {summary.profitHoy.toFixed(2)}</Text>
            <Text style={styles.kpiLabel}>Profit Hoy</Text>
          </View>
          
          <View style={styles.kpiCard}>
            <Ionicons name="receipt" size={32} color="#007AFF" />
            <Text style={styles.kpiValue}>{summary.pedidosHoy}</Text>
            <Text style={styles.kpiLabel}>Pedidos Hoy</Text>
          </View>
          
          <View style={styles.kpiCard}>
            <Ionicons name="wallet" size={32} color="#AF52DE" />
            <Text style={styles.kpiValue}>Bs {summary.ticketPromedio.toFixed(2)}</Text>
            <Text style={styles.kpiLabel}>Ticket Promedio</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Orders')}>
              <Ionicons name="list" size={32} color="#FFB800" />
              <Text style={styles.actionText}>Pedidos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Products')}>
              <Ionicons name="cube" size={32} color="#FFB800" />
              <Text style={styles.actionText}>Productos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Financial')}>
              <Ionicons name="wallet" size={32} color="#FFB800" />
              <Text style={styles.actionText}>Finanzas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(summary.pendientes > 0 || summary.stockBajo > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alertas</Text>
            {summary.pendientes > 0 && (
              <View style={styles.alertCard}>
                <Ionicons name="time" size={24} color="#FF9500" />
                <Text style={styles.alertText}>{summary.pendientes} pedidos pendientes</Text>
              </View>
            )}
            {summary.stockBajo > 0 && (
              <View style={styles.alertCard}>
                <Ionicons name="warning" size={24} color="#FF3B30" />
                <Text style={styles.alertText}>{summary.stockBajo} productos con stock bajo</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center' },
  kpiContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 20, marginBottom: 24 },
  kpiCard: { flex: 1, minWidth: 150, backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#2C2C2E' },
  kpiValue: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginTop: 12 },
  kpiLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { flex: 1, minWidth: 100, backgroundColor: '#1C1C1E', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FFB800' },
  actionText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginTop: 8 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#FF9500' },
  alertText: { flex: 1, fontSize: 14, color: '#FFFFFF' }
});

export default AdminDashboardScreen;
