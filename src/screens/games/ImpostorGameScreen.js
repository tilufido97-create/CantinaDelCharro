import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

const PLAYERS = [
  { id: 1, name: 'Tú', color: '🔴', isUser: true },
  { id: 2, name: 'Bot 1', color: '🔵', isBot: true },
  { id: 3, name: 'Bot 2', color: '🟢', isBot: true },
  { id: 4, name: 'Bot 3', color: '🟡', isBot: true },
];

const TASKS = [
  { id: 1, name: 'Limpiar vasos', location: 'Bar', completed: false },
  { id: 2, name: 'Contar botellas', location: 'Bodega', completed: false },
  { id: 3, name: 'Lavar platos', location: 'Cocina', completed: false },
  { id: 4, name: 'Sacar basura', location: 'Baño', completed: false },
  { id: 5, name: 'Contar dinero', location: 'Caja', completed: false },
];

export default function ImpostorGameScreen({ navigation }) {
  const [gamePhase, setGamePhase] = useState('reveal');
  const [isImpostor, setIsImpostor] = useState(false);
  const [tasks, setTasks] = useState(TASKS);
  const [alivePlayers, setAlivePlayers] = useState(PLAYERS);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const impostor = Math.random() > 0.5;
    setIsImpostor(impostor);
    
    setTimeout(() => setGamePhase('playing'), 3000);
  }, []);

  useEffect(() => {
    if (gamePhase === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gamePhase]);

  const completeTask = (taskId) => {
    if (isImpostor) {
      Alert.alert('No puedes', 'Los impostores no hacen tareas');
      return;
    }
    
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    
    const allCompleted = tasks.every(t => t.completed || t.id === taskId);
    if (allCompleted) {
      endGame('tasks_completed');
    }
  };

  const callMeeting = () => {
    setGamePhase('voting');
  };

  const handleVote = (playerId) => {
    const votedPlayer = alivePlayers.find(p => p.id === playerId);
    const votedIsImpostor = playerId === 2;
    
    if (votedIsImpostor) {
      Alert.alert('🎉 Impostor expulsado!', 'Inocentes ganan\nImpostores beben 3 shots', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('😔 Era inocente', 'Juego continúa', [
        { text: 'OK', onPress: () => setGamePhase('playing') }
      ]);
    }
  };

  const endGame = (reason) => {
    if (reason === 'tasks_completed') {
      Alert.alert('✅ Tareas completadas', 'Inocentes ganan\nImpostores beben 3 shots', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else if (reason === 'timeout') {
      Alert.alert('⏰ Tiempo agotado', 'Impostores ganan\nInocentes beben 2 shots', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  if (gamePhase === 'reveal') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.revealContainer}>
          <Text style={styles.revealEmoji}>{isImpostor ? '🔪' : '✅'}</Text>
          <Text style={styles.revealText}>
            {isImpostor ? 'ERES EL IMPOSTOR' : 'NO ERES EL IMPOSTOR'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (gamePhase === 'voting') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🗳️ Votación</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.voteTitle}>¿Quién es el impostor?</Text>
          <FlatList
            data={alivePlayers}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.voteCard} onPress={() => handleVote(item.id)}>
                <Text style={styles.voteColor}>{item.color}</Text>
                <Text style={styles.voteName}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={24} color={COLORS.text.tertiary} />
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👤 Impostor Game</Text>
        <Text style={styles.timer}>⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
      </View>

      <View style={styles.content}>
        {!isImpostor && (
          <View style={styles.tasksCard}>
            <Text style={styles.tasksTitle}>📝 Tareas ({tasks.filter(t => t.completed).length}/{tasks.length})</Text>
            {tasks.map(task => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() => completeTask(task.id)}
                disabled={task.completed}
              >
                <Ionicons 
                  name={task.completed ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={24} 
                  color={task.completed ? COLORS.success : COLORS.text.tertiary} 
                />
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskName, task.completed && styles.taskCompleted]}>{task.name}</Text>
                  <Text style={styles.taskLocation}>{task.location}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isImpostor && (
          <View style={styles.impostorCard}>
            <Text style={styles.impostorTitle}>🔪 Eres el Impostor</Text>
            <Text style={styles.impostorText}>Elimina a los inocentes sin ser descubierto</Text>
          </View>
        )}

        <TouchableOpacity style={styles.meetingButton} onPress={callMeeting}>
          <Text style={styles.meetingButtonText}>🚨 Llamar Reunión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.bg.tertiary },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  timer: { fontSize: 16, color: COLORS.warning },
  content: { flex: 1, padding: SPACING.lg },
  revealContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  revealEmoji: { fontSize: 100, marginBottom: SPACING.xl },
  revealText: { fontSize: 24, fontWeight: 'bold', color: COLORS.text.primary, textAlign: 'center' },
  tasksCard: { backgroundColor: COLORS.bg.secondary, padding: SPACING.lg, borderRadius: 12, marginBottom: SPACING.lg },
  tasksTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: SPACING.md },
  taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md },
  taskInfo: { flex: 1 },
  taskName: { fontSize: 16, color: COLORS.text.primary },
  taskCompleted: { textDecorationLine: 'line-through', color: COLORS.text.tertiary },
  taskLocation: { fontSize: 12, color: COLORS.text.tertiary },
  impostorCard: { backgroundColor: COLORS.error + '20', padding: SPACING.xl, borderRadius: 12, marginBottom: SPACING.lg, borderWidth: 2, borderColor: COLORS.error },
  impostorTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.error, marginBottom: SPACING.sm },
  impostorText: { fontSize: 14, color: COLORS.text.secondary },
  meetingButton: { backgroundColor: COLORS.warning, padding: SPACING.lg, borderRadius: 12, alignItems: 'center' },
  meetingButtonText: { fontSize: 18, fontWeight: 'bold', color: COLORS.bg.primary },
  voteTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: SPACING.lg, textAlign: 'center' },
  voteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg.secondary, padding: SPACING.lg, borderRadius: 12, marginBottom: SPACING.md },
  voteColor: { fontSize: 32, marginRight: SPACING.md },
  voteName: { flex: 1, fontSize: 16, color: COLORS.text.primary },
});
