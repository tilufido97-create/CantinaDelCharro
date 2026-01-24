import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

const DeliveryInfoCard = ({ calculation, isCalculating, onShowInfo }) => {
  
  if (isCalculating) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.accent.gold} />
        <Text style={styles.calculatingText}>
          Calculando mejor ruta y vehículo...
        </Text>
        <Text style={styles.calculatingSubtext}>
          Usando Google Maps para distancia exacta
        </Text>
      </View>
    );
  }
  
  if (!calculation || !calculation.pricing) {
    return null;
  }
  
  const getVehicleIcon = () => {
    if (!calculation.vehicle) return 'bicycle';
    switch (calculation.vehicle.tipo) {
      case 'moto': return 'bicycle';
      case 'auto': return 'car-sport';
      case 'pickup': return 'car';
      default: return 'bicycle';
    }
  };
  
  return (
    <LinearGradient
      colors={['#2C2C2E', '#1C1C1E']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name={getVehicleIcon()} size={24} color={COLORS.accent.gold} />
          <Text style={styles.title}>Información de Entrega</Text>
        </View>
        <TouchableOpacity onPress={onShowInfo} style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.accent.gold} />
        </TouchableOpacity>
      </View>
      
      {/* Grid de info */}
      <View style={styles.infoGrid}>
        {/* Distancia */}
        <View style={styles.infoItem}>
          <Ionicons name="navigate" size={20} color="#8E8E93" />
          <Text style={styles.infoLabel}>Distancia</Text>
          <Text style={styles.infoValue}>{calculation.distance.text}</Text>
        </View>
        
        {/* Tiempo */}
        <View style={styles.infoItem}>
          <Ionicons name="time" size={20} color="#8E8E93" />
          <Text style={styles.infoLabel}>Tiempo</Text>
          <Text style={styles.infoValue}>{calculation.duration.text}</Text>
        </View>
        
        {/* Vehículo */}
        {calculation.vehicle && (
          <View style={styles.infoItem}>
            <Ionicons 
              name={getVehicleIcon()} 
              size={20} 
              color="#8E8E93" 
            />
            <Text style={styles.infoLabel}>Vehículo</Text>
            <Text style={styles.infoValue}>
              {calculation.vehicle.marca}
            </Text>
          </View>
        )}
      </View>
      
      {/* Precio destacado */}
      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>Costo de Delivery</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceValue}>
            Bs {calculation.pricing.clientPrice.toFixed(2)}
          </Text>
          {calculation.isEstimate && (
            <View style={styles.estimateBadge}>
              <Text style={styles.estimateText}>Estimado</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Categoría */}
      {calculation.categoryText && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {calculation.categoryText}
          </Text>
        </View>
      )}
      
      {/* Footer message */}
      <Text style={styles.footerText}>
        💡 Precio calculado con Google Maps y optimizado según distancia
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: '#2C2C2E'
  },
  calculatingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    textAlign: 'center'
  },
  calculatingSubtext: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    textAlign: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary
  },
  infoButton: {
    padding: SPACING.xs
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs
  },
  infoLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: SPACING.xs
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary
  },
  priceSection: {
    backgroundColor: COLORS.accent.gold,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#000000',
    marginBottom: SPACING.xs
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  priceValue: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#000000'
  },
  estimateBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm
  },
  estimateText: {
    fontSize: 10,
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  footerText: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16
  }
});

export default DeliveryInfoCard;
