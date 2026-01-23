import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminLayout from '../components/AdminLayout';
import { getCurrentAdmin } from '../utils/adminAuth';
import KPICard from '../components/KPICard';
import TimelineChart from '../components/TimelineChart';
import TopProductsChart from '../components/TopProductsChart';
import PeakHoursChart from '../components/PeakHoursChart';
import TooltipButton from '../components/TooltipButton';
import TooltipIcon from '../components/TooltipIcon';
import {
  calculateDailyKPIs,
  comparePeriods,
  generateTimelineData,
  calculateTopProducts,
  calculatePeakHours,
  calculateConversionRate
} from '../utils/dashboardAnalytics';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  
  const [dashboardData, setDashboardData] = useState({
    ventasHoy: 0,
    ventasAyer: 0,
    ventasCambio: 0,
    profitHoy: 0,
    profitAyer: 0,
    profitCambio: 0,
    pedidosHoy: 0,
    pedidosAyer: 0,
    pedidosCambio: 0,
    ticketPromedio: 0,
    ticketPromedioAyer: 0,
    ticketPromedioCambio: 0,
    deliverysActivos: 0,
    deliverysDisponibles: 0,
    deliverysOcupados: 0,
    pedidosPendientes: 0,
    pedidosEnCamino: 0,
    nuevosUsuarios: 0,
    tasaConversion: 0,
    timelineData: [],
    topProductos: [],
    peakHours: [],
    metaDiaria: 0,
    progresoMetaDiaria: 0
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const ordersData = await AsyncStorage.getItem('order_history');
      const orders = ordersData ? JSON.parse(ordersData) : [];
      
      const transactionsData = await AsyncStorage.getItem('financial_transactions');
      const transactions = transactionsData ? JSON.parse(transactionsData) : [];
      
      const deliveriesData = await AsyncStorage.getItem('active_deliveries');
      const deliveries = deliveriesData ? JSON.parse(deliveriesData) : [];
      
      const usersData = await AsyncStorage.getItem('all_users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      const goalsData = await AsyncStorage.getItem('financial_goals');
      const goals = goalsData ? JSON.parse(goalsData) : null;

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const kpisHoy = calculateDailyKPIs(orders, transactions, today);
      const kpisAyer = calculateDailyKPIs(orders, transactions, yesterday);
      const comparison = comparePeriods(kpisHoy, kpisAyer);

      const deliverysDisponibles = deliveries.filter(d => d.estado === 'disponible').length;
      const deliverysOcupados = deliveries.filter(d => d.estado === 'ocupado').length;
      
      const pedidosPendientes = orders.filter(o => o.estado === 'pendiente').length;
      const pedidosEnCamino = orders.filter(o => o.estado === 'en_camino').length;

      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const nuevosUsuarios = users.filter(u => {
        const userDate = new Date(u.fechaRegistro || u.createdAt);
        return userDate >= todayStart;
      }).length;

      const tasaConversion = calculateConversionRate(users, orders);

      const timelineData = generateTimelineData(orders, transactions, selectedPeriod);
      const topProductos = calculateTopProducts(orders, 5);
      const peakHours = calculatePeakHours(orders);

      let metaDiaria = 0;
      let progresoMetaDiaria = 0;
      if (goals && goals.diaria && goals.diaria.activa) {
        metaDiaria = goals.diaria.monto;
        progresoMetaDiaria = metaDiaria > 0 ? (kpisHoy.profit / metaDiaria) * 100 : 0;
      }

      setDashboardData({
        ventasHoy: kpisHoy.ventas,
        ventasAyer: kpisAyer.ventas,
        ventasCambio: comparison.ventasCambio,
        profitHoy: kpisHoy.profit,
        profitAyer: kpisAyer.profit,
        profitCambio: comparison.profitCambio,
        pedidosHoy: kpisHoy.pedidosCompletados,
        pedidosAyer: kpisAyer.pedidosCompletados,
        pedidosCambio: comparison.pedidosCambio,
        ticketPromedio: kpisHoy.ticketPromedio,
        ticketPromedioAyer: kpisAyer.ticketPromedio,
        ticketPromedioCambio: comparison.ticketPromedioCambio,
        deliverysActivos: deliveries.length,
        deliverysDisponibles,
        deliverysOcupados,
        pedidosPendientes,
        pedidosEnCamino,
        nuevosUsuarios,
        tasaConversion,
        timelineData,
        topProductos,
        peakHours,
        metaDiaria,
        progresoMetaDiaria
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }, [selectedPeriod]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  }, [loadDashboardData]);

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadDashboardData();
      setIsLoading(false);
    };
    if (user) {
      loadData();
    }
  }, [user, loadDashboardData]);

  const getTimeSinceUpdate = () => {
    const diff = Math.floor((new Date() - lastUpdate) / 1000 / 60);
    if (diff < 1) return 'Hace menos de 1 minuto';
    if (diff === 1) return 'Hace 1 minuto';
    return `Hace ${diff} minutos`;
  };

  const alerts = useMemo(() => {
    const alertList = [];
    if (dashboardData.profitHoy < 0) {
      alertList.push({ icon: 'warning', text: '⚠️ Profit negativo hoy. Revisa gastos.', color: '#FF3B30' });
    }
    if (dashboardData.pedidosPendientes > 5) {
      alertList.push({ icon: 'time', text: `⚠️ Tienes ${dashboardData.pedidosPendientes} pedidos pendientes por confirmar.`, color: '#FF9500' });
    }
    if (dashboardData.deliverysDisponibles === 0 && dashboardData.deliverysActivos > 0) {
      alertList.push({ icon: 'bicycle', text: '⚠️ No hay deliverys disponibles.', color: '#FF9500' });
    }
    if (dashboardData.metaDiaria > 0 && dashboardData.progresoMetaDiaria >= 100) {
      alertList.push({ icon: 'trophy', text: '✅ ¡Meta del día alcanzada!', color: '#34C759' });
    }
    return alertList;
  }, [dashboardData]);

  if (!user) return null;

  return (
    <AdminLayout title="Dashboard Ejecutivo" user={user}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FFB800"
            colors={['#FFB800']}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard Ejecutivo</Text>
            <Text style={styles.subtitle}>Vista general del negocio</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.updateText}>{getTimeSinceUpdate()}</Text>
            <TooltipButton
              icon="reload"
              tooltip="Actualizar datos"
              onPress={handleRefresh}
              variant="secondary"
              size="medium"
              iconOnly
            />
          </View>
        </View>

        <View style={styles.kpiScroll}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kpiContainer}
          >
            <KPICard
              title="Ventas del Día"
              value={`Bs ${dashboardData.ventasHoy.toFixed(2)}`}
              comparison={`${dashboardData.ventasCambio >= 0 ? '+' : ''}${dashboardData.ventasCambio.toFixed(1)}% vs ayer`}
              comparisonValue={dashboardData.ventasCambio}
              icon="cash"
              color="#34C759"
              tooltip="Total de ventas completadas hoy"
            />
            <KPICard
              title="Profit del Día"
              value={`Bs ${dashboardData.profitHoy.toFixed(2)}`}
              comparison={`${dashboardData.profitCambio >= 0 ? '+' : ''}${dashboardData.profitCambio.toFixed(1)}% vs ayer`}
              comparisonValue={dashboardData.profitCambio}
              icon="trending-up"
              color="#FFB800"
              tooltip="Ganancia neta (ingresos - gastos) del día"
            />
            <KPICard
              title="Pedidos Completados"
              value={`${dashboardData.pedidosHoy} pedidos`}
              comparison={`${dashboardData.pedidosCambio >= 0 ? '+' : ''}${Math.abs(dashboardData.pedidosCambio)} vs ayer`}
              comparisonValue={dashboardData.pedidosCambio}
              icon="checkmark-circle"
              color="#007AFF"
              tooltip="Pedidos completados exitosamente hoy"
            />
            <KPICard
              title="Ticket Promedio"
              value={`Bs ${dashboardData.ticketPromedio.toFixed(2)}`}
              comparison={`${dashboardData.ticketPromedioCambio >= 0 ? '+' : ''}${dashboardData.ticketPromedioCambio.toFixed(1)}% vs ayer`}
              comparisonValue={dashboardData.ticketPromedioCambio}
              icon="receipt"
              color="#AF52DE"
              tooltip="Valor promedio por pedido (total ventas / pedidos)"
            />
          </ScrollView>
        </View>
        {dashboardData.metaDiaria > 0 && (
          <View style={styles.goalSection}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Meta del Día</Text>
              <TooltipIcon tooltip="Objetivo de profit para hoy" />
            </View>
            <View style={styles.goalCard}>
              <View style={styles.goalValues}>
                <View>
                  <Text style={styles.goalLabel}>Meta</Text>
                  <Text style={styles.goalValue}>Bs {dashboardData.metaDiaria.toFixed(2)}</Text>
                </View>
                <View>
                  <Text style={styles.goalLabel}>Actual</Text>
                  <Text style={styles.goalValue}>Bs {dashboardData.profitHoy.toFixed(2)}</Text>
                </View>
                <View>
                  <Text style={styles.goalLabel}>Progreso</Text>
                  <Text style={[styles.goalValue, { color: dashboardData.progresoMetaDiaria >= 100 ? '#34C759' : '#FFB800' }]}>
                    {dashboardData.progresoMetaDiaria.toFixed(0)}%
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${Math.min(dashboardData.progresoMetaDiaria, 100)}%` }]} />
              </View>
              {dashboardData.progresoMetaDiaria >= 100 && (
                <View style={styles.goalAchieved}>
                  <Text style={styles.goalAchievedText}>¡Meta Alcanzada! 🎉</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Rendimiento - Últimos {selectedPeriod} Días</Text>
              <TooltipIcon tooltip="Gráfica de evolución de ingresos y profits" />
            </View>
            <View style={styles.periodButtons}>
              <TooltipButton
                label="7 días"
                tooltip="Cambiar a vista de 7 días"
                onPress={() => setSelectedPeriod(7)}
                variant={selectedPeriod === 7 ? 'primary' : 'secondary'}
                size="small"
              />
              <TooltipButton
                label="30 días"
                tooltip="Cambiar a vista de 30 días"
                onPress={() => setSelectedPeriod(30)}
                variant={selectedPeriod === 30 ? 'primary' : 'secondary'}
                size="small"
              />
            </View>
          </View>
          <TimelineChart 
            data={dashboardData.timelineData}
            showIngresos={true}
            showProfit={true}
          />
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.gridCard, { flex: 1 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Estado Operativo</Text>
              <TooltipIcon tooltip="Estado actual de repartidores" />
            </View>
            <View style={styles.operationalGrid}>
              <View style={styles.operationalItem}>
                <Ionicons name="bicycle" size={32} color="#FFB800" />
                <Text style={styles.operationalValue}>{dashboardData.deliverysActivos}</Text>
                <Text style={styles.operationalLabel}>Total Activos</Text>
              </View>
              <View style={styles.operationalItem}>
                <Ionicons name="checkmark-circle" size={32} color="#34C759" />
                <Text style={styles.operationalValue}>{dashboardData.deliverysDisponibles}</Text>
                <Text style={styles.operationalLabel}>Disponibles</Text>
              </View>
              <View style={styles.operationalItem}>
                <Ionicons name="time" size={32} color="#FF9500" />
                <Text style={styles.operationalValue}>{dashboardData.deliverysOcupados}</Text>
                <Text style={styles.operationalLabel}>Ocupados</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.operationalGrid}>
              <View style={styles.operationalItem}>
                <Ionicons name="hourglass" size={32} color="#FF9500" />
                <Text style={styles.operationalValue}>{dashboardData.pedidosPendientes}</Text>
                <Text style={styles.operationalLabel}>Pendientes</Text>
              </View>
              <View style={styles.operationalItem}>
                <Ionicons name="car" size={32} color="#007AFF" />
                <Text style={styles.operationalValue}>{dashboardData.pedidosEnCamino}</Text>
                <Text style={styles.operationalLabel}>En Camino</Text>
              </View>
              <View style={styles.operationalItem}>
                <Ionicons name="person-add" size={32} color="#AF52DE" />
                <Text style={styles.operationalValue}>+{dashboardData.nuevosUsuarios}</Text>
                <Text style={styles.operationalLabel}>Nuevos Hoy</Text>
              </View>
            </View>
          </View>

          <View style={[styles.gridCard, { flex: 1 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Top 5 Productos Más Vendidos</Text>
              <TooltipButton
                label="Ver todos →"
                tooltip="Ir a gestión de productos"
                onPress={() => navigation.navigate('Products')}
                variant="secondary"
                size="small"
              />
            </View>
            <TopProductsChart products={dashboardData.topProductos} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Horarios Pico de Pedidos</Text>
              <TooltipIcon tooltip="Horas del día con mayor actividad de pedidos" />
            </View>
          </View>
          <PeakHoursChart hoursData={dashboardData.peakHours} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <View style={styles.quickActions}>
            <TooltipButton
              icon="list"
              label="Gestionar Pedidos"
              tooltip="Ir a gestión de pedidos"
              onPress={() => navigation.navigate('Orders')}
              variant="secondary"
              size="large"
            />
            <TooltipButton
              icon="add-circle"
              label="Nuevo Producto"
              tooltip="Crear producto en el catálogo"
              onPress={() => navigation.navigate('Products')}
              variant="primary"
              size="large"
            />
            <TooltipButton
              icon="wallet"
              label="Finanzas"
              tooltip="Ir a gestión financiera"
              onPress={() => navigation.navigate('Financial')}
              variant="secondary"
              size="large"
            />
            <TooltipButton
              icon="cash-outline"
              label="Registrar Gasto"
              tooltip="Registrar un nuevo gasto operativo"
              onPress={() => navigation.navigate('Financial')}
              variant="danger"
              size="large"
            />
          </View>
        </View>

        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alertas</Text>
            <View style={styles.alertsContainer}>
              {alerts.map((alert, index) => (
                <View key={index} style={[styles.alertCard, { borderLeftColor: alert.color }]}>
                  <Ionicons name={alert.icon} size={24} color={alert.color} />
                  <Text style={styles.alertText}>{alert.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  updateText: {
    fontSize: 12,
    color: '#8E8E93'
  },
  kpiScroll: {
    marginBottom: 32
  },
  kpiContainer: {
    paddingHorizontal: 0,
    gap: 16
  },
  goalSection: {
    marginBottom: 32
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  goalCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#FFB800'
  },
  goalValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  goalLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4
  },
  goalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 6,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFB800',
    borderRadius: 6
  },
  goalAchieved: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#34C75920',
    borderRadius: 12,
    alignItems: 'center'
  },
  goalAchievedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759'
  },
  section: {
    marginBottom: 32
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8
  },
  gridRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32
  },
  gridCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  operationalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16
  },
  operationalItem: {
    alignItems: 'center',
    gap: 8
  },
  operationalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  operationalLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 8
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  alertsContainer: {
    gap: 12
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF'
  }
});

export default AdminDashboardScreen;
