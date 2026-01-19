import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import { getCurrentAdmin } from '../utils/adminAuth';

const StatsCard = ({ icon, label, value, growth, color }) => (
  <View style={styles.statsCard}>
    <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.statsLabel}>{label}</Text>
    <Text style={styles.statsValue}>{value}</Text>
    {growth !== undefined && (
      <View style={styles.growthContainer}>
        <Ionicons 
          name={growth >= 0 ? 'trending-up' : 'trending-down'} 
          size={16} 
          color={growth >= 0 ? COLORS.success : COLORS.error} 
        />
        <Text style={[styles.growthText, { color: growth >= 0 ? COLORS.success : COLORS.error }]}>
          {Math.abs(growth)}%
        </Text>
      </View>
    )}
  </View>
);

const OrderRow = ({ order, navigation }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return COLORS.warning;
      case 'preparing': return COLORS.info;
      case 'on_way': return COLORS.accentGold;
      case 'delivered': return COLORS.success;
      default: return COLORS.textTertiary;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'on_way': return 'En camino';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };

  return (
    <View style={styles.orderRow}>
      <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
      <Text style={styles.orderCustomer}>{order.customerName}</Text>
      <Text style={styles.orderAmount}>Bs {order.total.toFixed(2)}</Text>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
          {getStatusText(order.status)}
        </Text>
      </View>
    </View>
  );
};

const TopProductItem = ({ product, rank }) => (
  <View style={styles.topProductItem}>
    <View style={styles.rankBadge}>
      <Text style={styles.rankText}>{rank}</Text>
    </View>
    <Text style={styles.productName}>{product.name}</Text>
    <Text style={styles.productSales}>{product.unitsSold} vendidos</Text>
  </View>
);

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    newUsers: 0,
    activeDeliveries: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState(0);
  const [outOfStock, setOutOfStock] = useState(0);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const ordersData = await AsyncStorage.getItem('order_history');
      const orders = ordersData ? JSON.parse(ordersData) : [];
      
      const usersData = await AsyncStorage.getItem('all_users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => 
        new Date(o.createdAt).toDateString() === today
      );
      
      const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
      const newUsers = users.filter(u => 
        new Date(u.createdAt).toDateString() === today
      ).length;
      
      const activeDeliveries = todayOrders.filter(o => o.status === 'on_way').length;
      
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const yesterdayOrders = orders.filter(o => 
        new Date(o.createdAt).toDateString() === yesterday
      );
      const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + o.total, 0);
      
      const salesGrowth = yesterdaySales > 0 
        ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1)
        : 0;
      
      const ordersGrowth = yesterdayOrders.length > 0
        ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length * 100).toFixed(1)
        : 0;
      
      setStats({
        todaySales,
        todayOrders: todayOrders.length,
        newUsers,
        activeDeliveries,
        salesGrowth: parseFloat(salesGrowth),
        ordersGrowth: parseFloat(ordersGrowth),
        usersGrowth: 5
      });
      
      const recent = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
      setRecentOrders(recent);
      
      const productSales = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (productSales[item.id]) {
            productSales[item.id].unitsSold += item.quantity;
          } else {
            productSales[item.id] = {
              id: item.id,
              name: item.name,
              unitsSold: item.quantity
            };
          }
        });
      });
      
      const topProds = Object.values(productSales)
        .sort((a, b) => b.unitsSold - a.unitsSold)
        .slice(0, 5);
      setTopProducts(topProds);
      
      const deliveryApps = await AsyncStorage.getItem('delivery_applications');
      const apps = deliveryApps ? JSON.parse(deliveryApps) : [];
      setPendingDeliveries(apps.filter(a => a.status === 'pending').length);
      
      const productsData = await AsyncStorage.getItem('products');
      const products = productsData ? JSON.parse(productsData) : [];
      setOutOfStock(products.filter(p => p.stock === 0).length);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
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
    loadDashboardData();
    
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  return (
    <AdminLayout title="Dashboard" user={user}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenido, {user.name} 👋</Text>
          <Text style={styles.dateText}>
            Resumen del día - {new Date().toLocaleDateString('es-BO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            icon="cash"
            label="Ventas del día"
            value={`Bs ${stats.todaySales.toFixed(2)}`}
            growth={stats.salesGrowth}
            color={COLORS.success}
          />
          <StatsCard
            icon="receipt"
            label="Pedidos"
            value={stats.todayOrders.toString()}
            growth={stats.ordersGrowth}
            color={COLORS.info}
          />
          <StatsCard
            icon="people"
            label="Usuarios nuevos"
            value={`+${stats.newUsers}`}
            growth={stats.usersGrowth}
            color={COLORS.accentGold}
          />
          <StatsCard
            icon="bicycle"
            label="Deliverys activos"
            value={stats.activeDeliveries.toString()}
            color={COLORS.warning}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pedidos Recientes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersTable}>
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <OrderRow key={order.id} order={order} navigation={navigation} />
              ))
            ) : (
              <Text style={styles.emptyText}>No hay pedidos recientes</Text>
            )}
          </View>
        </View>

        <View style={styles.doubleGrid}>
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Ventas Semanales</Text>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart" size={64} color={COLORS.textTertiary} />
              <Text style={styles.placeholderText}>
                Gráfico disponible en Firebase
              </Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Top 5 Productos</Text>
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <TopProductItem 
                  key={product.id} 
                  product={product} 
                  rank={index + 1} 
                />
              ))
            ) : (
              <Text style={styles.emptyText}>Sin datos aún</Text>
            )}
          </View>
        </View>

        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Solicitudes Pendientes</Text>
          
          {pendingDeliveries > 0 && (
            <TouchableOpacity style={styles.alertCard}>
              <Ionicons name="bicycle" size={24} color={COLORS.warning} />
              <Text style={styles.alertText}>
                {pendingDeliveries} deliverys esperando aprobación
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}

          {outOfStock > 0 && (
            <TouchableOpacity style={styles.alertCard}>
              <Ionicons name="alert-circle" size={24} color={COLORS.error} />
              <Text style={styles.alertText}>
                {outOfStock} productos sin stock
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}

          {pendingDeliveries === 0 && outOfStock === 0 && (
            <View style={styles.noAlertsCard}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
              <Text style={styles.noAlertsText}>Todo en orden ✨</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  statsIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  growthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.accentGold,
    fontWeight: '600',
  },
  ordersTable: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgTertiary,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    width: 100,
  },
  orderCustomer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    width: 100,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  doubleGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  chartCard: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginTop: 12,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgTertiary,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.accentGold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  productSales: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  alertsSection: {
    marginBottom: 32,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  noAlertsCard: {
    backgroundColor: COLORS.success + '10',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  noAlertsText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textTertiary,
    paddingVertical: 32,
  },
});

export default AdminDashboardScreen;
