import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

export default function BenefitChip({ icon, label }) {
  return (
    <View style={styles.chip}>
      <MaterialCommunityIcons name={icon} size={16} color={COLORS.accent.gold} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg.tertiary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, borderWidth: 1, borderColor: COLORS.accent.gold, gap: SPACING.xs },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.text.primary },
});
