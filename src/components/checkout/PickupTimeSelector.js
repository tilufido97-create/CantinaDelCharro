import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

const PICKUP_TIMES = [
  { id: '15min', label: 'En 15 minutos', minutes: 15 },
  { id: '30min', label: 'En 30 minutos', minutes: 30 },
  { id: '1hour', label: 'En 1 hora', minutes: 60 },
  { id: '2hours', label: 'En 2 horas', minutes: 120 },
];

export default function PickupTimeSelector({ selected, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>⏰ ¿Cuándo lo recogerás?</Text>
      <View style={styles.grid}>
        {PICKUP_TIMES.map(time => (
          <TouchableOpacity
            key={time.id}
            style={[
              styles.timeCard,
              selected === time.id && styles.timeCardActive
            ]}
            onPress={() => onSelect(time.id)}
          >
            <Ionicons 
              name={selected === time.id ? "checkmark-circle" : "time-outline"} 
              size={24} 
              color={selected === time.id ? COLORS.accent.gold : COLORS.text.tertiary} 
            />
            <Text style={[
              styles.timeText,
              selected === time.id && styles.timeTextActive
            ]}>
              {time.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  timeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bg.tertiary,
  },
  timeCardActive: {
    borderColor: COLORS.accent.gold,
    backgroundColor: COLORS.accent.gold + '10',
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  timeTextActive: {
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
