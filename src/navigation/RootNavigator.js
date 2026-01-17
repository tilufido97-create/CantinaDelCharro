import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    // Escuchar cambios en el estado de la app
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAuth();
      }
    });

    // Revisar auth cada 1 segundo (para detectar logout)
    const interval = setInterval(() => {
      checkAuth();
    }, 1000);

    return () => {
      subscription?.remove();
      clearInterval(interval);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const authCompleted = await AsyncStorage.getItem('authCompleted');
      console.log('🔍 Checking auth:', authCompleted);
      setIsAuthenticated(authCompleted === 'true');
    } catch (error) {
      console.error('❌ Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg.primary }}>
        <ActivityIndicator size="large" color={COLORS.accent.gold} />
      </View>
    );
  }

  return isAuthenticated ? <CustomerNavigator /> : <AuthNavigator />;
}
