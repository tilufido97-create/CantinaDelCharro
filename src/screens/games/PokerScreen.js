import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { createDeck } from '../../utils/games/cardDeck';
import { evaluateHand, determineWinner } from '../../utils/games/pokerLogic';

export default function PokerScreen({ navigation }) {
  const [deck, setDeck] = useState(createDeck());
  const [players, setPlayers] = useState([
    { id: 1, name: 'Tú', cards: [], chips: 200, bet: 0, folded: false },
    { id: 2, name: 'Bot', cards: [], chips: 200, bet: 0, folded: false }
  ]);
  const [communityCards, setCommunityCards] = useState([]);
  const [pot, setPot] = useState(0);
  const [gamePhase, setGamePhase] = useState('betting'); // betting, flop, showdown
  const [currentPlayer, setCurrentPlayer] = useState(0);

  const dealCards = () => {
    const newDeck = [...deck];
    const newPlayers = players.map(p => ({
      ...p,
      cards: [newDeck.pop(), newDeck.pop()],
      bet: 0,
      folded: false
    }));
    setPlayers(newPlayers);
    setDeck(newDeck);
    setCommunityCards([]);
    setPot(0);
    setGamePhase('betting');
  };

  const handleBet = (amount) => {
    const newPlayers = [...players];
    newPlayers[currentPlayer].bet += amount;
    newPlayers[currentPlayer].chips -= amount;
    setPlayers(newPlayers);
    setPot(pot + amount);
    
    if (currentPlayer === 0) {
      setTimeout(() => botAction(), 1000);
    } else {
      setGamePhase('flop');
      showFlop();
    }
  };

  const handleFold = () => {
    const newPlayers = [...players];
    newPlayers[currentPlayer].folded = true;
    setPlayers(newPlayers);
    Alert.alert('Fold', 'Bebes 1 shot', [{ text: 'OK', onPress: dealCards }]);
  };

  const botAction = () => {
    const action = Math.random() > 0.3 ? 'call' : 'fold';
    if (action === 'call') {
      handleBet(10);
    } else {
      const newPlayers = [...players];
      newPlayers[1].folded = true;
      setPlayers(newPlayers);
      Alert.alert('Bot Fold', 'Ganaste!', [{ text: 'OK', onPress: dealCards }]);
    }
  };

  const showFlop = () => {
    const newDeck = [...deck];
    setCommunityCards([newDeck.pop(), newDeck.pop(), newDeck.pop()]);
    setDeck(newDeck);
    setTimeout(showdown, 2000);
  };

  const showdown = () => {
    setGamePhase('showdown');
    const winnerId = determineWinner(players, communityCards);
    const winner = players.find(p => p.id === winnerId);
    const hand = evaluateHand(winner.cards, communityCards);
    
    Alert.alert(
      `${winner.name} gana!`,
      `${hand.name}\nPot: ${pot} fichas\nPerdedor bebe 1 shot`,
      [{ text: 'Nueva mano', onPress: dealCards }]
    );
  };

  const renderCard = (card, hidden = false) => (
    <View style={[styles.card, { borderColor: card.color === 'red' ? '#FF3B30' : '#000' }]}>
      {hidden ? (
        <Text style={styles.cardBack}>🎴</Text>
      ) : (
        <>
          <Text style={[styles.cardValue, { color: card.color === 'red' ? '#FF3B30' : '#000' }]}>
            {card.value}
          </Text>
          <Text style={styles.cardSuit}>{card.suit}</Text>
        </>
      )}
    </View>
  );

  useEffect(() => {
    dealCards();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🃏 Poker</Text>
        <Text style={styles.pot}>💰 {pot}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.opponentSection}>
          <Text style={styles.playerName}>{players[1].name} - {players[1].chips} fichas</Text>
          <View style={styles.cardsRow}>
            {players[1].cards.map((card, i) => (
              <View key={i}>{renderCard(card, gamePhase !== 'showdown')}</View>
            ))}
          </View>
        </View>

        {communityCards.length > 0 && (
          <View style={styles.communitySection}>
            <Text style={styles.label}>FLOP</Text>
            <View style={styles.cardsRow}>
              {communityCards.map((card, i) => (
                <View key={i}>{renderCard(card)}</View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.playerSection}>
          <View style={styles.cardsRow}>
            {players[0].cards.map((card, i) => (
              <View key={i}>{renderCard(card)}</View>
            ))}
          </View>
          <Text style={styles.playerName}>Tus fichas: {players[0].chips}</Text>
        </View>

        {gamePhase === 'betting' && currentPlayer === 0 && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnFold} onPress={handleFold}>
              <Text style={styles.btnText}>Fold</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCall} onPress={() => handleBet(10)}>
              <Text style={styles.btnText}>Call 10</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnRaise} onPress={() => handleBet(20)}>
              <Text style={styles.btnText}>Raise 20</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.info}>🍺 Perdedor bebe 1 shot</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D4D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.bg.primary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  pot: { fontSize: 18, fontWeight: 'bold', color: COLORS.accent.gold },
  content: { flex: 1, padding: SPACING.lg },
  opponentSection: { alignItems: 'center', marginBottom: SPACING.xl },
  playerSection: { alignItems: 'center', marginTop: SPACING.xl },
  communitySection: { alignItems: 'center', marginVertical: SPACING.xl },
  playerName: { fontSize: 16, color: COLORS.text.primary, marginBottom: SPACING.sm },
  label: { fontSize: 14, color: COLORS.text.tertiary, marginBottom: SPACING.sm },
  cardsRow: { flexDirection: 'row', gap: SPACING.sm },
  card: { width: 60, height: 85, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 2, padding: SPACING.xs, alignItems: 'center' },
  cardValue: { fontSize: 18, fontWeight: 'bold' },
  cardSuit: { fontSize: 24 },
  cardBack: { fontSize: 40 },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xl },
  btnFold: { flex: 1, backgroundColor: COLORS.error, padding: SPACING.md, borderRadius: 8, alignItems: 'center' },
  btnCall: { flex: 1, backgroundColor: COLORS.warning, padding: SPACING.md, borderRadius: 8, alignItems: 'center' },
  btnRaise: { flex: 1, backgroundColor: COLORS.success, padding: SPACING.md, borderRadius: 8, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  info: { textAlign: 'center', color: COLORS.text.secondary, marginTop: SPACING.lg },
});
