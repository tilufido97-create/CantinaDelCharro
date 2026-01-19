import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import notificationService from './src/services/notificationService';
import { checkAndScheduleMissedNotifications } from './src/utils/notificationScheduler';

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
  useEffect(() => {
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
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}
