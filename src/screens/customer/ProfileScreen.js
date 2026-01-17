import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert(
      '¿Cerrar sesión?',
      'Tendrás que volver a iniciar sesión',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authCompleted');
              await AsyncStorage.removeItem('userProfile');
              console.log('🚪 Sesión cerrada - RootNavigator detectará el cambio');
            } catch (error) {
              console.error('❌ Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>👤 Perfil</Text>
        <Text style={styles.subtitle}>Pantalla en construcción</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="🚪 Cerrar Sesión (DEBUG)"
            variant="outline"
            onPress={handleLogout}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
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
    marginBottom: SPACING.xxl,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: SPACING.xl,
  },
});
