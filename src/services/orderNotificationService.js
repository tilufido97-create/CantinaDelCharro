import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurar cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ============================================
// NOTIFICACIONES DE PEDIDOS
// ============================================

export const sendOrderStatusNotification = async (status, orderData) => {
  if (Platform.OS === 'web') {
    console.log('Notificaciones no disponibles en web');
    return;
  }

  const notifications = {
    preparando: {
      title: '🔥 ¡Tu pedido está en marcha, compa!',
      body: `El Charro ya está preparando tu pedido #${orderData.orderNumber}. ¡Pronto estará listo!`,
      data: { orderId: orderData.orderId, status: 'preparando' },
    },
    listo_pickup: {
      title: '✅ ¡Tu pedido está listo, amigo!',
      body: `Tu pedido #${orderData.orderNumber} te espera en La Cantina. ¡Pasa a recogerlo cuando quieras! 🤠`,
      data: { orderId: orderData.orderId, status: 'listo_pickup' },
    },
    listo_delivery: {
      title: '🚚 ¡Tu delivery está por salir!',
      body: `Tu pedido #${orderData.orderNumber} está listo. El delivery saldrá pronto hacia tu ubicación.`,
      data: { orderId: orderData.orderId, status: 'listo_delivery' },
    },
    en_camino: {
      title: '🏍️ ¡Tu pedido va en camino!',
      body: `${orderData.deliveryName || 'Tu delivery'} está en camino con tu pedido #${orderData.orderNumber}. ¡Prepara el vaso! 🍺`,
      data: { orderId: orderData.orderId, status: 'en_camino' },
    },
    entregado: {
      title: '🎉 ¡Pedido entregado!',
      body: `Tu pedido #${orderData.orderNumber} ha sido entregado. ¡Salud y que lo disfrutes! 🍻`,
      data: { orderId: orderData.orderId, status: 'entregado' },
    },
  };

  const notification = notifications[status];
  if (!notification) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
      },
      trigger: null, // Enviar inmediatamente
    });

    console.log('✅ Notificación enviada:', status);
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
  }
};

// ============================================
// LISTENER DE CAMBIOS DE ESTADO
// ============================================

export const subscribeToOrderStatusChanges = (orderId, callback) => {
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    const { orderId: notifOrderId, status } = notification.request.content.data;
    
    if (notifOrderId === orderId) {
      callback(status);
    }
  });

  return () => subscription.remove();
};

// ============================================
// PERMISOS
// ============================================

export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') {
    return { granted: false };
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('⚠️ Permisos de notificación denegados');
      return { granted: false };
    }

    // Obtener token de notificación
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem('push_token', token);

    console.log('✅ Permisos de notificación concedidos');
    return { granted: true, token };
  } catch (error) {
    console.error('❌ Error solicitando permisos:', error);
    return { granted: false };
  }
};

// ============================================
// NOTIFICACIONES PERSONALIZADAS
// ============================================

export const sendCustomNotification = async (title, body, data = {}) => {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
  }
};

export default {
  sendOrderStatusNotification,
  subscribeToOrderStatusChanges,
  requestNotificationPermissions,
  sendCustomNotification,
};
