import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { authService } from '../services/authService';
import { seedUsersDB, getDefaultUsers } from '../services/seedersDB';
import { getRoleInfo } from '../config/roles';
import { logger } from '../utils/logger';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [defaultUsers, setDefaultUsers] = useState([]);

  useEffect(() => {
    logger.info('APP', 'LoginScreen iniciada');
    setDefaultUsers(getDefaultUsers());
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      logger.warning('AUTH', 'Intento de login con campos vacíos');
      return;
    }

    logger.info('AUTH', `Iniciando proceso de login para: ${email}`);
    setLoading(true);

    const result = await authService.login(email, password);
    
    if (result.success) {
      const roleInfo = getRoleInfo(result.userData?.role);
      
      Alert.alert(
        '🎉 ¡Bienvenido!', 
        `Hola ${result.userData?.name || 'Usuario'}!\n\n` +
        `${roleInfo.icon} Rol: ${roleInfo.name}\n` +
        `📧 Email: ${result.user.email}\n` +
        `🕐 Último acceso: ${result.userData?.lastLogin ? new Date(result.userData.lastLogin).toLocaleString() : 'Primera vez'}`
      );
    } else {
      Alert.alert('❌ Error de Acceso', result.error);
    }
    
    setLoading(false);
  };

  const handleSeedUsers = async () => {
    logger.info('SEEDER', 'Iniciando seeder desde UI (solo DB)');
    setLoading(true);
    
    try {
      const result = await seedUsersDB();
      
      Alert.alert(
        '🌱 Seeder Completado', 
        `Proceso finalizado:\n\n` +
        `✅ Creados: ${result.created}\n` +
        `⚠️ Ya existían: ${result.existing}\n` +
        `❌ Errores: ${result.errors}\n\n` +
        `Total procesados: ${result.total} usuarios`
      );
    } catch (error) {
      logger.error('SEEDER', 'Error ejecutando seeder desde UI', { error: error.message });
      Alert.alert('❌ Error', 'Error ejecutando seeder');
    }
    
    setLoading(false);
  };

  const fillUserCredentials = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    const roleInfo = getRoleInfo(user.userData.role);
    logger.info('UI', `Credenciales llenadas para: ${roleInfo.name}`, {
      email: user.email,
      role: user.userData.role
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>🍺 La Cantina del Charro</Text>
      <Text style={styles.subtitle}>Tequila hasta los huesos 💀</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, styles.loginButton]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '🔄 Iniciando...' : '🚀 Iniciar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.testUsersContainer}>
        <Text style={styles.sectionTitle}>👥 Usuarios de Prueba</Text>
        
        {defaultUsers.map((user, index) => {
          const roleInfo = getRoleInfo(user.userData.role);
          return (
            <TouchableOpacity 
              key={index}
              style={[styles.userButton, { borderColor: roleInfo.color }]} 
              onPress={() => fillUserCredentials(user)}
              disabled={loading}
            >
              <View style={styles.userButtonContent}>
                <Text style={styles.userButtonIcon}>{roleInfo.icon}</Text>
                <View style={styles.userButtonInfo}>
                  <Text style={styles.userButtonRole}>{roleInfo.name}</Text>
                  <Text style={styles.userButtonName}>{user.userData.name}</Text>
                  <Text style={styles.userButtonEmail}>{user.email}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <TouchableOpacity 
        style={[styles.button, styles.seederButton]} 
        onPress={handleSeedUsers}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '🔄 Procesando...' : '🌱 Crear Usuarios de Prueba'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 Presiona "Crear Usuarios de Prueba" primero si es la primera vez
        </Text>
        <Text style={styles.infoText}>
          🔍 Revisa la consola para ver los logs detallados
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFB800',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#FFB800',
  },
  seederButton: {
    backgroundColor: '#28a745',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testUsersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFB800',
    marginBottom: 15,
    textAlign: 'center',
  },
  userButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
  },
  userButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userButtonIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  userButtonInfo: {
    flex: 1,
  },
  userButtonRole: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFB800',
  },
  userButtonName: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  userButtonEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 5,
  },
});