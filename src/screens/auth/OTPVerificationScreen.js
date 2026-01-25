import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import OTPInput from '../../components/common/OTPInput';
import { verifyPhoneOTP, sendPhoneOTP } from '../../services/authService';

export default function OTPVerificationScreen({ navigation, route }) {
  const { phone } = route.params;
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleComplete = async (code) => {
    setLoading(true);
    
    try {
      const result = await verifyPhoneOTP(code);
      if (result.success) {
        navigation.navigate('CompleteProfile', { phone, user: result.user });
      } else {
        Alert.alert('Error', result.error || 'Código incorrecto');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      const result = await sendPhoneOTP(phone);
      if (result.success) {
        setTimer(60);
        setCanResend(false);
        Alert.alert('Éxito', result.message || 'Código reenviado');
      } else {
        Alert.alert('Error', result.error || 'No se pudo reenviar');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Verifica tu número</Text>
        <Text style={styles.subtitle}>
          Enviamos un código a{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <View style={styles.otpContainer}>
          <OTPInput length={6} onComplete={handleComplete} />
        </View>

        <View style={styles.timerContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={loading}>
              <Text style={styles.resendText}>Reenviar código</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              ⏱️ Reenviar en {formatTime(timer)}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpText}>No recibí el código</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  backButton: {
    padding: SPACING.md,
  },
  backText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  phone: {
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  otpContainer: {
    marginBottom: SPACING.xl,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.tertiary,
  },
  resendText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  helpButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  helpText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    textDecorationLine: 'underline',
  },
});
