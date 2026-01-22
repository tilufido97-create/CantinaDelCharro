import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Button from '../../components/common/Button';

export default function GamesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎮 Juegos</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Juegos Disponibles */}
        <View style={styles.availableGamesCard}>
          <Text style={styles.sectionTitle}>🎯 Juegos Disponibles</Text>
          
          <View style={styles.gameButtonsContainer}>
            <Button
              title="🔫 Ruleta Rusa"
              onPress={() => navigation.navigate('RuletaRusa')}
              variant="primary"
              fullWidth
            />
            
            <Button
              title="🧠 Cultura Chupística"
              onPress={() => navigation.navigate('CulturaChupistica')}
              variant="outline"
              fullWidth
            />
            
            <Button
              title="🃏 Poker"
              onPress={() => navigation.navigate('Poker')}
              variant="outline"
              fullWidth
            />
            
            <Button
              title="🎰 Blackjack"
              onPress={() => navigation.navigate('Blackjack')}
              variant="outline"
              fullWidth
            />
            
            <Button
              title="🍹 Mixology Master"
              onPress={() => navigation.navigate('MixologyMaster')}
              variant="outline"
              fullWidth
            />
            
            <Button
              title="🎯 Shot Challenge"
              onPress={() => navigation.navigate('ShotChallenge')}
              variant="outline"
              fullWidth
            />
            
            <Button
              title="🎲 Todis"
              onPress={() => navigation.navigate('Todis')}
              variant="outline"
              fullWidth
            />
            
            <Button
              title="👤 Impostor Game"
              onPress={() => navigation.navigate('ImpostorGame')}
              variant="outline"
              fullWidth
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.sectionTitle}>🎮 FASE 6</Text>
          
          <Text style={styles.comingSoonText}>
            8 juegos disponibles. ¡Diviértete y gana puntos!
          </Text>

          <Text style={styles.phaseInfo}>✅ 8 juegos activos</Text>
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
  },
  availableGamesCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  comingSoonCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  gameButtonsContainer: {
    gap: SPACING.md,
  },
  iconLarge: {
    fontSize: 80,
    marginBottom: SPACING.lg,
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
