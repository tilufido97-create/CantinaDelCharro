import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import KeyboardScrollWrapper from '../../components/common/KeyboardScrollWrapper';
import Button from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function AgeVerificationScreen({ route, navigation }) {
  const { firstName } = route?.params || { firstName: 'amigo' };
  
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [age, setAge] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const confettiAnimation = useRef(new Animated.Value(0)).current;

  const calculateAge = (d, m, y) => {
    if (!d || !m || !y || d.length !== 2 || m.length !== 2 || y.length !== 4) {
      return null;
    }

    const birthDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const today = new Date();
    
    if (isNaN(birthDate.getTime()) || birthDate > today) {
      return null;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const handleDayChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 2);
    
    if (limited.length === 2) {
      const dayNum = parseInt(limited);
      if (dayNum >= 1 && dayNum <= 31) {
        setDay(limited);
        monthRef.current?.focus();
      } else {
        setError('Día inválido');
        return;
      }
    } else {
      setDay(limited);
    }
    
    setError('');
    updateAge(limited, month, year);
  };

  const handleMonthChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 2);
    
    if (limited.length === 2) {
      const monthNum = parseInt(limited);
      if (monthNum >= 1 && monthNum <= 12) {
        setMonth(limited);
        yearRef.current?.focus();
      } else {
        setError('Mes inválido');
        return;
      }
    } else {
      setMonth(limited);
    }
    
    setError('');
    updateAge(day, limited, year);
  };

  const handleYearChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 4);
    setYear(limited);
    setError('');
    updateAge(day, month, limited);
  };

  const updateAge = (d, m, y) => {
    const calculatedAge = calculateAge(d, m, y);
    setAge(calculatedAge);
  };

  const isFormValid = () => {
    return (
      day.length === 2 &&
      month.length === 2 &&
      year.length === 4 &&
      age !== null &&
      age >= 18
    );
  };

  const handleVerifyAge = async () => {
    if (!isFormValid()) {
      if (age !== null && age < 18) {
        setError('Debes ser mayor de 18 años para continuar');
      } else {
        setError('Por favor completa tu fecha de nacimiento');
      }
      return;
    }

    setLoading(true);
    
    Animated.spring(confettiAnimation, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    try {
      await AsyncStorage.setItem('authCompleted', 'true');
      console.log('✅ authCompleted guardado en AsyncStorage');
      
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Splash' }],
        });
      }, 2000);
    } catch (error) {
      console.error('❌ Error guardando auth:', error);
      setError('Error al completar registro');
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.bg.primary, COLORS.bg.secondary]}
      style={styles.container}
    >
      <KeyboardScrollWrapper>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.warningContainer}>
            <Text style={styles.warningEmoji}>⚠️</Text>
            <Text style={styles.warningBadge}>+18</Text>
          </View>

          <Text style={styles.title}>Verificación de edad</Text>
          <Text style={styles.subtitle}>
            Este servicio es solo para{'\n'}mayores de 18 años
          </Text>

          <View style={styles.dateContainer}>
            <Text style={styles.label}>Fecha de nacimiento</Text>
            
            <View style={styles.inputsRow}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.dateInput}
                  placeholder="15"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={day}
                  onChangeText={handleDayChange}
                  keyboardType="number-pad"
                  maxLength={2}
                  returnKeyType="next"
                />
                <Text style={styles.inputLabel}>DD</Text>
              </View>

              <Text style={styles.separator}>/</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  ref={monthRef}
                  style={styles.dateInput}
                  placeholder="03"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={month}
                  onChangeText={handleMonthChange}
                  keyboardType="number-pad"
                  maxLength={2}
                  returnKeyType="next"
                />
                <Text style={styles.inputLabel}>MM</Text>
              </View>

              <Text style={styles.separator}>/</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  ref={yearRef}
                  style={[styles.dateInput, styles.yearInput]}
                  placeholder="1995"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={year}
                  onChangeText={handleYearChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyAge}
                />
                <Text style={styles.inputLabel}>YYYY</Text>
              </View>
            </View>
          </View>

          {age !== null && (
            <View style={styles.ageDisplay}>
              {age >= 18 ? (
                <>
                  <Text style={styles.ageCheck}>✅</Text>
                  <Text style={styles.ageText}>Tienes {age} años</Text>
                </>
              ) : (
                <>
                  <Text style={styles.ageError}>❌</Text>
                  <Text style={styles.ageErrorText}>
                    Debes tener al menos 18 años
                  </Text>
                </>
              )}
            </View>
          )}

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🔒</Text>
              <Text style={styles.infoText}>Tus datos son privados</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⚖️</Text>
              <Text style={styles.infoText}>Cumplimiento legal requerido</Text>
            </View>
          </View>

          <View style={{ height: 20 }} />

          <Button
            title="Verificar Edad"
            onPress={handleVerifyAge}
            disabled={!isFormValid()}
            loading={loading}
            fullWidth
          />

          <View style={{ height: 100 }} />
        </View>
      </KeyboardScrollWrapper>

      {confettiAnimation._value > 0 && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: confettiAnimation,
              transform: [{ scale: confettiAnimation }],
            },
          ]}
        >
          <Text style={styles.confettiEmoji}>🎉</Text>
          <Text style={styles.successText}>¡Verificado!</Text>
          <Text style={styles.successSubtext}>
            Bienvenido a La Cantina del Charro
          </Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  backText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, fontWeight: TYPOGRAPHY.weights.medium },
  content: { flex: 1, paddingHorizontal: SPACING.xl },
  warningContainer: { alignItems: 'center', marginTop: SPACING.xxl, marginBottom: SPACING.lg },
  warningEmoji: { fontSize: 60, marginBottom: SPACING.sm },
  warningBadge: { backgroundColor: COLORS.warning, color: '#000', fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full },
  title: { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, textAlign: 'center', marginBottom: SPACING.xxl, lineHeight: 24 },
  dateContainer: { marginBottom: SPACING.lg },
  label: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, marginBottom: SPACING.md, textAlign: 'center', fontWeight: TYPOGRAPHY.weights.medium },
  inputsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  inputWrapper: { alignItems: 'center' },
  dateInput: { width: 70, height: 60, backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xl, color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.bold, borderWidth: 2, borderColor: 'transparent' },
  yearInput: { width: 90 },
  inputLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.tertiary, marginTop: SPACING.xs },
  separator: { fontSize: TYPOGRAPHY.sizes['2xl'], color: COLORS.text.tertiary, marginBottom: 20 },
  ageDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.lg, marginBottom: SPACING.md },
  ageCheck: { fontSize: 24 },
  ageText: { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.success, fontWeight: TYPOGRAPHY.weights.semibold },
  ageError: { fontSize: 24 },
  ageErrorText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.error, fontWeight: TYPOGRAPHY.weights.semibold },
  errorText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.error, textAlign: 'center', marginBottom: SPACING.md },
  infoSection: { marginTop: SPACING.xl, marginBottom: SPACING.lg, gap: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, justifyContent: 'center' },
  infoIcon: { fontSize: 16 },
  infoText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary },
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center' },
  confettiEmoji: { fontSize: 100, marginBottom: SPACING.lg },
  successText: { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.success, marginBottom: SPACING.sm },
  successSubtext: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary },
});
