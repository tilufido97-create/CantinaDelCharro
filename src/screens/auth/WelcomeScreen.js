import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { useGoogleAuth, handleGoogleResponse } from '../../services/authService';

export default function WelcomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response) {
      handleGoogleSignIn();
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await handleGoogleResponse(response);
      if (result.success) {
        Alert.alert('✅ Bienvenido', `Hola ${result.user.displayName || result.user.email}`);
        navigation.navigate('AgeVerification', { user: result.user });
      } else {
        if (result.error !== 'Inicio de sesión cancelado') {
          Alert.alert('Error', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.bg.primary, COLORS.bg.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Image 
            source={require('../../../assets/LogoCharro.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>
            Donde el trago es ley y el charro, leyenda
          </Text>
          <Text style={styles.subtitle}>
            Shots, promos y desmadre...{' \n'}ahora en Versión App
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            title="Continuar con Google"
            variant="secondary"
            onPress={() => promptAsync()}
            disabled={!request || loading}
            loading={loading}
            fullWidth
          />
          
          <Button
            title="Continuar con Teléfono"
            variant="primary"
            onPress={() => navigation.navigate('PhoneLogin')}
            disabled={loading}
            fullWidth
          />
          
          <Button
            title="Soy Delivery"
            variant="outline"
            onPress={() => Alert.alert('Próximamente', 'Acceso para deliverys próximamente')}
            disabled={loading}
            fullWidth
          />
          
          <Text style={styles.terms}>
            Al continuar, aceptas nuestros{' '}
            <Text style={styles.termsLink}>Términos y Condiciones</Text>
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: SPACING.sm,
  },
  sombrero: {
    fontSize: 60,
    marginBottom: SPACING.lg,
  },
  tagline: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginTop: -SPACING.sm,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  note: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  terms: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  termsLink: {
    color: COLORS.accent.gold,
  },
});
