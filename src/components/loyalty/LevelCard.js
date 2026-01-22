import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../constants/theme';
import { LEVELS, getLevelProgress } from '../../services/loyaltyService';
import ProgressBar from './ProgressBar';

const LEVEL_GRADIENTS = {
  bronze: ['#CD7F32', '#8B4513'],
  silver: ['#C0C0C0', '#808080'],
  gold: ['#FFD700', '#FFA500'],
  platinum: ['#E5E4E2', '#9370DB'],
};

export default function LevelCard({ level, points }) {
  const levelData = LEVELS[level];
  const { progress, pointsToNext, nextLevel } = getLevelProgress(points);

  return (
    <LinearGradient colors={LEVEL_GRADIENTS[level]} style={styles.card}>
      <Text style={styles.emoji}>{levelData.emoji}</Text>
      <Text style={styles.levelName}>{levelData.name.toUpperCase()}</Text>
      <Text style={styles.points}>{points.toLocaleString()} puntos</Text>
      
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} />
      </View>
      
      {nextLevel && (
        <Text style={styles.nextLevel}>{pointsToNext} pts para {nextLevel}</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { padding: SPACING.xl, borderRadius: 16, alignItems: 'center', marginHorizontal: SPACING.lg, marginVertical: SPACING.md },
  emoji: { fontSize: 48, marginBottom: SPACING.sm },
  levelName: { fontSize: 24, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: SPACING.xs },
  points: { fontSize: 32, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: SPACING.lg },
  progressContainer: { width: '100%', marginBottom: SPACING.sm },
  nextLevel: { fontSize: 14, color: COLORS.text.primary, opacity: 0.8 },
});
