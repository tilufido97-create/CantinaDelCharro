import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function GamesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎮 Juegos</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.comingSoonCard}>
          <Text style={styles.iconLarge}>🎮</Text>
          
          <Text style={styles.comingSoonTitle}>Próximamente</Text>
          
          <Text style={styles.comingSoonText}>
            6 juegos sociales están en camino:
          </Text>

          <View style={styles.gamesList}>
            <Text style={styles.gameItem}>🎰 Cantina Roulette</Text>
            <Text style={styles.gameItem}>🍹 Mixology Master</Text>
            <Text style={styles.gameItem}>📸 Shot Challenge</Text>
            <Text style={styles.gameItem}>🧠 Cultura Chupística</Text>
            <Text style={styles.gameItem}>🕵️ Impostor Game</Text>
            <Text style={styles.gameItem}>🃏 Poker & Blackjack</Text>
          </View>

          <Text style={styles.phaseInfo}>Disponible en Fase 6</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.tertiary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80%',
  },
  comingSoonCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
  },
  iconLarge: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  comingSoonTitle: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  comingSoonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  gamesList: {
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  gameItem: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  phaseInfo: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
