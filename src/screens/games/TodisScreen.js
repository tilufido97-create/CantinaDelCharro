import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import Button from '../../components/common/Button';

export default function TodisScreen({ navigation }) {
  const [gamePhase, setGamePhase] = useState('rules');
  const [currentDice, setCurrentDice] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const diceRules = {
    1: { text: "¡TODOS TOMAN!", emoji: "🍻", action: "Todos los jugadores deben beber" },
    2: { text: "OBLIGAS A ALGUIEN", emoji: "👉", action: "Eliges a un jugador para que beba" },
    3: { text: "EL DE TU DERECHA", emoji: "➡️", action: "El jugador a tu derecha debe beber" },
    4: { text: "EL DE TU IZQUIERDA", emoji: "⬅️", action: "El jugador a tu izquierda debe beber" },
    5: { text: "TOMAS SOLO", emoji: "😵", action: "Solo tú debes beber" },
    6: { text: "¡TE SALVASTE!", emoji: "🎉", action: "No bebe nadie, sigues jugando" }
  };

  const rollDice = () => {
    setIsRolling(true);
    
    // Simular animación de dado girando
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
          const rule = diceRules[finalResult];
          Alert.alert(
            `🎲 Resultado: ${finalResult}`,
            `${rule.emoji} ${rule.text}\n\n${rule.action}`,
            [{ text: 'Entendido', onPress: () => {} }]
          );
        }, 500);
      }
    }, 100);
  };

  if (gamePhase === 'rules') {
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
                <Text style={styles.ruleText}>Los jugadores se sientan en círculo siguiendo las manecillas del reloj.</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>•</Text>
                <Text style={styles.ruleText}>Cada jugador tira el dado en su turno y sigue la regla correspondiente.</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>•</Text>
                <Text style={styles.ruleText}>El turno pasa al siguiente jugador en sentido horario.</Text>
              </View>
            </View>
            
            <View style={styles.diceRulesContainer}>
              <Text style={styles.diceRulesTitle}>🎲 Reglas de los Dados:</Text>
              
              {Object.entries(diceRules).map(([number, rule]) => (
                <View key={number} style={styles.diceRuleItem}>
                  <View style={styles.diceNumber}>
                    <Text style={styles.diceNumberText}>{number}</Text>
                  </View>
                  <View style={styles.diceRuleContent}>
                    <Text style={styles.diceRuleTitle}>{rule.emoji} {rule.text}</Text>
                    <Text style={styles.diceRuleDescription}>{rule.action}</Text>
                  </View>
                </View>
              ))}
            </View>
            
            <Button
              title="🎯 Empezar a Jugar"
              onPress={() => setGamePhase('playing')}
              variant="primary"
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (gamePhase === 'playing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setGamePhase('rules')}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎲 Todis</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.gameContent}>
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>🎲 Tira el Dado</Text>
            <Text style={styles.gameSubtitle}>Toca el dado para lanzarlo</Text>
          </View>
          
          <View style={styles.diceContainer}>
            <TouchableOpacity 
              style={[styles.dice, isRolling && styles.diceRolling]} 
              onPress={rollDice}
              disabled={isRolling}
            >
              <Text style={styles.diceText}>
                {currentDice ? currentDice : '?'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {currentDice && !isRolling && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>
                {diceRules[currentDice].emoji} {diceRules[currentDice].text}
              </Text>
              <Text style={styles.resultDescription}>
                {diceRules[currentDice].action}
              </Text>
            </View>
          )}
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>💡 Recordatorio:</Text>
            <Text style={styles.instructionsText}>
              Los turnos siguen las manecillas del reloj ⏰
            </Text>
            <Text style={styles.instructionsText}>
              Después de cumplir la regla, pasa el turno al siguiente jugador
            </Text>
          </View>
          
          <Button
            title="🔄 Nuevo Juego"
            onPress={() => {
              setCurrentDice(null);
              setGamePhase('rules');
            }}
            variant="secondary"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bg.tertiary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  content: { flex: 1 },
  contentContainer: { padding: SPACING.lg },
  
  // Rules styles
  rulesCard: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, alignItems: 'center' },
  iconLarge: { fontSize: 80, marginBottom: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.sm },
  subtitle: { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.xl },
  
  rulesContainer: { width: '100%', marginBottom: SPACING.xl },
  rulesTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginBottom: SPACING.lg, textAlign: 'center' },
  ruleItem: { flexDirection: 'row', marginBottom: SPACING.md, alignItems: 'flex-start' },
  ruleNumber: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginRight: SPACING.md, minWidth: 20 },
  ruleText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, flex: 1, lineHeight: 24 },
  
  diceRulesContainer: { width: '100%', marginBottom: SPACING.xl },
  diceRulesTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginBottom: SPACING.lg, textAlign: 'center' },
  diceRuleItem: { flexDirection: 'row', marginBottom: SPACING.lg, alignItems: 'center', backgroundColor: COLORS.bg.tertiary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md },
  diceNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.accent.gold, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  diceNumberText: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.bg.primary },
  diceRuleContent: { flex: 1 },
  diceRuleTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.xs },
  diceRuleDescription: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  
  // Game styles
  gameContent: { flex: 1, padding: SPACING.xl, alignItems: 'center', justifyContent: 'space-between' },
  gameInfo: { alignItems: 'center', marginTop: SPACING.xl },
  gameTitle: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.sm },
  gameSubtitle: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary },
  
  diceContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dice: { width: 120, height: 120, backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.xl, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.accent.gold },
  diceRolling: { backgroundColor: COLORS.accent.gold + '40' },
  diceText: { fontSize: 60, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold },
  
  resultContainer: { backgroundColor: COLORS.bg.secondary, padding: SPACING.xl, borderRadius: BORDER_RADIUS.xl, alignItems: 'center', marginBottom: SPACING.xl },
  resultTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, textAlign: 'center', marginBottom: SPACING.md },
  resultDescription: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, textAlign: 'center' },
  
  instructionsContainer: { backgroundColor: COLORS.bg.tertiary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.xl, width: '100%' },
  instructionsTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginBottom: SPACING.sm, textAlign: 'center' },
  instructionsText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, textAlign: 'center', marginBottom: SPACING.xs },
});