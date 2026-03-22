import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Asset } from 'expo-asset';
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

  useEffect(() => {
    const preloadCards = async () => {
      try {
        const cardImages = [
          // Spades
          require('./assets/Cartas/2_spades.png'),
          require('./assets/Cartas/3_spades.png'),
          require('./assets/Cartas/4_spades.png'),
          require('./assets/Cartas/5_spades.png'),
          require('./assets/Cartas/6_spades.png'),
          require('./assets/Cartas/7_spades.png'),
          require('./assets/Cartas/8_spades.png'),
          require('./assets/Cartas/9_spades.png'),
          require('./assets/Cartas/10_spades.png'),
          require('./assets/Cartas/j_spades.png'),
          require('./assets/Cartas/q_spades.png'),
          require('./assets/Cartas/k_spades.png'),
          require('./assets/Cartas/A_spades.png'),
          // Hearts
          require('./assets/Cartas/2_hearts.png'),
          require('./assets/Cartas/j_hearts.png'),
          require('./assets/Cartas/q_hearts.png'),
          require('./assets/Cartas/k_hearts.png'),
          require('./assets/Cartas/a_hearts.png'),
          // Diamonds
          require('./assets/Cartas/a_diamonds.png'),
          // Clubs
          require('./assets/Cartas/a_clubs.png'),
          // Reverso
          require('./assets/Cartas/CartaR.png'),
        ];
        await Asset.loadAsync(cardImages);
        console.log('✅ Cartas precargadas');
      } catch(e) {
        console.log('⚠️ Error precargando cartas:', e.message);
      }
    };
    preloadCards();
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
