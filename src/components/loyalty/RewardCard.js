import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

export default function RewardCard({ reward, userPoints, onRedeem }) {
  const canRedeem = userPoints >= reward.pointsCost;

  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name={reward.icon} size={48} color={COLORS.accent.gold} />
      <Text style={styles.title}>{reward.title}</Text>
      <Text style={styles.description}>{reward.description}</Text>
      
      <View style={styles.costBadge}>
        <Text style={styles.costText}>{reward.pointsCost} puntos</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, !canRedeem && styles.buttonDisabled]}
        onPress={() => canRedeem && onRedeem(reward)}
        disabled={!canRedeem}
      >
        <Text style={styles.buttonText}>{canRedeem ? 'CANJEAR' : 'INSUFICIENTE'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.bg.secondary, padding: SPACING.lg, borderRadius: 16, alignItems: 'center', marginBottom: SPACING.md },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary, marginTop: SPACING.md, textAlign: 'center' },
  description: { fontSize: 14, color: COLORS.text.secondary, marginTop: SPACING.xs, textAlign: 'center' },
  costBadge: { backgroundColor: COLORS.bg.tertiary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, marginTop: SPACING.md },
  costText: { fontSize: 14, fontWeight: '600', color: COLORS.accent.gold },
  button: { backgroundColor: COLORS.accent.gold, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: 8, marginTop: SPACING.md },
  buttonDisabled: { backgroundColor: COLORS.bg.tertiary },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.bg.primary },
});
