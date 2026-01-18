import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { createDeck } from '../../utils/games/cardDeck';
import { calculateHandValue, dealerShouldHit, determineWinner, isBlackjack } from '../../utils/games/blackjackLogic';

export default function BlackjackScreen({ navigation }) {
  const [deck, setDeck] = useState(createDeck());
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [bet, setBet] = useState(20);
  const [gamePhase, setGamePhase] = useState('betting');

  const dealInitial = () => {
    const newDeck = [...deck];
    const player = [newDeck.pop(), newDeck.pop()];
    const dealer = [newDeck.pop(), newDeck.pop()];
    
    setPlayerHand(player);
    setDealerHand(dealer);
    setDeck(newDeck);
    setGamePhase('playing');
    
    if (isBlackjack(player)) {
      setTimeout(() => handleStand(), 1000);
    }
  };

  const handleHit = () => {
    const newDeck = [...deck];
    const newHand = [...playerHand, newDeck.pop()];
    setPlayerHand(newHand);
    setDeck(newDeck);
    
    if (calculateHandValue(newHand) > 21) {
      endGame('bust');
    }
  };

  const handleStand = () => {
    setGamePhase('dealer');
    let newDealerHand = [...dealerHand];
    let newDeck = [...deck];
    
    while (dealerShouldHit(newDealerHand)) {
      newDealerHand.push(newDeck.pop());
    }
    
    setDealerHand(newDealerHand);
    setDeck(newDeck);
    
    setTimeout(() => {
      const winner = determineWinner(playerHand, newDealerHand);
      endGame(winner);
    }, 1000);
  };

  const endGame = (result) => {
    setGamePhase('finished');
    
    let message = '';
    if (result === 'bust') message = 'Te pasaste!\nBebes 2 shots';
    else if (result === 'player') message = isBlackjack(playerHand) ? 'Blackjack!\nAsignas 2 shots' : 'Ganaste!\nAsignas 1 shot';
    else if (result === 'dealer') message = 'Perdiste\nBebes 1 shot';
    else message = 'Empate';
    
    Alert.alert('Resultado', message, [{ text: 'Nueva mano', onPress: resetGame }]);
  };

  const resetGame = () => {
    setDeck(createDeck());
    setPlayerHand([]);
    setDealerHand([]);
    setGamePhase('betting');
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
    if (gamePhase === 'betting') {
      dealInitial();
    }
  }, [gamePhase]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎰 Blackjack</Text>
        <Text style={styles.bet}>Apuesta: {bet}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.dealerSection}>
          <Text style={styles.label}>
            DEALER: {gamePhase !== 'playing' ? calculateHandValue(dealerHand) : '?'}
          </Text>
          <View style={styles.cardsRow}>
            {dealerHand.map((card, i) => (
              <View key={i}>{renderCard(card, gamePhase === 'playing' && i === 1)}</View>
            ))}
          </View>
        </View>

        <View style={styles.playerSection}>
          <Text style={styles.label}>TÚ: {calculateHandValue(playerHand)}</Text>
          <View style={styles.cardsRow}>
            {playerHand.map((card, i) => (
              <View key={i}>{renderCard(card)}</View>
            ))}
          </View>
        </View>

        {gamePhase === 'playing' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnHit} onPress={handleHit}>
              <Text style={styles.btnText}>PEDIR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnStand} onPress={handleStand}>
              <Text style={styles.btnText}>PLANTARSE</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.info}>🍺 Te pasas = 2 shots</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D4D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.bg.primary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  bet: { fontSize: 16, color: COLORS.accent.gold },
  content: { flex: 1, padding: SPACING.lg, justifyContent: 'space-around' },
  dealerSection: { alignItems: 'center' },
  playerSection: { alignItems: 'center' },
  label: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: SPACING.md },
  cardsRow: { flexDirection: 'row', gap: SPACING.sm },
  card: { width: 70, height: 100, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 2, padding: SPACING.sm, alignItems: 'center', justifyContent: 'center' },
  cardValue: { fontSize: 20, fontWeight: 'bold' },
  cardSuit: { fontSize: 28 },
  cardBack: { fontSize: 50 },
  actions: { flexDirection: 'row', gap: SPACING.md },
  btnHit: { flex: 1, backgroundColor: COLORS.success, padding: SPACING.lg, borderRadius: 12, alignItems: 'center' },
  btnStand: { flex: 1, backgroundColor: COLORS.error, padding: SPACING.lg, borderRadius: 12, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  info: { textAlign: 'center', color: COLORS.text.secondary, fontSize: 14 },
});
