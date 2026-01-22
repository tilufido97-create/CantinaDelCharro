import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import AdminNavigator from '../admin/navigation/AdminNavigator';
import VideoLoadingScreen from '../components/common/VideoLoadingScreen';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVideoLoading, setShowVideoLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAuth();
      }
    });

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
      if (Platform.OS === 'web') {
        const adminData = await AsyncStorage.getItem('admin_user');
        if (adminData) {
          setIsAdmin(true);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      }
      
      const authCompleted = await AsyncStorage.getItem('authCompleted');
      setIsAuthenticated(authCompleted === 'true');
      setIsAdmin(false);
    } catch (error) {
      console.error('❌ Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoLoadingComplete = () => {
    setShowVideoLoading(false);
  };

  // Mostrar video de carga al inicio
  if (showVideoLoading) {
    return <VideoLoadingScreen onComplete={handleVideoLoadingComplete} />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return <AdminNavigator />;
  }

  return isAuthenticated ? <CustomerNavigator /> : <AuthNavigator />;
}
