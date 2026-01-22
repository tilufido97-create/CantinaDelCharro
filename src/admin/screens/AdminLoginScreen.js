import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { loginAdmin } from '../utils/adminAuth';
import { initializeMockAdmins } from '../constants/mockDataAdmin';

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState(null);

  useEffect(() => {
    initializeMockAdmins(AsyncStorage);
    loadRememberedEmail();
  }, []);

  const loadRememberedEmail = async () => {
    const saved = await AsyncStorage.getItem('remembered_admin_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  };

  const handleLogin = async () => {
    if (blockedUntil && Date.now() < blockedUntil) {
      const remaining = Math.ceil((blockedUntil - Date.now()) / 60000);
      Alert.alert('Bloqueado', `Demasiados intentos. Intenta en ${remaining} minutos`);
      return;
    }

    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Ingresa un correo válido');
      return;
    }

    setLoading(true);
    const result = await loginAdmin(email.trim(), password);
    setLoading(false);

    if (result.success) {
      setLoginAttempts(0);
      if (rememberMe) {
        await AsyncStorage.setItem('remembered_admin_email', email);
      } else {
        await AsyncStorage.removeItem('remembered_admin_email');
      }
      navigation.replace('AdminDashboard', { user: result.user });
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 5) {
        const blockTime = Date.now() + 15 * 60 * 1000;
        setBlockedUntil(blockTime);
        Alert.alert('Bloqueado', 'Demasiados intentos fallidos. Bloqueado por 15 minutos');
      } else {
        Alert.alert('Error de autenticación', 'Credenciales inválidas');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.logo}>🤠</Text>
        <Text style={styles.title}>LA CANTINA DEL CHARRO</Text>
        <Text style={styles.subtitle}>Panel de Administración</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>📧 Correo electrónico</Text>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="admin@cantinacharro.com"
            placeholderTextColor={COLORS.text.tertiary}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>🔒 Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, passwordFocused && styles.inputFocused]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.text.tertiary}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color={COLORS.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.rememberRow}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <Ionicons
            name={rememberMe ? 'checkbox' : 'square-outline'}
            size={24}
            color={rememberMe ? COLORS.accent.gold : COLORS.text.tertiary}
          />
          <Text style={styles.rememberText}>Recordarme</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background.primary} />
          ) : (
            <Text style={styles.loginButtonText}>Iniciar Sesión como Admin</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.warning}>Solo personal autorizado</Text>
      </View>

      <Text style={styles.footer}>Versión 1.0 - Developed with ❤️ by Nicolás</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  formCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 24,
    padding: 48,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
    shadowColor: COLORS.accent.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  input: {
    height: 56,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: COLORS.accent.gold,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 56,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  loginButton: {
    height: 56,
    backgroundColor: COLORS.accent.gold,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  warning: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    cursor: 'pointer',
  },
  rememberText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  footer: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xl,
  },
});
