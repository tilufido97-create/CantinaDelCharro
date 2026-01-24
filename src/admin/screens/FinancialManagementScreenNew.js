import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import ExpenseModal from '../components/ExpenseModal';
import { getCurrentAdmin } from '../utils/adminAuth';
import firebaseFinanceService from '../../services/firebaseFinanceService';

const { width } = Dimensions.get('window');

const PERIOD_FILTERS = {
  HOY: 'hoy',
  SEMANA: 'semana',
  MES: 'mes',
  TODOS: 'todos'
};

const FinancialManagementScreen = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_FILTERS.MES);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [paymentFilter, setPaymentFilter] = useState('todos');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let filtered = transactions.filter(t => {
      const txDate = new Date(t.date);
      switch (selectedPeriod) {
        case PERIOD_FILTERS.HOY:
          return txDate.toDateString() === now.toDateString();
        case PERIOD_FILTERS.SEMANA:
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return txDate >= weekAgo;
        case PERIOD_FILTERS.MES:
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return txDate >= monthAgo;
        default:
          return true;
      }
    });

    // Filtro por tipo
    if (typeFilter === 'ingresos') {
      filtered = filtered.filter(t => t.type === 'ingreso');
    } else if (typeFilter === 'gastos') {
      filtered = filtered.filter(t => t.type === 'gasto');
    }

    // Filtro por categoría
    if (categoryFilter !== 'todas') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Filtro por método de pago
    if (paymentFilter !== 'todos') {
      filtered = filtered.filter(t => t.paymentMethod === paymentFilter);
    }

    return filtered;
  }, [transactions, selectedPeriod, typeFilter, categoryFilter, paymentFilter]);

  const summary = useMemo(() => {
    const ingresos = filteredTransactions.filter(t => t.type === 'ingreso');
    const gastos = filteredTransactions.filter(t => t.type === 'gasto');
    
    const totalIngresos = ingresos.reduce((sum, t) => sum + t.amount, 0);
    const totalGastos = gastos.reduce((sum, t) => sum + t.amount, 0);
    const profit = totalIngresos - totalGastos;
    const margen = totalIngresos > 0 ? (profit / totalIngresos) * 100 : 0;
    
    return { totalIngresos, totalGastos, profit, margen };
  }, [filteredTransactions]);

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
    
    const unsubscribe = firebaseFinanceService.subscribeToTransactions((txns) => {
      setTransactions(txns);
      setLoading(false);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const handleExport = () => {
    if (Platform.OS === 'web') {
      window.alert('Exportación disponible próximamente');
    } else {
      Alert.alert('Exportación', 'Disponible próximamente');
    }
  };

  const SummaryCard = ({ title, value, subtitle, color, icon }) => (
    <View style={[styles.summaryCard, { width: width > 1366 ? '32%' : width > 1024 ? '32%' : '100%' }]}>
      <View style={[styles.cardIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardValue, { color }]}>Bs {value.toFixed(2)}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );

  const TransactionRow = ({ item }) => {
    const isIncome = item.type === 'ingreso';
    return (
      <View style={styles.transactionRow}>
        <View style={[styles.typeBadge, { backgroundColor: isIncome ? '#34C759' + '20' : '#FF3B30' + '20' }]}>
          <Ionicons name={isIncome ? 'arrow-up' : 'arrow-down'} size={16} color={isIncome ? '#34C759' : '#FF3B30'} />
          <Text style={[styles.typeBadgeText, { color: isIncome ? '#34C759' : '#FF3B30' }]}>
            {isIncome ? 'Ingreso' : 'Gasto'}
          </Text>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDesc}>{item.description}</Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionCategory}>🏷️ {item.category}</Text>
            {item.paymentMethod && (
              <Text style={styles.transactionPayment}>💳 {item.paymentMethod}</Text>
            )}
          </View>
          <Text style={styles.transactionDate}>
            {new Date(item.date).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
          {item.customerName && (
            <Text style={styles.transactionCustomer}>👤 {item.customerName}</Text>
          )}
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, { color: isIncome ? '#34C759' : '#FF3B30' }]}>
            {isIncome ? '+' : '-'} Bs {item.amount.toFixed(2)}
          </Text>
          {item.isAutomatic && (
            <View style={styles.autoBadge}>
              <Text style={styles.autoBadgeText}>Auto</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!user) return null;

  return (
    <AdminLayout title="Finanzas" user={user}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gestión Financiera</Text>
          <Text style={styles.headerSubtitle}>Control de ingresos y gastos</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleRefresh}>
            <Ionicons name="reload" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleExport}>
            <Ionicons name="download" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <SummaryCard
          title="Ingresos Totales"
          value={summary.totalIngresos}
          subtitle={`${filteredTransactions.filter(t => t.type === 'ingreso').length} transacciones`}
          color="#34C759"
          icon="arrow-up-circle"
        />
        <SummaryCard
          title="Gastos Totales"
          value={summary.totalGastos}
          subtitle={`${filteredTransactions.filter(t => t.type === 'gasto').length} transacciones`}
          color="#FF3B30"
          icon="arrow-down-circle"
        />
        <SummaryCard
          title="Profit Neto"
          value={summary.profit}
          subtitle={`Margen: ${summary.margen.toFixed(1)}%`}
          color="#FFB800"
          icon="trending-up"
        />
      </View>

      <View style={styles.filters}>
        {Object.entries(PERIOD_FILTERS).map(([key, value]) => (
          <TouchableOpacity
            key={value}
            style={[styles.filterChip, selectedPeriod === value && styles.filterChipActive]}
            onPress={() => setSelectedPeriod(value)}
          >
            <Text style={[styles.filterChipText, selectedPeriod === value && styles.filterChipTextActive]}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addExpenseButton} onPress={() => setShowExpenseModal(true)}>
        <Ionicons name="add-circle" size={24} color={COLORS.bgPrimary} />
        <Text style={styles.addExpenseText}>Registrar Gasto</Text>
      </TouchableOpacity>

      <View style={styles.advancedFilters}>
        <Text style={styles.filterLabel}>Filtros Avanzados</Text>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterSubLabel}>Tipo:</Text>
          <View style={styles.filterChips}>
            {['todos', 'ingresos', 'gastos'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, typeFilter === type && styles.filterChipActive]}
                onPress={() => setTypeFilter(type)}
              >
                <Text style={[styles.filterChipText, typeFilter === type && styles.filterChipTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterSubLabel}>Categoría:</Text>
          <View style={styles.filterChips}>
            {['todas', 'venta', 'inventario', 'salarios', 'operativos', 'otros'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
                onPress={() => setCategoryFilter(cat)}
              >
                <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterSubLabel}>Pago:</Text>
          <View style={styles.filterChips}>
            {['todos', 'efectivo', 'qr', 'Efectivo', 'Transferencia', 'Tarjeta'].map(method => (
              <TouchableOpacity
                key={method}
                style={[styles.filterChip, paymentFilter === method && styles.filterChipActive]}
                onPress={() => setPaymentFilter(method)}
              >
                <Text style={[styles.filterChipText, paymentFilter === method && styles.filterChipTextActive]}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de Transacciones ({filteredTransactions.length})</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.accentGold} style={{ marginTop: 40 }} />
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No hay transacciones</Text>
            <Text style={styles.emptySubtext}>Las ventas completadas aparecerán aquí automáticamente</Text>
          </View>
        ) : (
          <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
            {filteredTransactions.map(item => (
              <TransactionRow key={item.id} item={item} />
            ))}
          </ScrollView>
        )}
      </View>

      <ExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={() => {
          setShowExpenseModal(false);
          handleRefresh();
        }}
      />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.bgSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgTertiary },
  summaryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  summaryCard: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.bgTertiary, flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: COLORS.textTertiary },
  filters: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.bgTertiary },
  filterChipActive: { backgroundColor: COLORS.accentGold + '20', borderColor: COLORS.accentGold },
  filterChipText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.accentGold },
  section: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  transactionsList: { flex: 1 },
  transactionRow: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.bgTertiary },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  typeBadgeText: { fontSize: 12, fontWeight: '600' },
  transactionInfo: { flex: 1 },
  transactionDesc: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  transactionCategory: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize', marginBottom: 2 },
  transactionDate: { fontSize: 11, color: COLORS.textTertiary },
  transactionAmount: { fontSize: 18, fontWeight: '700' },
  autoBadge: { backgroundColor: COLORS.bgTertiary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  autoBadgeText: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '600' },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: COLORS.textTertiary, marginTop: 8, textAlign: 'center' },
  addExpenseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentGold, paddingVertical: 16, borderRadius: 12, marginBottom: 24, gap: 8 },
  addExpenseText: { fontSize: 16, fontWeight: '700', color: COLORS.bgPrimary },
  advancedFilters: { backgroundColor: COLORS.bgSecondary, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: COLORS.bgTertiary },
  filterLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  filterRow: { marginBottom: 12 },
  filterSubLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  transactionMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  transactionPayment: { fontSize: 12, color: COLORS.textTertiary },
  transactionCustomer: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  transactionRight: { alignItems: 'flex-end', gap: 8 }
});

export default FinancialManagementScreen;
