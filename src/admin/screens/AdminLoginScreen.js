import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { loginAdmin } from '../utils/adminAuth';
import { initializeMockAdmins } from '../constants/mockDataAdmin';
import { seedUsersDB, getDefaultUsers } from '../../services/seedersDB';
import { getRoleInfo, ROLES } from '../../config/roles';
import { logger } from '../../utils/logger';

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
  const [defaultUsers, setDefaultUsers] = useState([]);

  useEffect(() => {
    console.log("🌐 ADMIN LOGIN SCREEN - Iniciada");
    logger.info('ADMIN_LOGIN_SCREEN', 'Pantalla de admin login iniciada');
    initializeMockAdmins(AsyncStorage);
    loadRememberedEmail();
    setDefaultUsers(getDefaultUsers());
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
      console.log(`⏰ CUENTA BLOQUEADA - ${remaining} minutos restantes`);
      Alert.alert('Bloqueado', `Demasiados intentos. Intenta en ${remaining} minutos`);
      return;
    }

    if (!email || !password) {
      console.log("⚠️ CAMPOS VACÍOS - Email o contraseña faltante");
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      console.log("⚠️ EMAIL INVÁLIDO - Formato incorrecto");
      Alert.alert('Error', 'Ingresa un correo válido');
      return;
    }

    console.log("🚀 ==================================");
    console.log("🚀 INICIANDO PROCESO DE LOGIN ADMIN");
    console.log("🚀 ==================================");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password length: ${password.length} caracteres`);
    console.log(`🕰 Timestamp: ${new Date().toISOString()}`);
    
    logger.info('ADMIN_LOGIN_SCREEN', `Intento de login admin: ${email}`);
    setLoading(true);
    
    const result = await loginAdmin(email.trim(), password);
    setLoading(false);

    if (result.success) {
      console.log("✅ ==================================");
      console.log("✅ LOGIN ADMIN EXITOSO");
      console.log("✅ ==================================");
      console.log("👤 Datos del usuario:", {
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        permissions: result.user.permissions?.length || 0
      });
      console.log("🎯 Navegando a AdminDashboard...");
      
      setLoginAttempts(0);
      
      if (rememberMe) {
        await AsyncStorage.setItem('remembered_admin_email', email);
        console.log("💾 Email guardado para recordar");
      } else {
        await AsyncStorage.removeItem('remembered_admin_email');
        console.log("🗑️ Email eliminado de recordar");
      }
      
      logger.success('ADMIN_LOGIN_SCREEN', 'Navegando a dashboard admin', {
        email: result.user.email,
        role: result.user.role
      });
      
      // Navegar al dashboard
      console.log("📍 EJECUTANDO NAVEGACIÓN...");
      navigation.replace('AdminDashboard', { user: result.user });
      console.log("✅ NAVEGACIÓN EJECUTADA");
      
    } else {
      console.log("❌ ==================================");
      console.log("❌ LOGIN ADMIN FALLIDO");
      console.log("❌ ==================================");
      console.log(`💥 Error: ${result.error}`);
      console.log(`🔢 Intento número: ${loginAttempts + 1}`);
      
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        const blockTime = Date.now() + 15 * 60 * 1000;
        setBlockedUntil(blockTime);
        console.log("🚫 CUENTA BLOQUEADA POR 15 MINUTOS");
        Alert.alert('Bloqueado', 'Demasiados intentos fallidos. Bloqueado por 15 minutos');
      } else {
        console.log(`⚠️ Intentos restantes: ${5 - newAttempts}`);
        Alert.alert('Error de autenticación', result.error || 'Credenciales inválidas');
      }
      
      logger.error('ADMIN_LOGIN_SCREEN', 'Login admin fallido', {
        email,
        error: result.error,
        attempts: newAttempts
      });
    }
  };

  const handleSeedUsers = async () => {
    console.log("🌱 ADMIN - Ejecutando seeder...");
    setLoading(true);
    
    try {
      const result = await seedUsersDB();
      console.log("✅ ADMIN SEEDER COMPLETADO:", result);
      
      Alert.alert(
        '🌱 Base de Datos Inicializada', 
        `Usuarios administrativos procesados:\n\n` +
        `✅ Creados: ${result.created}\n` +
        `🔄 Actualizados: ${result.updated}\n` +
        `❌ Errores: ${result.errors}\n\n` +
        `Ahora puedes usar los botones de acceso rápido`
      );
    } catch (error) {
      console.error("❌ ERROR EN ADMIN SEEDER:", error);
      Alert.alert('❌ Error', 'Error inicializando base de datos');
    }
    
    setLoading(false);
  };

  const fillUserCredentials = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    const roleInfo = getRoleInfo(user.userData.role);
    console.log(`📝 Credenciales llenadas: ${roleInfo.name}`);
    logger.info('ADMIN_LOGIN_SCREEN', `Credenciales llenadas para: ${roleInfo.name}`);
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      style={{ flex: 1, backgroundColor: COLORS.background.primary }}
      showsVerticalScrollIndicator={true}
    >
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

        {/* Sección de Acceso Rápido */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.quickAccessTitle}>⚡ Acceso Rápido</Text>
          
          <View style={styles.quickButtonsGrid}>
            {defaultUsers
              .filter(user => [ROLES.ADMIN, ROLES.REPARTIDOR, ROLES.REPONEDOR].includes(user.userData.role))
              .map((user, index) => {
                const roleInfo = getRoleInfo(user.userData.role);
                return (
                  <TouchableOpacity 
                    key={index}
                    style={[styles.quickButton, { borderColor: roleInfo.color }]}
                    onPress={() => fillUserCredentials(user)}
                    disabled={loading}
                  >
                    <Text style={styles.quickButtonIcon}>{roleInfo.icon}</Text>
                    <Text style={styles.quickButtonRole}>{roleInfo.name}</Text>
                    <Text style={styles.quickButtonName}>{user.userData.name}</Text>
                  </TouchableOpacity>
                );
              })
            }
          </View>
          
          <TouchableOpacity 
            style={styles.seederButton}
            onPress={handleSeedUsers}
            disabled={loading}
          >
            <Text style={styles.seederButtonText}>
              {loading ? '🔄 Inicializando...' : '🌱 Inicializar Base de Datos'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.warning}>Solo personal autorizado</Text>
      </View>

      <Text style={styles.footer}>Versión 1.0 - Developed with ❤️ by Nicolás</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  formCard: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
    shadowColor: COLORS.accent.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  logo: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  input: {
    height: 48,
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
    height: 48,
    backgroundColor: COLORS.accent.gold,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  quickAccessSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background.tertiary,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent.gold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  quickButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  quickButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  quickButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickButtonRole: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent.gold,
    marginBottom: 4,
  },
  quickButtonName: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  seederButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  seederButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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