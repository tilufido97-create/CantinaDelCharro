import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

const ICONS = {
  purchase: 'cart',
  game: 'game-controller',
  referral: 'people',
  bonus: 'gift',
  redeem: 'ticket',
};

const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Hace un momento';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
  return `Hace ${Math.floor(seconds / 86400)} días`;
};

export default function PointsActivityItem({ type, points, description, timestamp }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={ICONS[type]} size={24} color={COLORS.accent.gold} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.points, { color: points > 0 ? COLORS.semantic.success : COLORS.semantic.error }]}>
            {points > 0 ? '+' : ''}{points} pts
          </Text>
        </View>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.time}>{getTimeAgo(timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.bg.secondary, borderRadius: 12, marginBottom: SPACING.sm },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg.tertiary, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  content: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  points: { fontSize: 16, fontWeight: 'bold' },
  description: { fontSize: 14, color: COLORS.text.secondary, marginBottom: 4 },
  time: { fontSize: 12, color: COLORS.text.tertiary },
});
