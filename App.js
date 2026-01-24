import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import notificationService from './src/services/notificationService';
import { checkAndScheduleMissedNotifications } from './src/utils/notificationScheduler';
import { useAutoMigration } from './src/hooks/useAutoMigration';
import { logger } from './src/utils/logger';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export default function App() {
  const migrationStatus = useAutoMigration();

  useEffect(() => {
    logger.info('APP', 'Aplicación iniciada - La Cantina del Charro');
    
    if (Platform.OS === 'web') {
      console.log('🌐 Running on web - notifications disabled');
      return;
    }

    const initializeNotifications = async () => {
      try {
        const { granted } = await notificationService.requestPermissions();
        if (granted) {
          console.log('✅ Notificaciones habilitadas');
          await checkAndScheduleMissedNotifications();
        }
      } catch (error) {
        console.error('Error inicializando notificaciones:', error);
      }
    };

    initializeNotifications();

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notificación recibida:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuario tocó notificación:', response);
    });

    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  // Mostrar pantalla de carga durante migración
  if (migrationStatus.isRunning) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <Text style={{ color: '#FFB800', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          🍺 La Cantina del Charro
        </Text>
        <ActivityIndicator size="large" color="#FFB800" />
        <Text style={{ color: '#FFFFFF', marginTop: 20, textAlign: 'center' }}>
          🔄 Configurando base de datos...{"\n"}Por favor espera
        </Text>
      </View>
    );
  }

  // Mostrar error si la migración falló
  if (migrationStatus.hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A', padding: 20 }}>
        <Text style={{ color: '#FFB800', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          🍺 La Cantina del Charro
        </Text>
        <Text style={{ color: '#FF6B6B', fontSize: 18, marginBottom: 10 }}>❌ Error de Configuración</Text>
        <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
          {migrationStatus.error}
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}
