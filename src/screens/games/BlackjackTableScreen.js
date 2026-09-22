import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { createDeck, calculateHandValue, isBlackjack, dealerShouldHit, determineWinner, calculatePayout } from '../../utils/games/blackjackLogic';

export default function BlackjackTableScreen({ navigation, route }) {
  const { bet = 10 } = route.params || {};
  
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameState, setGameState] = useState('betting'); // betting, playing, dealer, finished
  const [balance, setBalance] = useState(100);
  const [currentBet, setCurrentBet] = useState(bet);
  const [message, setMessage] = useState('Haz tu apuesta');

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('betting');
    setMessage('Haz tu apuesta');
  };

  const dealInitialCards = () => {
    if (currentBet > balance) {
      Alert.alert('Saldo insuficiente', 'No tienes suficiente saldo para esta apuesta');
      return;
    }

    const newDeck = [...deck];
    const player = [newDeck.pop(), newDeck.pop()];
    const dealer = [newDeck.pop(), newDeck.pop()];
    
    setPlayerHand(player);
    setDealerHand(dealer);
    setDeck(newDeck);
    setBalance(balance - currentBet);
    setGameState('playing');

    if (isBlackjack(player)) {
      setGameState('finished');
      setMessage('¡BLACKJACK! 🎉');
      setTimeout(() => finishGame(player, dealer), 1000);
    } else {
      setMessage('¿Pedir carta o plantarse?');
    }
  };

  const hit = () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newHand = [...playerHand, newCard];
    
    setPlayerHand(newHand);
    setDeck(newDeck);

    const value = calculateHandValue(newHand);
    if (value > 21) {
      setGameState('finished');
      setMessage('¡Te pasaste! 💥');
      setTimeout(() => finishGame(newHand, dealerHand), 1500);
    } else if (value === 21) {
      stand(newHand);
    }
  };

  const stand = (hand = playerHand) => {
    setGameState('dealer');
    setMessage('Turno del dealer...');
    
    setTimeout(() => {
      dealerPlay(hand);
    }, 1000);
  };

  const dealerPlay = (playerFinalHand) => {
    let newDealerHand = [...dealerHand];
    let newDeck = [...deck];

    while (dealerShouldHit(newDealerHand)) {
      const newCard = newDeck.pop();
      newDealerHand.push(newCard);
    }

    setDealerHand(newDealerHand);
    setDeck(newDeck);
    setGameState('finished');
    
    setTimeout(() => finishGame(playerFinalHand, newDealerHand), 1000);
  };

  const finishGame = (finalPlayerHand, finalDealerHand) => {
    const result = determineWinner(finalPlayerHand, finalDealerHand);
    const payout = calculatePayout(currentBet, result);
    
    setBalance(balance + payout);

    if (result === 'blackjack') {
      setMessage(`¡BLACKJACK! Ganaste Bs ${payout} 🎉`);
    } else if (result === 'player') {
      setMessage(`¡Ganaste! +Bs ${payout} 🎉`);
    } else if (result === 'dealer') {
      setMessage(`Dealer gana. -Bs ${currentBet} 😔`);
    } else {
      setMessage(`Empate. Bs ${currentBet} devueltos`);
    }
  };

  const renderCard = (card, hidden = false) => (
    <View key={card.id} style={styles.card}>
      {hidden ? (
        <LinearGradient colors={['#FFB800', '#FF8C00']} style={styles.cardBack}>
          <Text style={styles.cardBackText}>💀</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.cardFront, (card.suit === '♥️' || card.suit === '♦️') && styles.redCard]}>
          <Text style={styles.cardValue}>{card.value}</Text>
          <Text style={styles.cardSuit}>{card.suit}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Salir</Text>
          </TouchableOpacity>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Saldo</Text>
            <Text style={styles.balanceValue}>Bs {balance}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Dealer Hand */}
          <View style={styles.handSection}>
            <Text style={styles.handLabel}>Dealer {gameState !== 'betting' && `(${gameState === 'playing' ? '?' : calculateHandValue(dealerHand)})`}</Text>
            <View style={styles.cardsContainer}>
              {dealerHand.map((card, index) => 
                renderCard(card, gameState === 'playing' && index === 1)
              )}
            </View>
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Player Hand */}
          <View style={styles.handSection}>
            <Text style={styles.handLabel}>Tú {playerHand.length > 0 && `(${calculateHandValue(playerHand)})`}</Text>
            <View style={styles.cardsContainer}>
              {playerHand.map(card => renderCard(card))}
            </View>
          </View>

          {/* Betting Controls */}
          {gameState === 'betting' && (
            <View style={styles.bettingContainer}>
              <Text style={styles.betLabel}>Apuesta: Bs {currentBet}</Text>
              <View style={styles.betButtons}>
                <TouchableOpacity onPress={() => setCurrentBet(Math.max(5, currentBet - 5))} style={styles.betButton}>
                  <Text style={styles.betButtonText}>-5</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrentBet(currentBet + 5)} style={styles.betButton}>
                  <Text style={styles.betButtonText}>+5</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={dealInitialCards} style={styles.dealButton}>
                <LinearGradient colors={['#FFB800', '#FF8C00']} style={styles.dealButtonGradient}>
                  <Text style={styles.dealButtonText}>Repartir Cartas</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Playing Controls */}
          {gameState === 'playing' && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={hit} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Pedir 🃏</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => stand()} style={[styles.actionButton, styles.standButton]}>
                <Text style={styles.actionButtonText}>Plantarse ✋</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* New Game Button */}
          {gameState === 'finished' && (
            <TouchableOpacity onPress={startNewGame} style={styles.newGameButton}>
              <LinearGradient colors={['#FFB800', '#FF8C00']} style={styles.newGameGradient}>
                <Text style={styles.newGameText}>Nueva Partida</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.tertiary,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backText: {
    color: COLORS.accent.gold,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  balanceValue: {
    color: COLORS.accent.gold,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: 'bold',
  },
  content: {
    padding: SPACING.lg,
  },
  handSection: {
    marginBottom: SPACING.xl,
  },
  handLabel: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  card: {
    width: 70,
    height: 100,
    margin: 4,
  },
  cardFront: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: SPACING.sm,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#000',
  },
  redCard: {
    borderColor: '#C00',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  cardSuit: {
    fontSize: 24,
    alignSelf: 'center',
  },
  cardBack: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackText: {
    fontSize: 40,
  },
  messageContainer: {
    backgroundColor: COLORS.bg.secondary,
    padding: SPACING.lg,
    borderRadius: 12,
    marginVertical: SPACING.lg,
  },
  message: {
    color: COLORS.accent.gold,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bettingContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  betLabel: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    marginBottom: SPACING.md,
  },
  betButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  betButton: {
    backgroundColor: COLORS.bg.secondary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent.gold,
  },
  betButtonText: {
    color: COLORS.accent.gold,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
  },
  dealButton: {
    width: '100%',
  },
  dealButtonGradient: {
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  dealButtonText: {
    color: '#000',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.accent.gold,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  standButton: {
    backgroundColor: COLORS.bg.secondary,
    borderWidth: 2,
    borderColor: COLORS.accent.gold,
  },
  actionButtonText: {
    color: '#000',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
  },
  newGameButton: {
    marginTop: SPACING.xl,
  },
  newGameGradient: {
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  newGameText: {
    color: '#000',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
  },
});
