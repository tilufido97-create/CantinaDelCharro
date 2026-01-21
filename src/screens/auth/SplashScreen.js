import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Image } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

export default function SplashScreen({ navigation }) {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Image 
          source={require('../../../assets/LogoCharro.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>LA CANTINA</Text>
        <Text style={styles.subtitle}>DEL CHARRO</Text>
        <Text style={styles.slogan}>Donde el trago es ley y el charro, leyenda</Text>
      </Animated.View>
      
      <ActivityIndicator 
        size="small" 
        color={COLORS.accent.gold} 
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginTop: 50,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 16,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    letterSpacing: 4,
    marginBottom: 8,
  },
  slogan: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.accent.amber,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  loader: {
    position: 'absolute',
    bottom: 100,
  },
});
