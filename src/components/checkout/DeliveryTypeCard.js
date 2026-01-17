import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function DeliveryTypeCard({ type, selected, onSelect, disabled }) {
  const isDelivery = type === 'delivery';
  
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
        disabled && styles.cardDisabled
      ]}
      onPress={() => !disabled && onSelect(type)}
      disabled={disabled}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{isDelivery ? '🚗' : '🏪'}</Text>
        <View style={styles.radio}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
      
      <Text style={styles.title}>
        {isDelivery ? 'Delivery a domicilio' : 'Recojo en tienda'}
      </Text>
      
      <Text style={styles.subtitle}>
        {isDelivery ? 'Mínimo: 50 Bs • 30-45 min' : 'GRATIS • Listo en 15 min'}
      </Text>
      
      {!isDelivery && (
        <Text style={styles.address}>Av. Arce #2140, Sopocachi</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: COLORS.accent.gold,
    backgroundColor: COLORS.bg.tertiary,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 32,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent.gold,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  address: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
});
