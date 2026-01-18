import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Button from '../../components/common/Button';

export default function RuletaRusaScreen() {
  const [showRules, setShowRules] = useState(true);
  const [showModes, setShowModes] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [showSurvived, setShowSurvived] = useState(false);
  const [showDead, setShowDead] = useState(false);
  
  const [selectedMode, setSelectedMode] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [currentShot, setCurrentShot] = useState(0);
  const [gameData, setGameData] = useState(null);
  const [videoPhase, setVideoPhase] = useState(1); // 1: pistoler1, 2: pistoler2, 3: pistoler3
  const [hasFired, setHasFired] = useState(false);
  
  const videoRef = useRef(null);
  const decisionTimer = useRef(null);
  const accelerometerSubscription = useRef(null);
  const vibrationTimer = useRef(null);

  const handleStartGame = () => {
    setShowRules(false);
    setShowModes(true);
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setShowModes(false);
    setShowInput(true);
  };

  const handleStartRound = async () => {
    if (!inputValue || inputValue <= 0) {
      Alert.alert('Error', 'Ingresa un valor válido');
      return;
    }
    
    // Cambiar a orientación horizontal
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    setGameData({
      mode: selectedMode,
      value: inputValue
    });
    setShowInput(false);
    setShowGame(true);
    setVideoPhase(1);
  };

  const handleVideoEnd = () => {
    if (videoPhase === 1) {
      setVideoPhase(2);
    } else if (videoPhase === 2) {
      setShowDecision(true);
      decisionTimer.current = setTimeout(() => {
        setShowDecision(false);
      }, 3000);
    } else if (videoPhase === 3) {
      // Después del pistoler3, mostrar resultado
      if (hasFired) {
        // Vibrar por 2 segundos cuando sale el disparo
        startVibration();
        setShowDead(true);
      }
    }
  };

  const handleScreenPress = () => {
    if (!showDecision) return;
    
    clearTimeout(decisionTimer.current);
    setShowDecision(false);
    
    const newShot = currentShot + 1;
    setCurrentShot(newShot);
    
    let willFire = false;
    
    if (newShot >= 6) {
      // En el 6to disparo, si no ha salido antes, debe salir
      willFire = !hasFired;
    } else {
      // En los primeros 5, es aleatorio (30% de probabilidad)
      willFire = Math.random() < 0.3;
      console.log(`Disparo ${newShot}: ${willFire ? 'BANG!' : 'Click'}`);
    }
    
    if (willFire) {
      setHasFired(true);
      setVideoPhase(3);
    } else {
      // No disparó, mostrar mensaje de supervivencia
      setShowSurvived(true);
      setTimeout(() => {
        setShowSurvived(false);
        setVideoPhase(1); // Reiniciar secuencia
      }, 2000);
    }
  };

  const handleSurvivedClose = () => {
    setShowSurvived(false);
    setVideoPhase(1);
  };

  const handleGameEnd = async () => {
    // Volver a orientación vertical
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    
    setShowDead(false);
    setShowGame(false);
    setShowModes(true);
    setCurrentShot(0);
    setHasFired(false);
    setVideoPhase(1);
  };

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      ScreenOrientation.unlockAsync();
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
      }
      if (vibrationTimer.current) {
        clearInterval(vibrationTimer.current);
      }
    };
  }, []);

  // Configurar acelerómetro cuando se muestra la decisión
  useEffect(() => {
    if (showDecision) {
      startShakeDetection();
    } else {
      stopShakeDetection();
    }
  }, [showDecision]);

  const startShakeDetection = () => {
    Accelerometer.setUpdateInterval(100);
    accelerometerSubscription.current = Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      // Umbral más alto para evitar conflictos con el menú de Expo
      if (acceleration > 3.5) {
        handleShake();
      }
    });
  };

  const stopShakeDetection = () => {
    if (accelerometerSubscription.current) {
      accelerometerSubscription.current.remove();
      accelerometerSubscription.current = null;
    }
  };

  const handleShake = () => {
    if (showDecision) {
      handleScreenPress();
    }
  };

  const startVibration = () => {
    let count = 0;
    vibrationTimer.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      count++;
      if (count >= 20) { // 20 vibraciones en 2 segundos (cada 100ms)
        clearInterval(vibrationTimer.current);
      }
    }, 100);
  };

  const resetGame = async () => {
    // Volver a orientación vertical
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    
    setShowRules(true);
    setShowModes(false);
    setShowInput(false);
    setShowGame(false);
    setShowDecision(false);
    setShowSurvived(false);
    setShowDead(false);
    setSelectedMode('');
    setInputValue('');
    setCurrentShot(0);
    setGameData(null);
    setVideoPhase(1);
    setHasFired(false);
  };

  const getVideoSource = () => {
    switch (videoPhase) {
      case 1:
        return require('../../../assets/Videos/Pistolero/Pistoler1.mp4');
      case 2:
        return require('../../../assets/Videos/Pistolero/Pistoler2.mp4');
      case 3:
        return require('../../../assets/Videos/Pistolero/Pistoler3.mp4');
      default:
        return require('../../../assets/Videos/Pistolero/Pistoler1.mp4');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔫 Ruleta Rusa</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {showRules && (
          <View style={styles.rulesCard}>
            <Text style={styles.iconLarge}>🔫</Text>
            <Text style={styles.title}>Ruleta Rusa</Text>
            <Text style={styles.subtitle}>¡El juego más peligroso de la cantina!</Text>
            
            <View style={styles.rulesContainer}>
              <Text style={styles.rulesTitle}>📋 Reglas del Juego:</Text>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>1.</Text>
                <Text style={styles.ruleText}>El juego es por turnos, siempre en dirección en la que va el tiempo (manecillas del reloj), porque la vida nunca se detiene y cada día estás más cerca de tu muerte, puede que hoy sea tu último día, disfrútalo.</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>2.</Text>
                <Text style={styles.ruleText}>Puedes apuntarte a ti mismo o a otro jugador.</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>3.</Text>
                <Text style={styles.ruleText}>Si sale el disparo, el jugador impactado debe tomar lo acordado en esa ronda.</Text>
              </View>
              
              <View style={styles.percentageInfo}>
                <Text style={styles.percentageTitle}>💡 Sistemas de Juego:</Text>
                <Text style={styles.percentageSubtitle}>📊 Porcentajes:</Text>
                <Text style={styles.percentageText}>• 50% = 1/2 vaso</Text>
                <Text style={styles.percentageText}>• 100% = 1 vaso completo</Text>
                <Text style={styles.percentageText}>• 250% = 2 y medio vasos</Text>
                
                <Text style={styles.percentageSubtitle}>🥃 Vasos:</Text>
                <Text style={styles.percentageText}>• Se ingresa el número de vasos que será de esa ronda</Text>
              </View>
            </View>
            
            <Button
              title="🎯 Iniciar Juego"
              onPress={handleStartGame}
              variant="primary"
              fullWidth
            />
          </View>
        )}
        
        {showModes && (
          <View style={styles.modesCard}>
            <Text style={styles.iconLarge}>🎮</Text>
            <Text style={styles.title}>Modos de Juego</Text>
            <Text style={styles.subtitle}>Elige cómo quieres jugar</Text>
            
            <View style={styles.modesContainer}>
              <Button
                title="🥃 Modo Vasos"
                onPress={() => handleModeSelect('vasos')}
                variant="primary"
                fullWidth
              />
              
              <Button
                title="📊 Modo Porcentajes"
                onPress={() => handleModeSelect('porcentajes')}
                variant="outline"
                fullWidth
              />
            </View>
          </View>
        )}
        
        {showInput && (
          <View style={styles.inputCard}>
            <Text style={styles.iconLarge}>⚙️</Text>
            <Text style={styles.title}>Configurar Ronda</Text>
            <Text style={styles.subtitle}>
              {selectedMode === 'vasos' ? 'Ingresa el número de vasos' : 'Ingresa el porcentaje'}
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={selectedMode === 'vasos' ? 'Ej: 2' : 'Ej: 150'}
                placeholderTextColor={COLORS.text.tertiary}
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>
                {selectedMode === 'vasos' ? 'vasos' : '%'}
              </Text>
            </View>
            
            <Button
              title="🎲 Iniciar Ronda"
              onPress={handleStartRound}
              variant="primary"
              fullWidth
            />
          </View>
        )}
      </ScrollView>
      
      {showGame && (
        <View style={styles.gameContainer}>
          <Video
            ref={videoRef}
            source={getVideoSource()}
            style={styles.video}
            shouldPlay
            isLooping={false}
            resizeMode="cover"
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                handleVideoEnd();
              }
            }}
          />
          
          {showDecision && (
            <TouchableOpacity 
              style={styles.decisionOverlay}
              onPress={handleScreenPress}
              activeOpacity={1}
            >
              <Text style={styles.decisionText}>💀</Text>
              <Text style={styles.decisionSubtext}>Decide tu destino</Text>
              <Text style={styles.decisionTimer}>Toca la pantalla o sacude el teléfono</Text>
            </TouchableOpacity>
          )}
          
          {showSurvived && (
            <View style={styles.survivedOverlay}>
              <Text style={styles.survivedText}>😅</Text>
              <Text style={styles.survivedSubtext}>Te salvaste por poco</Text>
            </View>
          )}
          
          {showDead && (
            <View style={styles.deadOverlay}>
              <Text style={styles.deadText}>💀</Text>
              <Text style={styles.deadSubtext}>Estás muerto</Text>
              <Button
                title="Terminar"
                onPress={handleGameEnd}
                variant="primary"
              />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.tertiary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  rulesCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modesCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconLarge: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  rulesContainer: {
    width: '100%',
    marginVertical: SPACING.lg,
  },
  rulesTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-start',
  },
  ruleNumber: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
    marginRight: SPACING.sm,
    minWidth: 20,
  },
  ruleText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  percentageInfo: {
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  percentageTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.accent.gold,
    marginBottom: SPACING.xs,
  },
  percentageSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  percentageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  modesContainer: {
    width: '100%',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  inputCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.lg,
    width: '100%',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: SPACING.sm,
  },
  gameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bg.primary,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  decisionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decisionText: {
    fontSize: 120,
    marginBottom: SPACING.md,
  },
  decisionSubtext: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
  },
  decisionTimer: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.accent.gold,
  },
  survivedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  survivedText: {
    fontSize: 120,
    marginBottom: SPACING.md,
  },
  survivedSubtext: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  deadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  deadText: {
    fontSize: 120,
    marginBottom: SPACING.lg,
  },
  deadSubtext: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
});