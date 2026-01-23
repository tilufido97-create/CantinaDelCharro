import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TooltipButton from './TooltipButton';
import TooltipIcon from './TooltipIcon';
import { formatCurrency, checkMaintenanceDue } from '../utils/fleetCalculator';

const VehicleCard = ({ vehicle, onPress, onEdit, onDelete, onToggleStatus }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = () => {
    switch (vehicle.estado) {
      case 'activo': return '#34C759';
      case 'mantenimiento': return '#FF9500';
      case 'inactivo': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusLabel = () => {
    switch (vehicle.estado) {
      case 'activo': return 'Activo';
      case 'mantenimiento': return 'Mantenimiento';
      case 'inactivo': return 'Inactivo';
      default: return vehicle.estado;
    }
  };

  const getVehicleIcon = () => {
    switch (vehicle.tipo) {
      case 'moto': return 'bicycle';
      case 'auto': return 'car';
      case 'pickup': return 'car-sport';
      default: return 'car';
    }
  };

  const maintenance = checkMaintenanceDue(vehicle);
  const efficiencyColor = (vehicle.consumoPromedioReal || vehicle.rendimientoKmLitro) >= vehicle.rendimientoKmLitro * 0.9 ? '#34C759' : '#FF9500';

  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: getStatusColor() }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {vehicle.foto ? (
            <Image source={{ uri: vehicle.foto }} style={styles.vehicleImage} />
          ) : (
            <View style={styles.vehicleIconContainer}>
              <Ionicons name={getVehicleIcon()} size={40} color="#FFB800" />
            </View>
          )}
          
          <View style={styles.headerInfo}>
            <Text style={styles.vehicleName}>{vehicle.marca} {vehicle.modelo}</Text>
            <Text style={styles.vehiclePlate}>{vehicle.placa}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusLabel()}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowActions(!showActions)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="speedometer" size={20} color="#FFB800" />
          <Text style={styles.statValue}>{vehicle.kmRecorridosHoy || 0} km</Text>
          <Text style={styles.statLabel}>Hoy</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.statValue}>{vehicle.pedidosHoy || 0}</Text>
          <Text style={styles.statLabel}>Pedidos</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="cash" size={20} color="#FFB800" />
          <Text style={styles.statValue}>{formatCurrency(vehicle.ingresosHoy || 0)}</Text>
          <Text style={styles.statLabel}>Ingresos</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="information-circle" size={16} color="#8E8E93" />
        <Text style={styles.infoText}>
          Costo por KM: {formatCurrency(vehicle.costoTotalPorKM || 0)}
        </Text>
        <TooltipIcon 
          tooltip="Incluye combustible, aceite, mantenimiento y depreciación"
          size={14}
        />
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="leaf" size={16} color={efficiencyColor} />
        <Text style={[styles.infoText, { color: efficiencyColor }]}>
          Rendimiento: {vehicle.consumoPromedioReal || vehicle.rendimientoKmLitro} km/L (real)
        </Text>
      </View>

      {vehicle.estado === 'mantenimiento' && maintenance.isNear && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={16} color="#FF9500" />
          <Text style={styles.warningText}>{maintenance.message}</Text>
        </View>
      )}

      {vehicle.deliveryAsignado && (
        <View style={styles.assignedBanner}>
          <Ionicons name="person" size={16} color="#007AFF" />
          <Text style={styles.assignedText}>
            Asignado a: {vehicle.deliveryAsignado}
          </Text>
        </View>
      )}

      {showActions && (
        <View style={styles.actionsRow}>
          <TooltipButton
            icon="eye"
            tooltip="Ver estadísticas completas del vehículo"
            onPress={onPress}
            variant="secondary"
            size="small"
            iconOnly
          />
          <TooltipButton
            icon="create"
            tooltip="Editar información del vehículo"
            onPress={onEdit}
            variant="secondary"
            size="small"
            iconOnly
          />
          <TooltipButton
            icon="trash"
            tooltip="Eliminar vehículo de la flota"
            onPress={onDelete}
            variant="danger"
            size="small"
            iconOnly
            disabled={vehicle.deliveryAsignado !== null}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1
  },
  vehicleImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#2C2C2E'
  },
  vehicleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  menuButton: {
    padding: 8
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 12
  },
  statItem: {
    alignItems: 'center',
    gap: 4
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  infoText: {
    fontSize: 13,
    color: '#8E8E93',
    flex: 1
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF950020',
    padding: 12,
    borderRadius: 8,
    marginTop: 12
  },
  warningText: {
    fontSize: 13,
    color: '#FF9500',
    fontWeight: '600'
  },
  assignedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF20',
    padding: 12,
    borderRadius: 8,
    marginTop: 12
  },
  assignedText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E'
  }
});

export default VehicleCard;
