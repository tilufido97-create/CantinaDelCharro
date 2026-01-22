import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATION_TYPES = {
  ORDER_PREPARING: 'order_preparing',
  ORDER_ON_WAY: 'order_on_way',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_RATING: 'order_rating',
  PROMOTION: 'promotion',
  GAME_INVITE: 'game_invite',
  CHARRO_MESSAGE: 'charro_message',
  DAILY_REMINDER: 'daily_reminder',
  POINTS_EARNED: 'points_earned',
  LEVEL_UP: 'level_up'
};

const requestPermissions = async () => {
  try {
    if (Platform.OS === 'web') {
      console.log('Notificaciones no disponibles en web');
      return { granted: false, token: null };
    }

    if (!Device.isDevice) {
      console.log('Notificaciones solo funcionan en dispositivos físicos');
      return { granted: false, token: null };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { granted: false, token: null };
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem('notification_token', token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFB800',
      });
    }

    return { granted: true, token };
  } catch (error) {
    console.error('Error solicitando permisos:', error);
    return { granted: false, token: null };
  }
};

const scheduleOrderNotification = async (orderId, orderNumber, estimatedTime) => {
  try {
    const prefs = await getNotificationPreferences();
    if (!prefs.orders) return;

    // Notificación "En camino" a 15 minutos
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚚 Tu pedido está en camino',
        body: `Pedido ${orderNumber} llegará pronto`,
        data: { orderId, type: NOTIFICATION_TYPES.ORDER_ON_WAY },
        sound: prefs.sound,
      },
      trigger: { seconds: 15 * 60 },
    });

    // Notificación "Entregado" al tiempo estimado
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Pedido entregado',
        body: `Tu pedido ${orderNumber} ha sido entregado`,
        data: { orderId, type: NOTIFICATION_TYPES.ORDER_DELIVERED },
        sound: prefs.sound,
      },
      trigger: { seconds: estimatedTime * 60 },
    });

    // Notificación "Califica" 30 min después
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⭐ ¿Cómo estuvo tu pedido?',
        body: 'Califica tu experiencia y gana 50 puntos',
        data: { orderId, type: NOTIFICATION_TYPES.ORDER_RATING },
        sound: prefs.sound,
      },
      trigger: { seconds: (estimatedTime + 30) * 60 },
    });
  } catch (error) {
    console.error('Error programando notificaciones de pedido:', error);
  }
};

const schedulePromoNotification = async (title, body, triggerMinutes) => {
  try {
    const prefs = await getNotificationPreferences();
    if (!prefs.promotions) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎁 ${title}`,
        body: body.substring(0, 100),
        data: { type: NOTIFICATION_TYPES.PROMOTION },
        sound: prefs.sound,
      },
      trigger: { seconds: triggerMinutes * 60 },
    });
  } catch (error) {
    console.error('Error programando notificación de promo:', error);
  }
};

const scheduleGameInvite = async (gameName, triggerMinutes) => {
  try {
    const prefs = await getNotificationPreferences();
    if (!prefs.games) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎮 ¡El Charro te reta!',
        body: `Ven a jugar ${gameName} y gana monedas`,
        data: { type: NOTIFICATION_TYPES.GAME_INVITE, game: gameName },
        sound: prefs.sound,
      },
      trigger: { seconds: triggerMinutes * 60 },
    });
  } catch (error) {
    console.error('Error programando invitación de juego:', error);
  }
};

const scheduleCharroMessage = async (message, triggerMinutes) => {
  try {
    const prefs = await getNotificationPreferences();
    if (!prefs.charro) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🤠 El Charro dice...',
        body: message.substring(0, 100),
        data: { type: NOTIFICATION_TYPES.CHARRO_MESSAGE },
        sound: prefs.sound,
      },
      trigger: { seconds: triggerMinutes * 60 },
    });
  } catch (error) {
    console.error('Error programando mensaje del Charro:', error);
  }
};

const scheduleDailyReminder = async (hour, minute) => {
  try {
    const prefs = await getNotificationPreferences();
    if (!prefs.dailyReminders) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: hour === 18 ? '🍺 Happy Hour' : '🎰 Gira gratis',
        body: hour === 18 ? '2x1 en cervezas seleccionadas' : 'Tu gira diaria te espera',
        data: { type: NOTIFICATION_TYPES.DAILY_REMINDER },
        sound: prefs.sound,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  } catch (error) {
    console.error('Error programando recordatorio diario:', error);
  }
};

const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error cancelando notificación:', error);
  }
};

const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelando todas las notificaciones:', error);
  }
};

const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error obteniendo notificaciones programadas:', error);
    return [];
  }
};

const saveNotificationPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem('notification_preferences', JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error guardando preferencias:', error);
    return false;
  }
};

const getNotificationPreferences = async () => {
  try {
    const data = await AsyncStorage.getItem('notification_preferences');
    if (data) {
      return JSON.parse(data);
    }
    return {
      orders: true,
      promotions: true,
      games: true,
      charro: true,
      dailyReminders: true,
      sound: true,
      vibration: true,
    };
  } catch (error) {
    console.error('Error cargando preferencias:', error);
    return {
      orders: true,
      promotions: true,
      games: true,
      charro: true,
      dailyReminders: true,
      sound: true,
      vibration: true,
    };
  }
};

export default {
  NOTIFICATION_TYPES,
  requestPermissions,
  scheduleOrderNotification,
  schedulePromoNotification,
  scheduleGameInvite,
  scheduleCharroMessage,
  scheduleDailyReminder,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
  saveNotificationPreferences,
  getNotificationPreferences,
};
