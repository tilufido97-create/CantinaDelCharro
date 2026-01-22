import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { COCKTAILS, INGREDIENTS, evaluateCocktail } from '../../constants/cocktailRecipes';
import Button from '../../components/common/Button';

export default function MixologyMasterScreen({ navigation }) {
  const [gamePhase, setGamePhase] = useState('rules');
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [betType, setBetType] = useState('vasos');
  const [betAmount, setBetAmount] = useState(1);
  const [playerOrder, setPlayerOrder] = useState([]);
  const [roundResults, setRoundResults] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [targetRecipe, setTargetRecipe] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [shakeProgress, setShakeProgress] = useState(0);

  const initializePlayerOrder = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setPlayerOrder(shuffled);
    setCurrentPlayerIndex(0);
  };

  const startGame = () => {
    initializePlayerOrder();
    setTargetRecipe(COCKTAILS[Math.floor(Math.random() * COCKTAILS.length)]);
    setGamePhase('playing');
  };

  const addPlayer = (name) => {
    if (name.trim() && players.length < 8) {
      setPlayers([...players, { name: name.trim(), totalScore: 0 }]);
    }
  };

  const toggleIngredient = (id) => {
    if (selectedIngredients.includes(id)) {
      setSelectedIngredients(prev => prev.filter(i => i !== id));
    } else if (selectedIngredients.length < 7) {
      setSelectedIngredients(prev => [...prev, id]);
    }
  };

  useEffect(() => {
    if (gamePhase === 'playing') {
      const subscription = Accelerometer.addListener(data => {
        const movement = Math.abs(data.x) + Math.abs(data.y);
        if (movement > 2 && selectedIngredients.length > 0) {
          setShakeProgress(prev => Math.min(prev + 5, 100));
        }
      });
      Accelerometer.setUpdateInterval(100);
      return () => subscription.remove();
    }
  }, [selectedIngredients, gamePhase]);

  useEffect(() => {
    if (shakeProgress >= 100 && gamePhase === 'playing') {
      const similarity = evaluateCocktail(selectedIngredients, targetRecipe);
      let points = similarity === 100 ? 200 : similarity >= 80 ? 150 : similarity >= 60 ? 100 : 50;
      
      const updatedPlayers = [...players];
      const playerIndex = updatedPlayers.findIndex(p => p.name === playerOrder[currentPlayerIndex].name);
      updatedPlayers[playerIndex].totalScore += points;
      setPlayers(updatedPlayers);
      
      const result = {
        player: playerOrder[currentPlayerIndex].name,
        points,
        similarity,
        round: currentRound
      };
      setRoundResults([...roundResults, result]);
      
      if (currentPlayerIndex < playerOrder.length - 1) {
        const nextPlayer = playerOrder[currentPlayerIndex + 1];
        Alert.alert(
          '🎯 Siguiente Turno',
          `Le toca a ${nextPlayer.name}`,
          [{ text: 'OK', onPress: () => {
            setCurrentPlayerIndex(currentPlayerIndex + 1);
            resetForNextPlayer();
          }}]
        );
      } else {
        if (currentRound < 3) {
          const nextPlayer = playerOrder[0];
          Alert.alert(
            '🏆 Fin de Ronda',
            `Ronda ${currentRound} completada.\n\nRonda ${currentRound + 1}\nEmpieza: ${nextPlayer.name}`,
            [{ text: 'Continuar', onPress: () => {
              setCurrentRound(currentRound + 1);
              setCurrentPlayerIndex(0);
              resetForNextPlayer();
            }}]
          );
        } else {
          Alert.alert(
            '🎉 Juego Terminado',
            '¡3 rondas completadas!\nVer resultados...',
            [{ text: 'Ver Resultados', onPress: () => setGamePhase('results') }]
          );
        }
      }
    }
  }, [shakeProgress]);

  const resetForNextPlayer = () => {
    setSelectedIngredients([]);
    setShakeProgress(0);
    setTargetRecipe(COCKTAILS[Math.floor(Math.random() * COCKTAILS.length)]);
  };

  if (gamePhase === 'rules') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🍹 Mixology Master</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.rulesCard}>
            <Text style={styles.iconLarge}>🍹</Text>
            <Text style={styles.title}>Mixology Master</Text>
            <Text style={styles.subtitle}>¡Crea el cóctel perfecto!</Text>
            
            <View style={styles.rulesContainer}>
              <Text style={styles.rulesTitle}>📋 Reglas del Juego:</Text>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>1.</Text>
                <Text style={styles.ruleText}>Cada jugador debe crear un cóctel basado en las pistas dadas.</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>2.</Text>
                <Text style={styles.ruleText}>Selecciona ingredientes y agita el teléfono para mezclar.</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>3.</Text>
                <Text style={styles.ruleText}>Se juegan 3 rondas. El jugador con menos puntos al final bebe.</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>4.</Text>
                <Text style={styles.ruleText}>Puntos: Perfecto=200, Muy bueno=150, Bueno=100, Regular=50.</Text>
              </View>
            </View>
            
            <Button
              title="🎯 Configurar Juego"
              onPress={() => setGamePhase('setup')}
              variant="primary"
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (gamePhase === 'setup') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setGamePhase('rules')}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚙️ Configuración</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>⚙️ Configuración</Text>
            
            <View style={styles.betSection}>
              <Text style={styles.sectionTitle}>Tipo de Apuesta:</Text>
              <View style={styles.betButtons}>
                <TouchableOpacity
                  style={[styles.betButton, betType === 'vasos' && styles.betButtonActive]}
                  onPress={() => setBetType('vasos')}
                >
                  <Text style={[styles.betButtonText, betType === 'vasos' && styles.betButtonTextActive]}>🥃 Vasos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.betButton, betType === 'porcentajes' && styles.betButtonActive]}
                  onPress={() => setBetType('porcentajes')}
                >
                  <Text style={[styles.betButtonText, betType === 'porcentajes' && styles.betButtonTextActive]}>📊 Porcentajes</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.amountSection}>
              <Text style={styles.sectionTitle}>Cantidad:</Text>
              <View style={styles.amountButtons}>
                {(betType === 'vasos' ? [
                  { value: 1, label: '1 vaso' },
                  { value: 2, label: '2 vasos' },
                  { value: 3, label: '3 vasos' }
                ] : [
                  { value: 0.15, label: '15%' },
                  { value: 0.25, label: '25%' },
                  { value: 0.5, label: '50%' }
                ]).map(item => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.amountButton, betAmount === item.value && styles.amountButtonActive]}
                    onPress={() => setBetAmount(item.value)}
                  >
                    <Text style={[styles.amountButtonText, betAmount === item.value && styles.amountButtonTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.playersSection}>
              <Text style={styles.sectionTitle}>Jugadores ({players.length}/8):</Text>
              
              <View style={styles.addPlayerContainer}>
                <TextInput
                  style={styles.playerInput}
                  placeholder="Nombre del jugador"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={newPlayerName}
                  onChangeText={setNewPlayerName}
                  maxLength={15}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    addPlayer(newPlayerName);
                    setNewPlayerName('');
                  }}
                  disabled={!newPlayerName.trim() || players.length >= 8}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.playersList}>
                {players.map((player, index) => (
                  <View key={index} style={styles.playerItem}>
                    <Text style={styles.playerName}>👤 {player.name}</Text>
                    <TouchableOpacity
                      onPress={() => setPlayers(players.filter((_, i) => i !== index))}
                    >
                      <Text style={styles.removeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
            
            {players.length >= 2 && (
              <Button
                title="🚀 Empezar Juego"
                onPress={startGame}
                variant="primary"
                fullWidth
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (gamePhase === 'playing') {
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
          <View style={styles.turnInfo}>
            <Text style={styles.turnText}>🏆 Ronda {currentRound}/3</Text>
            <Text style={styles.currentPlayer}>🎯 Turno de: {playerOrder[currentPlayerIndex]?.name}</Text>
          </View>
          
          <View style={styles.hintsCard}>
            <Text style={styles.hintsTitle}>💡 Pistas:</Text>
            {targetRecipe?.hints.map((hint, i) => (
              <Text key={i} style={styles.hint}>• {hint}</Text>
            ))}
          </View>

          <View style={styles.shakerContainer}>
            <Text style={styles.shakerEmoji}>🥤</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${shakeProgress}%` }]} />
            </View>
            <Text style={styles.shakeText}>
              {shakeProgress < 100 ? '📱 Agita el teléfono' : '✅ ¡Perfecto!'}
            </Text>
          </View>

          <View style={styles.selectedContainer}>
            <Text style={styles.selectedTitle}>🧪 Ingredientes agregados:</Text>
            {selectedIngredients.length === 0 ? (
              <Text style={styles.emptyText}>Ninguno seleccionado</Text>
            ) : (
              selectedIngredients.map(id => {
                const ing = INGREDIENTS.find(i => i.id === id);
                return <Text key={id} style={styles.selectedItem}>{ing.emoji} {ing.name}</Text>;
              })
            )}
          </View>

          <View style={styles.ingredientsContainer}>
            <Text style={styles.ingredientsTitle}>🧪 Ingredientes disponibles:</Text>
            <View style={styles.ingredientsGrid}>
              {INGREDIENTS.map(ingredient => (
                <TouchableOpacity
                  key={ingredient.id}
                  style={[styles.ingredientCard, selectedIngredients.includes(ingredient.id) && styles.ingredientSelected]}
                  onPress={() => toggleIngredient(ingredient.id)}
                >
                  <Text style={styles.ingredientEmoji}>{ingredient.emoji}</Text>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (gamePhase === 'results') {
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const lowestScore = sortedPlayers[sortedPlayers.length - 1].totalScore;
    const losers = sortedPlayers.filter(player => player.totalScore === lowestScore);
    const drinkAmount = betType === 'vasos' ? `${betAmount} vaso${betAmount > 1 ? 's' : ''}` : `${betAmount * 100}% de vaso`;
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🏆 Resultados</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>🏆 Resultados Finales</Text>
            
            <View style={styles.scoreBoard}>
              {sortedPlayers.map((player, index) => (
                <View key={player.name} style={[styles.scoreItem, index === 0 && styles.winner]}>
                  <Text style={styles.position}>{index + 1}°</Text>
                  <Text style={styles.playerNameResult}>{player.name}</Text>
                  <Text style={styles.score}>{player.totalScore} pts</Text>
                  {index === 0 && <Text style={styles.crown}>👑</Text>}
                </View>
              ))}
            </View>
            
            <View style={styles.penaltyCard}>
              <Text style={styles.penaltyTitle}>🍺 Castigo</Text>
              {losers.length === 1 ? (
                <Text style={styles.penaltyText}>
                  {losers[0].name} debe beber {drinkAmount}
                </Text>
              ) : (
                <View>
                  <Text style={styles.penaltyText}>
                    ¡Empate! Los siguientes jugadores deben beber {drinkAmount}:
                  </Text>
                  {losers.map((loser, index) => (
                    <Text key={loser.name} style={styles.loserName}>
                      • {loser.name}
                    </Text>
                  ))}
                </View>
              )}
            </View>
            
            <Button
              title="🔄 Jugar de Nuevo"
              onPress={() => {
                setGamePhase('rules');
                setPlayers([]);
                setCurrentRound(1);
                setRoundResults([]);
                setNewPlayerName('');
              }}
              variant="primary"
              fullWidth
            />
          </View>
        </ScrollView>
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
  rulesCard: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg },
  iconLarge: { fontSize: 80, marginBottom: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.sm },
  subtitle: { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.lg },
  rulesContainer: { width: '100%', marginVertical: SPACING.lg },
  rulesTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginBottom: SPACING.lg, textAlign: 'center' },
  ruleItem: { flexDirection: 'row', marginBottom: SPACING.md, alignItems: 'flex-start' },
  ruleNumber: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginRight: SPACING.md, minWidth: 25 },
  ruleText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, flex: 1, lineHeight: 24 },
  
  // Setup styles
  setupCard: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl },
  setupTitle: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, textAlign: 'center', marginBottom: SPACING.xl },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.accent.gold, marginBottom: SPACING.lg },
  
  betSection: { marginBottom: SPACING.xl },
  betButtons: { flexDirection: 'row', gap: SPACING.md },
  betButton: { flex: 1, padding: SPACING.lg, backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  betButtonActive: { backgroundColor: COLORS.accent.gold },
  betButtonText: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  betButtonTextActive: { color: COLORS.bg.primary, fontWeight: TYPOGRAPHY.weights.bold },
  
  amountSection: { marginBottom: SPACING.xl },
  amountButtons: { flexDirection: 'row', gap: SPACING.sm },
  amountButton: { flex: 1, padding: SPACING.md, backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  amountButtonActive: { backgroundColor: COLORS.accent.gold },
  amountButtonText: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.sm },
  amountButtonTextActive: { color: COLORS.bg.primary, fontWeight: TYPOGRAPHY.weights.bold },
  
  playersSection: { marginBottom: SPACING.xl },
  addPlayerContainer: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  playerInput: { flex: 1, backgroundColor: COLORS.bg.tertiary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.md, color: COLORS.text.primary, fontSize: TYPOGRAPHY.sizes.base },
  addButton: { backgroundColor: COLORS.accent.gold, width: 60, height: 60, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: COLORS.bg.primary, fontSize: 28, fontWeight: TYPOGRAPHY.weights.bold },
  playersList: { gap: SPACING.md },
  playerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.bg.tertiary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.md },
  playerName: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  removeButton: { color: COLORS.text.tertiary, fontSize: 20 },
  
  // Game styles
  turnInfo: { backgroundColor: COLORS.bg.secondary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg, alignItems: 'center' },
  turnText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: SPACING.xs },
  currentPlayer: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold },
  
  hintsCard: { backgroundColor: COLORS.bg.secondary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg },
  hintsTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginBottom: SPACING.md },
  hint: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: SPACING.xs, lineHeight: 20 },
  
  shakerContainer: { alignItems: 'center', marginBottom: SPACING.lg, padding: SPACING.lg },
  shakerEmoji: { fontSize: 80, marginBottom: SPACING.lg },
  progressBar: { width: '100%', height: 24, backgroundColor: COLORS.bg.tertiary, borderRadius: 12, overflow: 'hidden', marginBottom: SPACING.md },
  progressFill: { height: '100%', backgroundColor: COLORS.accent.gold },
  shakeText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, fontWeight: TYPOGRAPHY.weights.semibold },
  
  selectedContainer: { backgroundColor: COLORS.bg.secondary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg },
  selectedTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.md },
  emptyText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary, fontStyle: 'italic' },
  selectedItem: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: SPACING.xs },
  
  ingredientsContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  ingredientsTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginBottom: SPACING.lg },
  ingredientsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  ingredientCard: { width: '30%', aspectRatio: 1, backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', padding: SPACING.sm },
  ingredientSelected: { borderColor: COLORS.accent.gold, backgroundColor: COLORS.accent.gold + '20' },
  ingredientEmoji: { fontSize: 28, marginBottom: SPACING.xs },
  ingredientName: { fontSize: 11, color: COLORS.text.primary, textAlign: 'center', fontWeight: TYPOGRAPHY.weights.medium },
  
  // Results styles
  resultsCard: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl },
  resultsTitle: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, textAlign: 'center', marginBottom: SPACING.xl },
  scoreBoard: { marginBottom: SPACING.xl },
  scoreItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg.tertiary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md },
  winner: { backgroundColor: COLORS.accent.gold + '20', borderWidth: 2, borderColor: COLORS.accent.gold },
  position: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, width: 40 },
  playerNameResult: { flex: 1, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.semibold },
  score: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  crown: { fontSize: 20, marginLeft: SPACING.sm },
  
  penaltyCard: { backgroundColor: COLORS.bg.tertiary, padding: SPACING.xl, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.xl, alignItems: 'center' },
  penaltyTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold, marginBottom: SPACING.md },
  penaltyText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, textAlign: 'center', fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  loserName: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.accent.gold, textAlign: 'center', fontWeight: TYPOGRAPHY.weights.bold, marginBottom: SPACING.xs },
});