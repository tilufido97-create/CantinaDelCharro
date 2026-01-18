import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

export default function ShotChallengeScreen({ navigation }) {
  const [playerCups, setPlayerCups] = useState([1,2,3,4,5,6]);
  const [opponentCups, setOpponentCups] = useState([1,2,3,4,5,6]);
  const [currentTurn, setCurrentTurn] = useState('player');
  const [isLaunching, setIsLaunching] = useState(false);

  const shotY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => currentTurn === 'player' && !isLaunching,
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dy) > 50) {
          launchShot();
        }
      },
    })
  ).current;

  const launchShot = () => {
    setIsLaunching(true);
    
    Animated.timing(shotY, {
      toValue: -400,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      const hit = Math.random() > 0.5;
      
      if (hit && opponentCups.length > 0) {
        const newCups = [...opponentCups];
        newCups.pop();
        setOpponentCups(newCups);
        
        if (newCups.length === 0) {
          Alert.alert('🎉 Ganaste!', 'Oponente bebe sus shots', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
          return;
        }
      }
      
      shotY.setValue(0);
      setIsLaunching(false);
      setCurrentTurn('opponent');
      
      setTimeout(() => opponentTurn(), 1500);
    });
  };

  const opponentTurn = () => {
    const hit = Math.random() > 0.4;
    
    if (hit && playerCups.length > 0) {
      const newCups = [...playerCups];
      newCups.pop();
      setPlayerCups(newCups);
      
      if (newCups.length === 0) {
        Alert.alert('😔 Perdiste', 'Bebes tus shots', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        return;
      }
    }
    
    setCurrentTurn('player');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎯 Shot Challenge</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.opponentSection}>
          <Text style={styles.label}>Oponente</Text>
          <View style={styles.cupsRow}>
            {opponentCups.map((cup, i) => (
              <Text key={i} style={styles.cup}>🥃</Text>
            ))}
          </View>
        </View>

        <View style={styles.gameArea}>
          <Animated.View style={[styles.shot, { transform: [{ translateY: shotY }] }]}>
            <Text style={styles.shotEmoji}>🔴</Text>
          </Animated.View>
          
          <Text style={styles.turnText}>
            {currentTurn === 'player' ? '👆 Tu turno - Desliza hacia arriba' : '⏳ Turno del oponente...'}
          </Text>
        </View>

        <View style={styles.playerSection}>
          <View style={styles.cupsRow}>
            {playerCups.map((cup, i) => (
              <Text key={i} style={styles.cup}>🥃</Text>
            ))}
          </View>
          <Text style={styles.label}>Tú</Text>
        </View>

        <View style={styles.swipeArea} {...panResponder.panHandlers}>
          <Text style={styles.swipeText}>SWIPE</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bg.tertiary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  content: { flex: 1 },
  opponentSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  playerSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  label: { fontSize: 16, color: COLORS.text.secondary, marginBottom: SPACING.sm },
  cupsRow: { flexDirection: 'row', gap: SPACING.sm },
  cup: { fontSize: 32 },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  shot: { position: 'absolute' },
  shotEmoji: { fontSize: 40 },
  turnText: { fontSize: 16, color: COLORS.accent.gold, textAlign: 'center', marginTop: SPACING.xl },
  swipeArea: { height: 100, backgroundColor: COLORS.bg.secondary, justifyContent: 'center', alignItems: 'center', borderTopWidth: 2, borderTopColor: COLORS.accent.gold },
  swipeText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.tertiary },
});
