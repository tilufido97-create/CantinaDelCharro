import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { saveClient } from '../../services/clientService';

export default function AgeVerificationScreen({ route, navigation }) {
  const { user, profileData } = route?.params || {};
  
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [age, setAge] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmAge, setConfirmAge] = useState(false);
  
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
      age >= 18 &&
      confirmAge
    );
  };

  const handleVerifyAge = async () => {
    if (!isFormValid()) {
      if (age !== null && age < 18) {
        setError('Debes ser mayor de 18 años para continuar');
      } else if (!confirmAge) {
        setError('Debes confirmar que eres mayor de edad');
      } else {
        setError('Por favor completa tu fecha de nacimiento');
      }
      return;
    }

    setLoading(true);
    
    try {
      // Save client data to database
      const clientData = {
        firstName: profileData?.firstName || user?.firstName,
        lastName: profileData?.lastName || user?.lastName,
        email: profileData?.email || user?.email,
        phoneNumber: profileData?.phoneNumber || user?.phoneNumber,
        birthDate: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        avatar: profileData?.avatar || user?.avatar
      };

      console.log('💾 Guardando cliente completo en base de datos:', clientData);
      const result = await saveClient(clientData);
      
      if (result.success) {
        // Update user data in AsyncStorage with client info
        const updatedUser = {
          ...user,
          clientId: result.clientId,
          birthDate: clientData.birthDate,
          ageVerified: true,
          profileCompleted: true
        };
        
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        // Show success animation
        Animated.spring(confettiAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();

        // Complete authentication
        await AsyncStorage.setItem('authCompleted', 'true');
        console.log('✅ Cliente guardado en BD y authCompleted - RootNavigator detectará el cambio');
        
      } else {
        Alert.alert('Error', result.error || 'No se pudo guardar en la base de datos');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error guardando cliente:', error);
      Alert.alert('Error', 'Error al completar registro');
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.bg.primary, COLORS.bg.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

          <View style={styles.checkboxSection}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => {
                setConfirmAge(!confirmAge);
                setError(''); // Clear error when user interacts
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, confirmAge && styles.checkboxChecked]}>
                {confirmAge && (
                  <Text style={styles.checkmarkEmoji}>✅</Text>
                )}
              </View>
              <Text style={styles.checkboxText}>
                Confirmo que soy mayor de 18 años y acepto el uso de la aplicación
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Terminar Registro"
            onPress={handleVerifyAge}
            disabled={!isFormValid()}
            loading={loading}
            fullWidth
          />
        </ScrollView>
      </SafeAreaView>

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
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  backText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  warningContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  warningEmoji: { fontSize: 60, marginBottom: SPACING.sm },
  warningBadge: {
    backgroundColor: COLORS.warning,
    color: '#000',
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  dateContainer: { marginBottom: SPACING.lg },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  inputWrapper: { alignItems: 'center' },
  dateInput: {
    width: 70,
    height: 60,
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: BORDER_RADIUS.md,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.xl,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  yearInput: { width: 90 },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
  separator: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    color: COLORS.text.tertiary,
    marginBottom: 20,
  },
  ageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  ageCheck: { fontSize: 24 },
  ageText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  ageError: { fontSize: 24 },
  ageErrorText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  infoSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  infoIcon: { fontSize: 16 },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },
  checkboxSection: {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.bg.tertiary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.text.tertiary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.bg.tertiary,
    borderColor: COLORS.primary,
  },
  checkmarkEmoji: {
    fontSize: 16,
    lineHeight: 18,
  },
  checkboxText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    lineHeight: 22,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiEmoji: { fontSize: 100, marginBottom: SPACING.lg },
  successText: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  successSubtext: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
});
