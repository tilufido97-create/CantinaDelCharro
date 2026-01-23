import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminLayout from '../components/AdminLayout';
import VehicleCard from '../components/VehicleCard';
import TooltipButton from '../components/TooltipButton';
import { getCurrentAdmin } from '../utils/adminAuth';
import {
  calculateVehicleCostPerKM,
  calculateFleetStatistics,
  DEFAULT_OPERATING_COSTS
} from '../utils/fleetCalculator';

const FleetManagementScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [operatingCosts, setOperatingCosts] = useState(DEFAULT_OPERATING_COSTS);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [fleetStats, setFleetStats] = useState(null);

  const loadVehicles = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('fleet_vehicles');
      const vehs = data ? JSON.parse(data) : [];
      vehs.sort((a, b) => {
        const order = { activo: 0, mantenimiento: 1, inactivo: 2 };
        return order[a.estado] - order[b.estado];
      });
      setVehicles(vehs);
      setFleetStats(calculateFleetStatistics(vehs));
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  }, []);

  const loadOperatingCosts = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('operating_costs');
      setOperatingCosts(data ? JSON.parse(data) : DEFAULT_OPERATING_COSTS);
    } catch (error) {
      console.error('Error loading costs:', error);
    }
  }, []);

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
      await Promise.all([loadVehicles(), loadOperatingCosts()]);
      setIsLoading(false);
    };
    if (user) loadData();
  }, [user, loadVehicles, loadOperatingCosts]);

  const handleDeleteVehicle = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle.deliveryAsignado) {
      Alert.alert('No permitido', 'No puedes eliminar un vehículo con delivery asignado');
      return;
    }

    Alert.alert(
      '⚠️ Eliminar Vehículo',
      `¿Estás seguro de eliminar ${vehicle.marca} ${vehicle.modelo}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updated = vehicles.filter(v => v.id !== vehicleId);
            await AsyncStorage.setItem('fleet_vehicles', JSON.stringify(updated));
            loadVehicles();
            Alert.alert('Éxito', 'Vehículo eliminado');
          }
        }
      ]
    );
  };

  const filteredVehicles = vehicles.filter(v => 
    filterStatus === 'todos' || v.estado === filterStatus
  );

  if (!user) return null;

  return (
    <AdminLayout title="Gestión de Flota" user={user}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gestión de Flota</Text>
          <Text style={styles.subtitle}>Administra tus vehículos de delivery</Text>
        </View>
        <View style={styles.headerActions}>
          <TooltipButton
            icon="reload"
            tooltip="Actualizar datos"
            onPress={loadVehicles}
            variant="secondary"
            size="medium"
            iconOnly
          />
          <TooltipButton
            icon="settings"
            label="Configurar Costos"
            tooltip="Configurar precios de combustibles, lubricantes y otros costos"
            onPress={() => navigation.navigate('OperatingCosts')}
            variant="secondary"
            size="medium"
          />
        </View>
      </View>

      {fleetStats && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
        >
          <View style={[styles.statCard, { backgroundColor: '#007AFF20' }]}>
            <Ionicons name="car" size={32} color="#007AFF" />
            <Text style={styles.statValue}>{fleetStats.total} vehículos</Text>
            <Text style={styles.statLabel}>
              {fleetStats.active} activos, {fleetStats.maintenance} mantenimiento
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#34C75920' }]}>
            <Ionicons name="speedometer" size={32} color="#34C759" />
            <Text style={styles.statValue}>{fleetStats.totalKMToday} km</Text>
            <Text style={styles.statLabel}>Promedio: {Math.round(fleetStats.totalKMToday / (fleetStats.active || 1))} km/vehículo</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFB80020' }]}>
            <Ionicons name="cash" size={32} color="#FFB800" />
            <Text style={styles.statValue}>Bs {fleetStats.totalRevenueToday.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Ingresos hoy</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#34C75920' }]}>
            <Ionicons name="leaf" size={32} color="#34C759" />
            <Text style={styles.statValue}>{fleetStats.avgEfficiency} km/L</Text>
            <Text style={styles.statLabel}>Eficiencia promedio</Text>
          </View>
        </ScrollView>
      )}

      <View style={styles.actions}>
        <TooltipButton
          icon="add-circle"
          label="Agregar Vehículo"
          tooltip="Registrar un nuevo vehículo en la flota"
          onPress={() => Alert.alert('Info', 'Modal de vehículo próximamente')}
          variant="primary"
          size="large"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        <TooltipButton
          label="Todos"
          tooltip="Mostrar todos los vehículos"
          onPress={() => setFilterStatus('todos')}
          variant={filterStatus === 'todos' ? 'primary' : 'secondary'}
          size="medium"
        />
        <TooltipButton
          label="Activos"
          tooltip="Mostrar solo vehículos en servicio"
          onPress={() => setFilterStatus('activo')}
          variant={filterStatus === 'activo' ? 'success' : 'secondary'}
          size="medium"
        />
        <TooltipButton
          label="Mantenimiento"
          tooltip="Mostrar vehículos en mantenimiento"
          onPress={() => setFilterStatus('mantenimiento')}
          variant={filterStatus === 'mantenimiento' ? 'secondary' : 'secondary'}
          size="medium"
        />
        <TooltipButton
          label="Inactivos"
          tooltip="Mostrar vehículos fuera de servicio"
          onPress={() => setFilterStatus('inactivo')}
          variant={filterStatus === 'inactivo' ? 'danger' : 'secondary'}
          size="medium"
        />
      </ScrollView>

      {filteredVehicles.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="car-sport-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyText}>No hay vehículos registrados</Text>
          <Text style={styles.emptySubtext}>Agrega tu primer vehículo para empezar</Text>
          <TooltipButton
            icon="add-circle"
            label="Agregar Primer Vehículo"
            tooltip="Registrar vehículo"
            onPress={() => Alert.alert('Info', 'Modal próximamente')}
            variant="primary"
            size="large"
          />
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              onPress={() => Alert.alert('Info', 'Detalles próximamente')}
              onEdit={() => Alert.alert('Info', 'Editar próximamente')}
              onDelete={() => handleDeleteVehicle(item.id)}
              onToggleStatus={() => Alert.alert('Info', 'Cambiar estado próximamente')}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
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
  headerActions: {
    flexDirection: 'row',
    gap: 12
  },
  statsScroll: {
    marginBottom: 24
  },
  statCard: {
    width: 200,
    padding: 20,
    borderRadius: 16,
    marginRight: 16
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4
  },
  actions: {
    marginBottom: 16
  },
  filters: {
    marginBottom: 16,
    flexDirection: 'row',
    gap: 8
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    marginBottom: 24
  }
});

export default FleetManagementScreen;
