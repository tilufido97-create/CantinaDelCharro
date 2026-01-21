import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';
import { getCurrentAdmin } from '../utils/adminAuth';

const USER_TIERS = {
  bronze: { name: 'Bronce', emoji: '🥉', color: '#CD7F32', minPoints: 0, maxPoints: 500, benefits: ['Puntos por compra'] },
  silver: { name: 'Plata', emoji: '🥈', color: '#C0C0C0', minPoints: 501, maxPoints: 1500, benefits: ['5% descuento', 'Puntos x2'] },
  gold: { name: 'Oro', emoji: '🥇', color: '#FFD700', minPoints: 1501, maxPoints: 3000, benefits: ['10% descuento', 'Delivery gratis', 'Puntos x3'] },
  platinum: { name: 'Platino', emoji: '💎', color: '#E5E4E2', minPoints: 3001, maxPoints: Infinity, benefits: ['15% descuento', 'Delivery gratis', 'Prioridad', 'Regalos especiales'] }
};

const UsersManagementScreen = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, newToday: 0, active: 0, byTier: { bronze: 0, silver: 0, gold: 0, platinum: 0 } });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const calculateTier = (points) => {
    if (points >= USER_TIERS.platinum.minPoints) return 'platinum';
    if (points >= USER_TIERS.gold.minPoints) return 'gold';
    if (points >= USER_TIERS.silver.minPoints) return 'silver';
    return 'bronze';
  };

  const calculateStats = (usersList) => {
    const today = new Date().toDateString();
    const newToday = usersList.filter(u => new Date(u.createdAt).toDateString() === today).length;
    const active = usersList.filter(u => (u.totalOrders || 0) > 0).length;
    const byTier = {
      bronze: usersList.filter(u => u.tier === 'bronze').length,
      silver: usersList.filter(u => u.tier === 'silver').length,
      gold: usersList.filter(u => u.tier === 'gold').length,
      platinum: usersList.filter(u => u.tier === 'platinum').length
    };
    setStats({ total: usersList.length, newToday, active, byTier });
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await AsyncStorage.getItem('all_users');
      let loadedUsers = usersData ? JSON.parse(usersData) : [
        { id: 'u1', displayName: 'Juan Pérez', phone: '+591 70123456', email: 'juan@example.com', avatar: '🎭', points: 450, totalOrders: 15, totalSpent: 1250, status: 'active', createdAt: new Date(2025, 0, 10).toISOString() },
        { id: 'u2', displayName: 'María López', phone: '+591 71234567', email: 'maria@example.com', avatar: '💀', points: 1200, totalOrders: 32, totalSpent: 3200, status: 'active', createdAt: new Date(2024, 11, 15).toISOString() },
        { id: 'u3', displayName: 'Carlos Ruiz', phone: '+591 72345678', email: 'carlos@example.com', avatar: '🎃', points: 2500, totalOrders: 48, totalSpent: 5800, status: 'active', createdAt: new Date(2024, 10, 5).toISOString() },
        { id: 'u4', displayName: 'Ana Torres', phone: '+591 73456789', email: 'ana@example.com', avatar: '👑', points: 3500, totalOrders: 65, totalSpent: 8900, status: 'active', createdAt: new Date(2024, 9, 20).toISOString() },
        { id: 'u5', displayName: 'Pedro Gómez', phone: '+591 74567890', email: 'pedro@example.com', avatar: '🤠', points: 150, totalOrders: 5, totalSpent: 450, status: 'blocked', createdAt: new Date(2026, 0, 18).toISOString() }
      ];
      loadedUsers = loadedUsers.map(u => ({ ...u, tier: calculateTier(u.points || 0) }));
      loadedUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUsers(loadedUsers);
      setFilteredUsers(loadedUsers);
      calculateStats(loadedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
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
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];
    if (searchQuery.trim()) {
      filtered = filtered.filter(u =>
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery)
      );
    }
    if (tierFilter !== 'all') {
      filtered = filtered.filter(u => u.tier === tierFilter);
    }
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, tierFilter, users]);

  const toggleUserStatus = async (usr) => {
    const newStatus = usr.status === 'active' ? 'blocked' : 'active';
    Alert.alert(
      newStatus === 'blocked' ? 'Bloquear usuario' : 'Activar usuario',
      `¿Estás seguro de ${newStatus === 'blocked' ? 'bloquear' : 'activar'} a ${usr.displayName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: newStatus === 'blocked' ? 'Bloquear' : 'Activar',
          style: newStatus === 'blocked' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const updatedUsers = users.map(u => u.id === usr.id ? { ...u, status: newStatus, updatedAt: new Date().toISOString() } : u);
              await AsyncStorage.setItem('all_users', JSON.stringify(updatedUsers));
              setUsers(updatedUsers);
              Alert.alert('Éxito', `Usuario ${newStatus === 'blocked' ? 'bloqueado' : 'activado'} correctamente`);
            } catch (error) {
              Alert.alert('Error', 'No se pudo cambiar el estado del usuario');
            }
          }
        }
      ]
    );
  };

  const exportToCSV = async () => {
    try {
      const csvHeader = 'Nombre,Teléfono,Tier,Puntos,Pedidos,Total Gastado,Fecha Registro\n';
      const csvRows = filteredUsers.map(u => 
        `${u.displayName},${u.phone},${USER_TIERS[u.tier].name},${u.points || 0},${u.totalOrders || 0},${u.totalSpent || 0},${new Date(u.createdAt).toLocaleDateString()}`
      ).join('\n');
      const csvContent = csvHeader + csvRows;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        Alert.alert('Éxito', 'Archivo CSV descargado');
      } else {
        Alert.alert('Info', 'Exportar CSV solo disponible en web');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar el CSV');
    }
  };

  const StatsBar = () => (
    <View style={styles.statsBar}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Total Usuarios</Text>
        <Text style={styles.statValue}>{stats.total}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Nuevos Hoy</Text>
        <Text style={[styles.statValue, { color: COLORS.success }]}>+{stats.newToday}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Activos</Text>
        <Text style={styles.statValue}>{stats.active}</Text>
      </View>
    </View>
  );

  const UserRow = ({ usr }) => {
    const tier = USER_TIERS[usr.tier];
    const isBlocked = usr.status === 'blocked';
    
    return (
      <View style={[styles.userRow, isBlocked && styles.userRowBlocked]}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{usr.avatar || '👤'}</Text>
          {isBlocked && (
            <View style={styles.blockedBadge}>
              <Ionicons name="ban" size={12} color={COLORS.error} />
            </View>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isBlocked && styles.userNameBlocked]}>{usr.displayName || 'Sin nombre'}</Text>
          <Text style={styles.userEmail}>{usr.email || '-'}</Text>
        </View>
        
        <Text style={styles.userPhone}>{usr.phone || '-'}</Text>
        
        <View style={[styles.tierBadge, { backgroundColor: tier.color + '20' }]}>
          <Text style={styles.tierEmoji}>{tier.emoji}</Text>
          <Text style={[styles.tierText, { color: tier.color }]}>{tier.name}</Text>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{usr.points || 0}</Text>
          <Text style={styles.pointsLabel}>puntos</Text>
        </View>
        
        <View style={styles.ordersContainer}>
          <Text style={styles.ordersValue}>{usr.totalOrders || 0}</Text>
          <Text style={styles.ordersLabel}>pedidos</Text>
        </View>
        
        <Text style={styles.totalSpent}>Bs {(usr.totalSpent || 0).toFixed(2)}</Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => { setSelectedUser(usr); setShowDetailModal(true); }}>
            <Ionicons name="eye" size={20} color={COLORS.info} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleUserStatus(usr)}>
            <Ionicons name={isBlocked ? "checkmark-circle" : "ban"} size={20} color={isBlocked ? COLORS.success : COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const TierDistribution = () => (
    <View style={styles.tierDistribution}>
      <Text style={styles.sectionTitle}>Distribución por Tier</Text>
      <View style={styles.tierStats}>
        {Object.entries(USER_TIERS).map(([key, tier]) => (
          <View key={key} style={styles.tierStatItem}>
            <Text style={styles.tierStatEmoji}>{tier.emoji}</Text>
            <Text style={styles.tierStatName}>{tier.name}</Text>
            <Text style={styles.tierStatCount}>{stats.byTier[key] || 0}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const Pagination = () => (
    <View style={styles.pagination}>
      <TouchableOpacity style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]} disabled={currentPage === 1} onPress={() => setCurrentPage(prev => prev - 1)}>
        <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.pageInfo}>Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length}</Text>
      <TouchableOpacity style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]} disabled={currentPage === totalPages} onPress={() => setCurrentPage(prev => prev + 1)}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  if (!user) return null;

  return (
    <AdminLayout title="Usuarios" user={user}>
      <StatsBar />
      
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textTertiary} />
          <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar por nombre o teléfono..." placeholderTextColor={COLORS.textTertiary} />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tierFilter}>
          <TouchableOpacity style={[styles.tierFilterButton, tierFilter === 'all' && styles.tierFilterActive]} onPress={() => setTierFilter('all')}>
            <Text style={styles.tierFilterText}>Todos</Text>
          </TouchableOpacity>
          {Object.entries(USER_TIERS).map(([key, tier]) => (
            <TouchableOpacity key={key} style={[styles.tierFilterButton, tierFilter === key && styles.tierFilterActive]} onPress={() => setTierFilter(key)}>
              <Text style={styles.tierFilterText}>{tier.emoji} {tier.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
          <Ionicons name="download" size={20} color={COLORS.textPrimary} />
          <Text style={styles.exportText}>Exportar CSV</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accentGold} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: 60 }]}>Avatar</Text>
              <Text style={[styles.headerCell, { flex: 2 }]}>Nombre</Text>
              <Text style={[styles.headerCell, { width: 120 }]}>Teléfono</Text>
              <Text style={[styles.headerCell, { width: 100 }]}>Tier</Text>
              <Text style={[styles.headerCell, { width: 80 }]}>Puntos</Text>
              <Text style={[styles.headerCell, { width: 80 }]}>Pedidos</Text>
              <Text style={[styles.headerCell, { width: 100 }]}>Total</Text>
              <Text style={[styles.headerCell, { width: 100 }]}>Acciones</Text>
            </View>
            
            {currentUsers.map(usr => (
              <UserRow key={usr.id} usr={usr} />
            ))}
            
            {currentUsers.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>No se encontraron usuarios</Text>
              </View>
            )}
          </View>
          
          {filteredUsers.length > itemsPerPage && <Pagination />}
        </>
      )}
      
      <TierDistribution />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  statsBar: { flexDirection: 'row', gap: 20, marginBottom: 24, backgroundColor: COLORS.bgSecondary, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  statItem: { flex: 1 },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  toolbar: { flexDirection: 'row', gap: 16, marginBottom: 24, alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgSecondary, borderRadius: 12, paddingHorizontal: 16, height: 48, flex: 1, borderWidth: 1, borderColor: COLORS.bgTertiary },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, color: COLORS.textPrimary },
  tierFilter: { maxWidth: 500 },
  tierFilterButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: COLORS.bgSecondary, marginRight: 8, borderWidth: 1, borderColor: COLORS.bgTertiary },
  tierFilterActive: { backgroundColor: COLORS.accentGold + '20', borderColor: COLORS.accentGold },
  tierFilterText: { fontSize: 13, color: COLORS.textPrimary },
  exportButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accentGold, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 8 },
  exportText: { fontSize: 14, fontWeight: '600', color: COLORS.bgPrimary },
  table: { backgroundColor: COLORS.bgSecondary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.bgTertiary, marginBottom: 24 },
  tableHeader: { flexDirection: 'row', paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: COLORS.bgTertiary },
  headerCell: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.bgTertiary },
  userRowBlocked: { opacity: 0.5 },
  avatarContainer: { width: 60, position: 'relative' },
  avatarEmoji: { fontSize: 32 },
  blockedBadge: { position: 'absolute', bottom: 0, right: 10, backgroundColor: COLORS.bgPrimary, borderRadius: 10, padding: 2 },
  userInfo: { flex: 2, paddingRight: 12 },
  userName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  userNameBlocked: { textDecorationLine: 'line-through' },
  userEmail: { fontSize: 12, color: COLORS.textTertiary },
  userPhone: { width: 120, fontSize: 13, color: COLORS.textSecondary },
  tierBadge: { width: 100, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tierEmoji: { fontSize: 16 },
  tierText: { fontSize: 12, fontWeight: '600' },
  pointsContainer: { width: 80, alignItems: 'center' },
  pointsValue: { fontSize: 16, fontWeight: '700', color: COLORS.accentGold },
  pointsLabel: { fontSize: 10, color: COLORS.textTertiary },
  ordersContainer: { width: 80, alignItems: 'center' },
  ordersValue: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  ordersLabel: { fontSize: 10, color: COLORS.textTertiary },
  totalSpent: { width: 100, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  actionsContainer: { width: 100, flexDirection: 'row', gap: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.bgTertiary, justifyContent: 'center', alignItems: 'center' },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textTertiary, marginTop: 16 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 24 },
  pageButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: COLORS.bgSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.bgTertiary },
  pageButtonDisabled: { opacity: 0.3 },
  pageInfo: { fontSize: 14, color: COLORS.textPrimary },
  tierDistribution: { backgroundColor: COLORS.bgSecondary, padding: 24, borderRadius: 16, borderWidth: 1, borderColor: COLORS.bgTertiary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  tierStats: { flexDirection: 'row', gap: 20 },
  tierStatItem: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: COLORS.bgTertiary, borderRadius: 12 },
  tierStatEmoji: { fontSize: 32, marginBottom: 8 },
  tierStatName: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  tierStatCount: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary }
});

export default UsersManagementScreen;
