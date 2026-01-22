import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import Button from '../../components/common/Button';

const DICE_RULES = {
  1: { emoji: '🍻', title: 'Todos Toman', description: 'Todos los jugadores deben beber' },
  2: { emoji: '👉', title: 'Obligas a Uno', description: 'Eliges a un jugador para que beba' },
  3: { emoji: '➡️', title: 'El de tu Derecha', description: 'El jugador a tu derecha debe beber' },
  4: { emoji: '⬅️', title: 'El de tu Izquierda', description: 'El jugador a tu izquierda debe beber' },
  5: { emoji: '😔', title: 'Tomas Solo', description: 'Solo tú debes beber' },
  6: { emoji: '🎉', title: 'Te Salvaste', description: 'No bebe nadie en esta ronda' }
};

export default function TodisScreen({ navigation }) {
  const [showRules, setShowRules] = useState(true);
  const [showGame, setShowGame] = useState(false);
  const [currentDice, setCurrentDice] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('Jugador 1');

  const handleStartGame = () => {
    setShowRules(false);
    setShowGame(true);
  };

  const rollDice = () => {
    setIsRolling(true);
    setCurrentDice(null);
    
    // Simular animación de dados
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setCurrentDice(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      
      if (rollCount >= 10) {
        clearInterval(rollInterval);
        const finalResult = Math.floor(Math.random() * 6) + 1;
        setCurrentDice(finalResult);
        setIsRolling(false);
        
        // Mostrar resultado
        setTimeout(() => {
          const rule = DICE_RULES[finalResult];
          Alert.alert(
            `🎲 Resultado: ${finalResult}`,
            `${rule.emoji} ${rule.title}\n\n${rule.description}`,
            [
              { text: 'Siguiente Turno', onPress: nextTurn }
            ]
          );
        }, 500);
      }
    }, 100);
  };

  const nextTurn = () => {
    // Aquí podrías implementar un sistema de turnos más complejo
    // Por ahora solo cambia el texto del jugador actual
    setCurrentPlayer(`Jugador ${Math.floor(Math.random() * 4) + 1}`);
    setCurrentDice(null);
  };

  const resetGame = () => {
    setShowRules(true);
    setShowGame(false);
    setCurrentDice(null);
    setIsRolling(false);
    setCurrentPlayer('Jugador 1');
  };

  if (showRules) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎲 Todis</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.rulesCard}>
            <Text style={styles.iconLarge}>🎲</Text>
            <Text style={styles.title}>Todis</Text>
            <Text style={styles.subtitle}>¡El juego de dados más divertido!</Text>
            
            <View style={styles.rulesContainer}>
              <Text style={styles.rulesTitle}>📋 Reglas del Juego:</Text>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>•</Text>
                <Text style={styles.ruleText}>El juego se debe seguir en base al tiempo (manecillas del reloj)</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>•</Text>
                <Text style={styles.ruleText}>Cada jugador tira el dado en su turno</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>•</Text>
                <Text style={styles.ruleText}>Según el número que salga, se aplica la regla correspondiente</Text>
              </View>

              <View style={styles.diceRules}>
                <Text style={styles.diceRulesTitle}>🎯 Significado de los Dados:</Text>
                
                {Object.entries(DICE_RULES).map(([number, rule]) => (
                  <View key={number} style={styles.diceRuleItem}>
                    <View style={styles.diceNumber}>
                      <Text style={styles.diceNumberText}>{number}</Text>
                    </View>
                    <View style={styles.diceRuleContent}>
                      <Text style={styles.diceRuleTitle}>{rule.emoji} {rule.title}</Text>
                      <Text style={styles.diceRuleDescription}>{rule.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            
            <Button
              title="🎯 Iniciar Juego"
              onPress={handleStartGame}
              variant="primary"
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={resetGame}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎲 Todis</Text>
        <TouchableOpacity onPress={resetGame}>
          <Ionicons name="refresh" size={24} color={COLORS.accent.gold} />
        </TouchableOpacity>
      </View>

      <View style={styles.gameContent}>
        <View style={styles.playerInfo}>
          <Text style={styles.currentPlayerText}>Turno de:</Text>
          <Text style={styles.currentPlayerName}>{currentPlayer}</Text>
        </View>

        <View style={styles.diceContainer}>
          <View style={styles.diceBox}>
            {currentDice ? (
              <Text style={styles.diceResult}>{currentDice}</Text>
            ) : (
              <Text style={styles.diceEmoji}>🎲</Text>
            )}
          </View>
          
          {currentDice && !isRolling && (
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>{DICE_RULES[currentDice].emoji}</Text>
              <Text style={styles.resultTitle}>{DICE_RULES[currentDice].title}</Text>
              <Text style={styles.resultDescription}>{DICE_RULES[currentDice].description}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          <Button
            title={isRolling ? "🎲 Rodando..." : "🎲 Tirar Dado"}
            onPress={rollDice}
            variant="primary"
            disabled={isRolling}
            fullWidth
          />
          
          {currentDice && !isRolling && (
            <Button
              title="➡️ Siguiente Turno"
              onPress={nextTurn}
              variant="outline"
              fullWidth
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.tertiary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  rulesCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconLarge: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
  },
  rulesContainer: {
    width: '100%',
    marginVertical: SPACING.lg,
  },
  rulesTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-start',
  },
  ruleNumber: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
    marginRight: SPACING.sm,
    minWidth: 20,
  },
  ruleText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  diceRules: {
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  diceRulesTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.accent.gold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  diceRuleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  diceNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  diceNumberText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.bg.primary,
  },
  diceRuleContent: {
    flex: 1,
  },
  diceRuleTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  diceRuleDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  
  // Game styles
  gameContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  currentPlayerText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  currentPlayerName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
  },
  diceContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceBox: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.accent.gold,
    marginBottom: SPACING.lg,
  },
  diceEmoji: {
    fontSize: 60,
  },
  diceResult: {
    fontSize: 60,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
  },
  resultCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    maxWidth: '90%',
  },
  resultEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  resultDescription: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  actionContainer: {
    gap: SPACING.md,
  },
});