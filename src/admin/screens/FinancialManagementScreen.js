import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import TransactionModal from '../components/TransactionModal';
import TooltipButton from '../components/TooltipButton';
import TooltipIcon from '../components/TooltipIcon';
import { getCurrentAdmin } from '../utils/adminAuth';
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  PERIOD_FILTERS,
  formatCurrency,
  calculateProfitMargin,
  filterTransactionsByPeriod,
  generateTransactionId,
  exportTransactionsToCSV
} from '../utils/financialCalculator';

const CATEGORY_ICONS = {
  [TRANSACTION_CATEGORIES.VENTAS]: { icon: 'arrow-up', color: COLORS.success },
  [TRANSACTION_CATEGORIES.INVENTARIO]: { icon: 'cart', color: '#FF9500' },
  [TRANSACTION_CATEGORIES.SALARIOS]: { icon: 'people', color: '#007AFF' },
  [TRANSACTION_CATEGORIES.OPERATIVOS]: { icon: 'settings', color: '#AF52DE' },
  [TRANSACTION_CATEGORIES.OTROS]: { icon: 'ellipsis-horizontal', color: '#8E8E93' }
};

const FinancialManagementScreen = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_FILTERS.ALL);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const summary = useMemo(() => {
    const ingresos = filteredTransactions.filter(t => t.tipo === TRANSACTION_TYPES.INGRESO);
    const gastos = filteredTransactions.filter(t => t.tipo.startsWith('gasto_'));
    
    const totalIngresos = ingresos.reduce((sum, t) => sum + t.monto, 0);
    const totalGastos = gastos.reduce((sum, t) => sum + t.monto, 0);
    const profit = totalIngresos - totalGastos;
    
    return {
      totalIngresos,
      totalGastos,
      profit,
      porcentajeProfit: calculateProfitMargin(totalIngresos, totalGastos),
      transaccionesIngresos: ingresos.length,
      transaccionesGastos: gastos.length
    };
  }, [filteredTransactions]);

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const txnData = await AsyncStorage.getItem('financial_transactions');
      let txns = txnData ? JSON.parse(txnData) : [];
      
      const newIncome = await generateIncomeFromOrders();
      if (newIncome > 0) {
        const updatedData = await AsyncStorage.getItem('financial_transactions');
        txns = updatedData ? JSON.parse(updatedData) : [];
      }
      
      txns.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setTransactions(txns);
      applyFilters(txns, selectedPeriod, selectedCategory);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'No se pudieron cargar las transacciones');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, selectedCategory]);

  const generateIncomeFromOrders = async () => {
    try {
      const ordersData = await AsyncStorage.getItem('order_history');
      if (!ordersData) return 0;
      
      const orders = JSON.parse(ordersData);
      const completedOrders = orders.filter(o => o.status === 'delivered');
      
      const txnData = await AsyncStorage.getItem('financial_transactions');
      const existingTxns = txnData ? JSON.parse(txnData) : [];
      const existingOrderIds = new Set(existingTxns.filter(t => t.orderId).map(t => t.orderId));
      
      const newTransactions = [];
      completedOrders.forEach(order => {
        if (!existingOrderIds.has(order.id)) {
          newTransactions.push({
            id: generateTransactionId(),
            tipo: TRANSACTION_TYPES.INGRESO,
            categoria: TRANSACTION_CATEGORIES.VENTAS,
            monto: order.total || 0,
            descripcion: `Venta - Pedido #${order.orderNumber}`,
            fecha: order.deliveredAt || order.createdAt,
            orderId: order.id,
            metodoPago: order.paymentMethod,
            clienteNombre: order.customerName
          });
        }
      });
      
      if (newTransactions.length > 0) {
        const allTxns = [...existingTxns, ...newTransactions];
        await AsyncStorage.setItem('financial_transactions', JSON.stringify(allTxns));
      }
      
      return newTransactions.length;
    } catch (error) {
      console.error('Error generating income:', error);
      return 0;
    }
  };

  const applyFilters = (txns, period, category) => {
    let filtered = [...txns];
    
    filtered = filterTransactionsByPeriod(filtered, period);
    
    if (category !== 'todas') {
      filtered = filtered.filter(t => t.categoria === category);
    }
    
    setFilteredTransactions(filtered);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    applyFilters(transactions, period, selectedCategory);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    applyFilters(transactions, selectedPeriod, category);
  };

  const handleCreateExpense = () => {
    setSelectedTransaction(null);
    setIsModalVisible(true);
  };

  const handleEditTransaction = (transaction) => {
    if (transaction.tipo === TRANSACTION_TYPES.INGRESO) {
      Alert.alert('No permitido', 'No puedes editar ingresos automáticos generados desde pedidos');
      return;
    }
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      let updatedTransactions;
      
      if (selectedTransaction) {
        updatedTransactions = transactions.map(t =>
          t.id === selectedTransaction.id
            ? { ...transactionData, id: t.id, tipo: t.tipo, fechaModificacion: new Date().toISOString() }
            : t
        );
        Alert.alert('Éxito', 'Gasto actualizado correctamente');
      } else {
        const newTransaction = {
          ...transactionData,
          id: generateTransactionId(),
          tipo: `gasto_${transactionData.categoria}`,
          fecha: transactionData.fecha || new Date().toISOString()
        };
        updatedTransactions = [newTransaction, ...transactions];
        Alert.alert('Éxito', 'Gasto registrado correctamente');
      }
      
      await AsyncStorage.setItem('financial_transactions', JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
      applyFilters(updatedTransactions, selectedPeriod, selectedCategory);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = (transaction) => {
    if (transaction.tipo === TRANSACTION_TYPES.INGRESO) {
      Alert.alert('No permitido', 'No puedes eliminar ingresos automáticos');
      return;
    }
    
    Alert.alert(
      '⚠️ Eliminar Transacción',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = transactions.filter(t => t.id !== transaction.id);
              await AsyncStorage.setItem('financial_transactions', JSON.stringify(updated));
              setTransactions(updated);
              applyFilters(updated, selectedPeriod, selectedCategory);
              Alert.alert('Éxito', 'Transacción eliminada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la transacción');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    try {
      const csv = exportTransactionsToCSV(filteredTransactions);
      Alert.alert(
        'Exportar Datos',
        `Se generó un archivo CSV con ${filteredTransactions.length} transacciones.\n\nEn web: se descargará automáticamente.\nEn móvil: copia el contenido.`,
        [{ text: 'OK' }]
      );
      console.log('CSV Data:', csv);
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar los datos');
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
    loadTransactions();
  }, []);

  const SummaryCard = ({ title, value, subtitle, gradient, icon, isProfit, tooltip }) => (
    <View style={styles.summaryCard}>
      <LinearGradient 
        colors={gradient} 
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Ionicons name={icon} size={32} color="#FFF" style={styles.cardIcon} />
            {tooltip && <TooltipIcon tooltip={tooltip} color="#FFF" size={18} />}
          </View>
          <Text style={styles.cardLabel}>{title}</Text>
          <Text style={[styles.cardValue, isProfit && summary.profit < 0 && { color: '#FF3B30' }]}>
            {value}
          </Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const TransactionItem = ({ item }) => {
    const isIncome = item.tipo === TRANSACTION_TYPES.INGRESO;
    const categoryInfo = CATEGORY_ICONS[item.categoria] || CATEGORY_ICONS[TRANSACTION_CATEGORIES.OTROS];
    
    return (
      <View style={[styles.transactionCard, { borderLeftColor: categoryInfo.color }]}>
        <View style={[styles.iconCircle, { backgroundColor: categoryInfo.color + '20' }]}>
          <Ionicons name={categoryInfo.icon} size={24} color={categoryInfo.color} />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDesc}>{item.descripcion}</Text>
          <Text style={styles.transactionCategory}>{item.categoria}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.fecha).toLocaleString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
          {item.clienteNombre && <Text style={styles.transactionClient}>{item.clienteNombre}</Text>}
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, { color: isIncome ? COLORS.success : COLORS.error }]}>
            {isIncome ? '+' : '-'} {formatCurrency(item.monto)}
          </Text>
          {isIncome ? (
            <View style={styles.autoBadge}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.autoBadgeText}>Auto</Text>
                <TooltipIcon 
                  tooltip="Ingreso generado automáticamente desde un pedido completado. No se puede editar ni eliminar."
                  size={14}
                  color={COLORS.textTertiary}
                />
              </View>
            </View>
          ) : (
            <View style={styles.transactionActions}>
              <TooltipButton
                icon="pencil"
                tooltip="Editar detalles de este gasto"
                onPress={() => handleEditTransaction(item)}
                variant="secondary"
                size="small"
                iconOnly
              />
              <TooltipButton
                icon="trash"
                tooltip="Eliminar este gasto del registro"
                onPress={() => handleDeleteTransaction(item)}
                variant="danger"
                size="small"
                iconOnly
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!user) return null;

  return (
    <AdminLayout title="Gestión Financiera" user={user}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gestión Financiera</Text>
          <Text style={styles.headerSubtitle}>Control de ingresos y gastos</Text>
        </View>
        <View style={styles.headerActions}>
          <TooltipButton
            icon="reload"
            tooltip="Recargar transacciones y recalcular totales"
            onPress={refreshData}
            variant="secondary"
            size="medium"
            iconOnly
          />
          <TooltipButton
            icon="download"
            tooltip="Exportar datos financieros en formato CSV"
            onPress={handleExportData}
            variant="secondary"
            size="medium"
            iconOnly
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.summaryScroll}
        contentContainerStyle={styles.summaryContent}
      >
        <SummaryCard
          title="Ingresos Totales"
          value={formatCurrency(summary.totalIngresos)}
          subtitle={`${summary.transaccionesIngresos} transacciones`}
          gradient={['#34C759', '#28A745']}
          icon="arrow-up-circle"
          tooltip="Total de ingresos por ventas completadas en el periodo seleccionado"
        />
        <SummaryCard
          title="Gastos Totales"
          value={formatCurrency(summary.totalGastos)}
          subtitle={`${summary.transaccionesGastos} transacciones`}
          gradient={['#FF3B30', '#DC3545']}
          icon="arrow-down-circle"
          tooltip="Total de gastos operativos registrados en el periodo"
        />
        <SummaryCard
          title="Profit Neto"
          value={formatCurrency(summary.profit)}
          subtitle={`${summary.porcentajeProfit.toFixed(1)}% margen`}
          gradient={['#FFB800', '#FF9500']}
          icon={summary.profit >= 0 ? 'trending-up' : 'trending-down'}
          isProfit
          tooltip="Ganancia neta (ingresos - gastos) del periodo seleccionado"
        />
      </ScrollView>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {Object.values(PERIOD_FILTERS).map(period => (
            <TooltipButton
              key={period}
              label={period === 'hoy' ? 'Hoy' : period === 'semana' ? 'Semana' : period === 'mes' ? 'Mes' : 'Todos'}
              tooltip={`Mostrar transacciones de ${period === 'hoy' ? 'hoy únicamente' : period === 'semana' ? 'la última semana' : period === 'mes' ? 'el último mes' : 'todo el historial'}`}
              onPress={() => handlePeriodChange(period)}
              variant={selectedPeriod === period ? 'primary' : 'secondary'}
              size="small"
            />
          ))}
        </ScrollView>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TooltipButton
            label="Todas"
            tooltip="Mostrar todas las categorías"
            onPress={() => handleCategoryFilter('todas')}
            variant={selectedCategory === 'todas' ? 'primary' : 'secondary'}
            size="small"
          />
          {Object.values(TRANSACTION_CATEGORIES).map(cat => (
            <TooltipButton
              key={cat}
              label={cat.charAt(0).toUpperCase() + cat.slice(1)}
              tooltip={`Filtrar por categoría ${cat}`}
              onPress={() => handleCategoryFilter(cat)}
              variant={selectedCategory === cat ? 'primary' : 'secondary'}
              size="small"
            />
          ))}
        </ScrollView>
      </View>

      <TooltipButton
        icon="add-circle"
        label="Registrar Gasto"
        tooltip="Registrar un nuevo gasto operativo (inventario, salarios, servicios)"
        onPress={handleCreateExpense}
        variant="primary"
        size="large"
      />

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Historial de Transacciones ({filteredTransactions.length})</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.accentGold} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TransactionItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshData} tintColor={COLORS.accentGold} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No hay transacciones</Text>
              <Text style={styles.emptySubtext}>
                {selectedPeriod !== 'todos' || selectedCategory !== 'todas'
                  ? 'Intenta cambiar los filtros'
                  : 'Registra tu primer gasto o espera ventas'}
              </Text>
              {(selectedPeriod !== 'todos' || selectedCategory !== 'todas') && (
                <TouchableOpacity
                  style={styles.clearFiltersBtn}
                  onPress={() => {
                    handlePeriodChange('todos');
                    handleCategoryFilter('todas');
                  }}
                >
                  <Text style={styles.clearFiltersBtnText}>Limpiar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      <TransactionModal
        visible={isModalVisible}
        transaction={selectedTransaction}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveTransaction}
      />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.bgSecondary, justifyContent: 'center', alignItems: 'center' },
  summaryScroll: { marginBottom: 24 },
  summaryContent: { gap: 16 },
  summaryCard: { width: 280, height: 140, borderRadius: 20, marginRight: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 },
  cardContent: { flex: 1, padding: 20, justifyContent: 'space-between', position: 'relative', zIndex: 1 },
  cardIcon: { marginBottom: 8 },
  cardLabel: { fontSize: 14, color: '#FFF', opacity: 0.9, marginBottom: 4 },
  cardValue: { fontSize: 32, fontWeight: '700', color: '#FFF', letterSpacing: -0.5, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#FFF', opacity: 0.8 },
  filters: { marginBottom: 16 },
  filterRow: { marginBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.bgSecondary, marginRight: 8 },
  filterChipActive: { backgroundColor: COLORS.accentGold },
  filterChipText: { fontSize: 14, color: COLORS.textSecondary },
  filterChipTextActive: { color: COLORS.bgPrimary, fontWeight: '600' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentGold, paddingVertical: 16, borderRadius: 16, marginBottom: 24, gap: 12 },
  addButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.bgPrimary },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  transactionCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transactionInfo: { flex: 1 },
  transactionDesc: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  transactionCategory: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize' },
  transactionDate: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  transactionClient: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  autoBadge: { backgroundColor: COLORS.bgTertiary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  autoBadgeText: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '600' },
  transactionActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.bgTertiary, justifyContent: 'center', alignItems: 'center' },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: COLORS.textTertiary, marginTop: 8, textAlign: 'center' },
  clearFiltersBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.accentGold, borderRadius: 8 },
  clearFiltersBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.bgPrimary }
});

export default FinancialManagementScreen;
