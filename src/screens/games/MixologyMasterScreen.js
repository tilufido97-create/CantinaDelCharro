import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { COCKTAILS, INGREDIENTS, evaluateCocktail } from '../../constants/cocktailRecipes';
import Button from '../../components/common/Button';

export default function MixologyMasterScreen({ navigation }) {
  const [gameMode, setGameMode] = useState('setup'); // setup, playing, results
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(3);
  const [betMode, setBetMode] = useState(''); // vasos, porcentajes
  const [betAmount, setBetAmount] = useState('');
  const [playerName, setPlayerName] = useState('');
  
  const [targetRecipe] = useState(COCKTAILS[Math.floor(Math.random() * COCKTAILS.length)]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [shakeProgress, setShakeProgress] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const subscription = Accelerometer.addListener(data => {
      const movement = Math.abs(data.x) + Math.abs(data.y);
      if (movement > 2 && selectedIngredients.length > 0 && gameMode === 'playing') {
        setShakeProgress(prev => Math.min(prev + 5, 100));
        setIsShaking(true);
      } else {
        setIsShaking(false);
      }
    });

    Accelerometer.setUpdateInterval(100);
    return () => subscription.remove();
  }, [selectedIngredients, gameMode]);

  useEffect(() => {
    if (shakeProgress >= 100 && gameMode === 'playing') {
      handleMixComplete();
    }
  }, [shakeProgress, gameMode]);

  const addPlayer = () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Ingresa un nombre válido');
      return;
    }
    if (players.length >= 8) {
      Alert.alert('Error', 'Máximo 8 jugadores');
      return;
    }
    if (players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      Alert.alert('Error', 'Ya existe un jugador con ese nombre');
      return;
    }

    setPlayers([...players, {
      name: playerName,
      scores: [],
      totalScore: 0
    }]);
    setPlayerName('');
  };

  const removePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const startGame = () => {
    if (players.length < 2) {
      Alert.alert('Error', 'Mínimo 2 jugadores');
      return;
    }
    if (!betMode || !betAmount) {
      Alert.alert('Error', 'Configura la apuesta');
      return;
    }
    
    setGameMode('playing');
  };

  const handleMixComplete = () => {
    const similarity = evaluateCocktail(selectedIngredients, targetRecipe);
    const points = similarity === 100 ? 200 : similarity >= 80 ? 150 : similarity >= 60 ? 100 : 50;
    
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].scores.push(points);
    updatedPlayers[currentPlayerIndex].totalScore += points;
    setPlayers(updatedPlayers);

    Alert.alert(
      '🍹 Resultado',
      `${players[currentPlayerIndex].name}\nSimilitud: ${similarity}%\nPuntos: ${points}`,
      [{ text: 'Continuar', onPress: nextTurn }]
    );

    setSelectedIngredients([]);
    setShakeProgress(0);
  };

  const nextTurn = () => {
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    
    if (nextPlayerIndex === 0) {
      // Nueva ronda
      if (currentRound >= totalRounds) {
        showResults();
        return;
      }
      setCurrentRound(currentRound + 1);
    }
    
    setCurrentPlayerIndex(nextPlayerIndex);
    
    // Alerta de cambio de turno
    Alert.alert(
      '🔄 Cambio de turno',
      `Ahora le toca a ${players[nextPlayerIndex].name}\n\nRonda ${currentRound}/${totalRounds}`,
      [{ text: 'Listo', onPress: () => {} }]
    );
  };

  const showResults = () => {
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const maxScore = sortedPlayers[0].totalScore;
    const winners = sortedPlayers.filter(p => p.totalScore === maxScore);
    const losers = sortedPlayers.filter(p => p.totalScore < maxScore);
    
    // Manejar empates entre perdedores
    const loserGroups = {};
    losers.forEach(player => {
      if (!loserGroups[player.totalScore]) {
        loserGroups[player.totalScore] = [];
      }
      loserGroups[player.totalScore].push(player);
    });

    let resultMessage = winners.length > 1 
      ? `🏆 ¡Empate! Ganadores:\n${winners.map(w => w.name).join(', ')}\n\n`
      : `🏆 Ganador: ${winners[0].name}\n\n`;

    resultMessage += '🍺 Deben beber:\n';
    
    Object.keys(loserGroups).forEach(score => {
      const playersWithScore = loserGroups[score];
      if (playersWithScore.length > 1) {
        resultMessage += `• ${playersWithScore.map(p => p.name).join(', ')} (${score} pts): ${betAmount} ${betMode === 'vasos' ? 'vasos' : '%'} c/u\n`;
      } else {
        resultMessage += `• ${playersWithScore[0].name} (${score} pts): ${betAmount} ${betMode === 'vasos' ? 'vasos' : '%'}\n`;
      }
    });

    Alert.alert('🎆 Resultados Finales', resultMessage, [
      { text: 'Nuevo Juego', onPress: resetGame },
      { text: 'Salir', onPress: () => navigation.goBack() }
    ]);
  };

  const resetGame = () => {
    setGameMode('setup');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setCurrentRound(1);
    setBetMode('');
    setBetAmount('');
    setSelectedIngredients([]);
    setShakeProgress(0);
  };

  const toggleIngredient = (id) => {
    if (selectedIngredients.includes(id)) {
      setSelectedIngredients(prev => prev.filter(i => i !== id));
    } else if (selectedIngredients.length < 7) {
      setSelectedIngredients(prev => [...prev, id]);
    }
  };

  if (gameMode === 'setup') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🍹 Mixology Master</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Configuración del Juego</Text>
            
            <View style={styles.betSection}>
              <Text style={styles.sectionTitle}>Modo de Apuesta:</Text>
              <View style={styles.betButtons}>
                <TouchableOpacity
                  style={[styles.betButton, betMode === 'vasos' && styles.betButtonActive]}
                  onPress={() => setBetMode('vasos')}
                >
                  <Text style={[styles.betButtonText, betMode === 'vasos' && styles.betButtonTextActive]}>🍺 Vasos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.betButton, betMode === 'porcentajes' && styles.betButtonActive]}
                  onPress={() => setBetMode('porcentajes')}
                >
                  <Text style={[styles.betButtonText, betMode === 'porcentajes' && styles.betButtonTextActive]}>📊 Porcentajes</Text>
                </TouchableOpacity>
              </View>
              
              {betMode && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={betAmount}
                    onChangeText={setBetAmount}
                    placeholder={betMode === 'vasos' ? 'Ej: 2' : 'Ej: 150'}
                    placeholderTextColor={COLORS.text.tertiary}
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputLabel}>{betMode === 'vasos' ? 'vasos' : '%'}</Text>
                </View>
              )}
            </View>

            <View style={styles.playersSection}>
              <Text style={styles.sectionTitle}>Jugadores ({players.length}/8):</Text>
              
              <View style={styles.addPlayerContainer}>
                <TextInput
                  style={styles.playerInput}
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholder="Nombre del jugador"
                  placeholderTextColor={COLORS.text.tertiary}
                  maxLength={15}
                />
                <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
                  <Ionicons name="add" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>

              {players.map((player, index) => (
                <View key={index} style={styles.playerItem}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <TouchableOpacity onPress={() => removePlayer(index)}>
                    <Ionicons name="close" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Button
              title="🎆 Iniciar Juego"
              onPress={startGame}
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍹 Mixology Master</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gameHeader}>
          <Text style={styles.currentPlayer}>Turno: {players[currentPlayerIndex]?.name}</Text>
          <Text style={styles.roundInfo}>Ronda {currentRound}/{totalRounds}</Text>
        </View>

        <View style={styles.hintsCard}>
          <Text style={styles.hintsTitle}>🍹 Pistas del Cóctel Misterioso:</Text>
          {targetRecipe.hints.map((hint, i) => (
            <Text key={i} style={styles.hint}>• {hint}</Text>
          ))}
        </View>

        <View style={styles.shakerContainer}>
          <Text style={[styles.shakerEmoji, isShaking && styles.shaking]}>🥤</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${shakeProgress}%` }]} />
          </View>
          <Text style={styles.shakeText}>
            {shakeProgress < 100 ? '📱 Agita el teléfono' : '✅ ¡Listo!'}
          </Text>
        </View>

        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>🧪 Ingredientes en tu mezcla ({selectedIngredients.length}/7):</Text>
          {selectedIngredients.length === 0 ? (
            <Text style={styles.emptyText}>Selecciona ingredientes para comenzar a mezclar</Text>
          ) : (
            <View style={styles.selectedGrid}>
              {selectedIngredients.map(id => {
                const ing = INGREDIENTS.find(i => i.id === id);
                return (
                  <View key={id} style={styles.selectedIngredient}>
                    <Text style={styles.selectedEmoji}>{ing.emoji}</Text>
                    <Text style={styles.selectedName}>{ing.name}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.ingredientsSection}>
          <Text style={styles.ingredientsTitle}>🥃 Selecciona tus ingredientes:</Text>
          <View style={styles.ingredientsGrid}>
            {INGREDIENTS.map(ingredient => (
              <TouchableOpacity
                key={ingredient.id}
                style={[
                  styles.ingredientCard, 
                  selectedIngredients.includes(ingredient.id) && styles.ingredientSelected,
                  selectedIngredients.length >= 7 && !selectedIngredients.includes(ingredient.id) && styles.ingredientDisabled
                ]}
                onPress={() => toggleIngredient(ingredient.id)}
                disabled={selectedIngredients.length >= 7 && !selectedIngredients.includes(ingredient.id)}
              >
                <Text style={styles.ingredientEmoji}>{ingredient.emoji}</Text>
                <Text style={[
                  styles.ingredientName,
                  selectedIngredients.includes(ingredient.id) && styles.ingredientNameSelected
                ]}>{ingredient.name}</Text>
                {selectedIngredients.includes(ingredient.id) && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bg.tertiary },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  content: { flex: 1, padding: SPACING.lg },
  
  // Setup styles
  setupCard: { backgroundColor: COLORS.bg.secondary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg },
  setupTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginBottom: SPACING.lg, textAlign: 'center' },
  
  betSection: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, marginBottom: SPACING.sm },
  betButtons: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  betButton: { flex: 1, padding: SPACING.md, backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  betButtonActive: { backgroundColor: COLORS.accent.gold },
  betButtonText: { color: COLORS.text.secondary },
  betButtonTextActive: { color: COLORS.bg.primary, fontWeight: TYPOGRAPHY.weights.semibold },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md },
  input: { flex: 1, height: 50, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, textAlign: 'center' },
  inputLabel: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.bold, marginLeft: SPACING.sm },
  
  playersSection: { marginBottom: SPACING.lg },
  addPlayerContainer: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  playerInput: { flex: 1, height: 50, backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary },
  addButton: { width: 50, height: 50, backgroundColor: COLORS.accent.gold, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  playerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.sm, backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.xs },
  playerName: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary },
  
  // Game styles
  gameHeader: { backgroundColor: COLORS.bg.secondary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currentPlayer: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold },
  roundInfo: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  
  hintsCard: { backgroundColor: COLORS.bg.secondary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg },
  hintsTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginBottom: SPACING.sm },
  hint: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: 4 },
  
  shakerContainer: { alignItems: 'center', marginBottom: SPACING.lg },
  shakerEmoji: { fontSize: 80, marginBottom: SPACING.md },
  shaking: { transform: [{ rotate: '10deg' }] },
  progressBar: { width: '100%', height: 20, backgroundColor: COLORS.bg.tertiary, borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.accent.gold },
  shakeText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, marginTop: SPACING.sm },
  
  selectedContainer: { backgroundColor: COLORS.bg.secondary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.bg.tertiary },
  selectedTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginBottom: SPACING.md, textAlign: 'center' },
  emptyText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary, fontStyle: 'italic', textAlign: 'center', padding: SPACING.md },
  selectedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
  selectedIngredient: { backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, alignItems: 'center', minWidth: 70, borderWidth: 1, borderColor: COLORS.accent.gold },
  selectedEmoji: { fontSize: 20, marginBottom: 2 },
  selectedName: { fontSize: 10, color: COLORS.text.primary, textAlign: 'center', fontWeight: TYPOGRAPHY.weights.medium },
  
  ingredientsSection: { marginBottom: SPACING.lg },
  ingredientsTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.md, textAlign: 'center' },
  ingredientsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'space-between' },
  ingredientCard: { width: '30%', aspectRatio: 1, backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.bg.tertiary, position: 'relative' },
  ingredientSelected: { borderColor: COLORS.accent.gold, backgroundColor: COLORS.bg.tertiary },
  ingredientDisabled: { opacity: 0.5 },
  ingredientEmoji: { fontSize: 28, marginBottom: SPACING.xs },
  ingredientName: { fontSize: 11, color: COLORS.text.primary, textAlign: 'center', fontWeight: TYPOGRAPHY.weights.medium },
  ingredientNameSelected: { color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.bold },
  selectedBadge: { position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.accent.gold, alignItems: 'center', justifyContent: 'center' },
  selectedBadgeText: { fontSize: 12, color: COLORS.bg.primary, fontWeight: TYPOGRAPHY.weights.bold },
});
