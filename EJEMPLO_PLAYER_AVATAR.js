// EJEMPLO DE USO - PlayerAvatar

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { PlayerAvatar, AvatarSelector, AVATARS } from '../components/poker/PlayerAvatar';

export default function PokerTableExample() {
  const [selectedAvatar, setSelectedAvatar] = useState('pistolero');

  const players = [
    {
      uid: 'player1',
      name: 'Juan',
      avatarId: 'pistolero',
      chips: 450,
      shots: 2,
      currentBet: 50,
    },
    {
      uid: 'player2',
      name: 'María',
      avatarId: 'catrina',
      chips: 300,
      shots: 0,
      currentBet: 0,
    },
    {
      uid: 'player3',
      name: 'Pedro',
      avatarId: 'mariachi',
      chips: 0,
      shots: 5,
      currentBet: 0,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Mesa de Poker - Disposición */}
      <View style={styles.table}>
        {/* Oponente 1 - Arriba */}
        <PlayerAvatar
          player={players[1]}
          size="md"
          position="top"
          isCurrentTurn={false}
        />

        {/* Oponente 2 - Izquierda */}
        <PlayerAvatar
          player={players[2]}
          size="sm"
          position="left"
          isFolded={true}
        />

        {/* Tú - Abajo */}
        <PlayerAvatar
          player={players[0]}
          size="lg"
          position="bottom"
          isCurrentTurn={true}
          isWinner={false}
        />
      </View>

      {/* Selector de Avatar */}
      <AvatarSelector
        selectedId={selectedAvatar}
        onSelect={(id) => setSelectedAvatar(id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 20,
  },
  table: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
