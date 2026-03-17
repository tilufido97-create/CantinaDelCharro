// EJEMPLO DE USO - NO EJECUTAR, SOLO REFERENCIA

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CardComponent, EmptyCardSlot } from '../components/poker/CardComponent';
import { createDeck } from '../utils/games/cardDeck';

export default function PokerScreenExample() {
  const [deck] = useState(createDeck());
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <View style={styles.container}>
      {/* Mano del jugador */}
      <View style={styles.hand}>
        {deck.slice(0, 5).map((card, i) => (
          <CardComponent
            key={card.id}
            card={card}
            faceUp={true}
            size="md"
            selected={selectedCard === card.id}
            onPress={() => setSelectedCard(card.id)}
          />
        ))}
      </View>

      {/* Cartas comunitarias */}
      <View style={styles.community}>
        <CardComponent card={deck[5]} faceUp={true} size="lg" />
        <CardComponent card={deck[6]} faceUp={true} size="lg" />
        <CardComponent card={deck[7]} faceUp={true} size="lg" />
        <EmptyCardSlot size="lg" />
        <EmptyCardSlot size="lg" />
      </View>

      {/* Cartas ocultas del oponente */}
      <View style={styles.opponent}>
        <CardComponent card={deck[8]} faceUp={false} size="sm" />
        <CardComponent card={deck[9]} faceUp={false} size="sm" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'space-around',
    padding: 20,
  },
  hand: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  community: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  opponent: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
});
