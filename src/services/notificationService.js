// Servicio de notificaciones deshabilitado para Expo Go
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
  console.log('Notificaciones deshabilitadas en Expo Go');
  return { granted: false, token: null };
};

const scheduleOrderNotification = async () => {
  console.log('Notificación de pedido omitida');
};

const schedulePromoNotification = async () => {
  console.log('Notificación de promo omitida');
};

const scheduleGameInvite = async () => {
  console.log('Invitación de juego omitida');
};

const scheduleCharroMessage = async () => {
  console.log('Mensaje del Charro omitido');
};

const scheduleDailyReminder = async () => {
  console.log('Recordatorio diario omitido');
};

const cancelNotification = async () => {
  console.log('Cancelación de notificación omitida');
};

const cancelAllNotifications = async () => {
  console.log('Cancelación de todas las notificaciones omitida');
};

const getScheduledNotifications = async () => {
  return [];
};

const saveNotificationPreferences = async (preferences) => {
  return true;
};

const getNotificationPreferences = async () => {
  return {
    orders: false,
    promotions: false,
    games: false,
    charro: false,
    dailyReminders: false,
    sound: false,
    vibration: false,
  };
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
