import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity, PanGestureHandler } from 'react-native-gesture-handler';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Button from '../../components/common/Button';

export default function CulturaChupisticaScreen({ navigation }) {
  const [showRules, setShowRules] = useState(true);
  const [showGame, setShowGame] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const translateX = new Animated.Value(0);

  const handleStartGame = () => {
    setShowRules(false);
    setShowGame(true);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === 5) { // END state
      const { translationX } = event.nativeEvent;
      
      if (Math.abs(translationX) > 150) { // Aumentado para cartas más grandes
        // Flip the card
        setCardFlipped(!cardFlipped);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      } else {
        // Return to original position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🧠 Cultura Chupística</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {showRules && (
          <View style={styles.rulesCard}>
            <Text style={styles.iconLarge}>🧠</Text>
            <Text style={styles.title}>Cultura Chupística</Text>
            <Text style={styles.subtitle}>¡Demuestra tu conocimiento o bebe!</Text>
            
            <View style={styles.rulesContainer}>
              <Text style={styles.rulesTitle}>📋 Reglas del Juego:</Text>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>1.</Text>
                <Text style={styles.ruleText}>El juego es por turnos, los jugadores deben seguir las manecillas del reloj, que es el camino del tiempo.</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>2.</Text>
                <Text style={styles.ruleText}>Lea la carta en voz alta y empezará la ronda de respuestas en base al conocimiento que pide la carta, no olvides de defenderte (empezar primero), antes que comience la ronda.</Text>
              </View>
              
              <View style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>3.</Text>
                <Text style={styles.ruleText}>Cada jugador tiene 15s para responder, si no responde correctamente o se queda callado, hace el reto acordado en la carta.</Text>
              </View>
            </View>
            
            <Button
              title="🎯 Empezar Juego"
              onPress={handleStartGame}
              variant="primary"
              fullWidth
            />
          </View>
        )}
        
        {showGame && (
          <View style={styles.gameContainer}>
            <View style={styles.cardContainer}>
              {/* Carta principal */}
              <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
              >
                <Animated.View 
                  style={[
                    styles.cardWrapper,
                    { transform: [{ translateX }] }
                  ]}
                >
                  <Image
                    source={cardFlipped 
                      ? require('../../../assets/Cartas/CartaR.png')
                      : require('../../../assets/Cartas/CartaP.png')
                    }
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                  
                  {/* Mensaje de reto en el centro cuando es CartaR */}
                  {cardFlipped && (
                    <View style={styles.challengeOverlay}>
                      <Text style={styles.challengeText}>Cultura chupística manda decir: marcas de autos deportivos</Text>
                    </View>
                  )}
                </Animated.View>
              </PanGestureHandler>
              
              {/* Carta de fondo (solo visible al deslizar) */}
              <Animated.View 
                style={[
                  styles.backgroundCard,
                  {
                    opacity: translateX.interpolate({
                      inputRange: [-150, 0, 150], // Ajustado para cartas más grandes
                      outputRange: [1, 0, 1],
                      extrapolate: 'clamp',
                    })
                  }
                ]}
              >
                <Image
                  source={require('../../../assets/Cartas/CartaP.png')}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </Animated.View>
              
              {/* Mensajes debajo de la carta */}
              <View style={styles.hintContainer}>
                {!cardFlipped ? (
                  <Text style={styles.flipHint}>Desliza para voltear la carta</Text>
                ) : (
                  <Text style={styles.flipHint}>Deslizar para sacar otra carta</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg.tertiary,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold,
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
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  backgroundCard: {
    position: 'absolute',
    width: 450,
    height: 600,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cardWrapper: {
    width: 450,
    height: 600,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
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


  cardImage: {
    width: '100%',
    height: '100%',
  },
  hintContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    width: '100%',
  },
  flipHint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    opacity: 0.5,
    textAlign: 'center',
  },
  challengeOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: -40 }],
    width: 240,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    zIndex: 4,
  },
  challengeText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.bg.primary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'serif',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});