import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VehicleComparisonCard = ({ vehicle, pricing, isRecommended = false }) => {
  const getVehicleIcon = () => {
    switch (vehicle.tipo) {
      case 'moto': return 'bicycle';
      case 'auto': return 'car';
      case 'pickup': return 'car-sport';
      default: return 'car';
    }
  };

  const getProfitColor = () => {
    if (pricing.profitMargin >= 50) return '#34C759';
    if (pricing.profitMargin >= 30) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <View style={[styles.card, isRecommended && styles.cardRecommended]}>
      {isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>⭐ RECOMENDADO</Text>
        </View>
      )}

      <View style={styles.header}>
        <Ionicons name={getVehicleIcon()} size={32} color="#FFB800" />
        <View style={styles.headerInfo}>
          <Text style={styles.vehicleName}>{vehicle.marca} {vehicle.modelo}</Text>
          <Text style={styles.vehiclePlate}>{vehicle.placa}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{vehicle.tipo.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="leaf" size={20} color="#34C759" />
          <Text style={styles.statValue}>{vehicle.rendimiento} km/L</Text>
          <Text style={styles.statLabel}>Eficiencia</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="speedometer" size={20} color="#007AFF" />
          <Text style={styles.statValue}>{vehicle.velocidad} km/h</Text>
          <Text style={styles.statLabel}>Velocidad</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="cube" size={20} color="#FF9500" />
          <Text style={styles.statValue}>{vehicle.capacidad}</Text>
          <Text style={styles.statLabel}>Carga</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.pricingSection}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Precio al Cliente</Text>
          <Text style={styles.priceValue}>Bs {pricing.clientPrice.toFixed(2)}</Text>
        </View>
        
        <Text style={styles.costText}>
          Costo operativo: Bs {pricing.operatingCost.toFixed(2)}
        </Text>
        
        <Text style={[styles.profitText, { color: getProfitColor() }]}>
          Ganancia: Bs {pricing.profit.toFixed(2)} ({pricing.profitMargin.toFixed(1)}%)
        </Text>
      </View>

      <View style={styles.distributionBar}>
        <View style={[styles.barSegment, { 
          flex: pricing.distribution.operatingPercent, 
          backgroundColor: '#FF3B30' 
        }]} />
        <View style={[styles.barSegment, { 
          flex: pricing.distribution.deliveryPercent, 
          backgroundColor: '#007AFF' 
        }]} />
        <View style={[styles.barSegment, { 
          flex: pricing.distribution.businessPercent, 
          backgroundColor: '#34C759' 
        }]} />
      </View>

      <View style={styles.distributionLegend}>
        <Text style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} /> 
          Costo {pricing.distribution.operatingPercent}%
        </Text>
        <Text style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} /> 
          Delivery {pricing.distribution.deliveryPercent}%
        </Text>
        <Text style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} /> 
          Negocio {pricing.distribution.businessPercent}%
        </Text>
      </View>

      {isRecommended && (
        <Text style={styles.footerText}>✓ Mejor opción para esta distancia</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2C2C2E',
    position: 'relative'
  },
  cardRecommended: {
    borderColor: '#FFB800'
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFB800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  vehiclePlate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2
  },
  typeBadge: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFB800'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center',
    gap: 4
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93'
  },
  divider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 12
  },
  pricingSection: {
    marginBottom: 12
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  priceLabel: {
    fontSize: 14,
    color: '#8E8E93'
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFB800'
  },
  costText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4
  },
  profitText: {
    fontSize: 14,
    fontWeight: '600'
  },
  distributionBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  barSegment: {
    height: '100%'
  },
  distributionLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8
  },
  legendItem: {
    fontSize: 10,
    color: '#8E8E93',
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4
  },
  footerText: {
    fontSize: 12,
    color: '#34C759',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600'
  }
});

export default VehicleComparisonCard;
