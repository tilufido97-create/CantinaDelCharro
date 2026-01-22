import notificationService from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INACTIVITY_THRESHOLDS = {
  REMINDER_1: 3 * 24 * 60 * 60 * 1000,
  REMINDER_2: 7 * 24 * 60 * 60 * 1000,
  REMINDER_3: 14 * 24 * 60 * 60 * 1000
};

const BOLIVIAN_HOLIDAYS = [
  { name: 'Carnaval', date: '2025-02-19' },
  { name: 'Viernes Santo', date: '2025-04-04' },
  { name: 'Día del Trabajo', date: '2025-05-01' },
  { name: 'Año Nuevo Andino', date: '2025-06-21' },
  { name: 'Independencia', date: '2025-08-06' },
  { name: 'Todos los Santos', date: '2025-11-02' },
  { name: 'Navidad', date: '2025-12-25' }
];

const STORAGE_KEYS = {
  LAST_ACTIVITY: 'last_activity_date',
  INACTIVITY_SCHEDULED: 'inactivity_notifications_scheduled',
  DAILY_REMINDERS_SCHEDULED: 'daily_reminders_scheduled'
};

export const scheduleWelcomeNotifications = async (userName) => {
  try {
    const prefs = await notificationService.getNotificationPreferences();
    if (!prefs.charro) return;

    await notificationService.scheduleCharroMessage(`¡Bienvenido ${userName}! 🎉`, 0);
    await notificationService.scheduleCharroMessage('Explora El Charro Bartender 🤠', 60);
    await notificationService.scheduleGameInvite('Ruleta Rusa', 24 * 60);
  } catch (error) {
    console.error('Error programando notificaciones de bienvenida:', error);
  }
};

export const scheduleHappyHourReminder = async () => {
  try {
    const prefs = await notificationService.getNotificationPreferences();
    if (!prefs.dailyReminders) return;

    const scheduled = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDERS_SCHEDULED);
    if (scheduled) return;

    await notificationService.scheduleDailyReminder(18, 0);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_REMINDERS_SCHEDULED, 'true');
  } catch (error) {
    console.error('Error programando Happy Hour:', error);
  }
};

export const scheduleFreeSpinReminder = async () => {
  try {
    const prefs = await notificationService.getNotificationPreferences();
    if (!prefs.dailyReminders) return;

    await notificationService.scheduleDailyReminder(12, 0);
  } catch (error) {
    console.error('Error programando Free Spin:', error);
  }
};

export const scheduleInactivityNotifications = async (lastActivityDate) => {
  try {
    const prefs = await notificationService.getNotificationPreferences();
    if (!prefs.promotions) return;

    const now = Date.now();
    const lastActivity = new Date(lastActivityDate).getTime();
    const timeSinceActivity = now - lastActivity;

    if (timeSinceActivity >= INACTIVITY_THRESHOLDS.REMINDER_1) {
      await notificationService.scheduleCharroMessage('Te extrañamos 😢', 0);
    }

    if (timeSinceActivity >= INACTIVITY_THRESHOLDS.REMINDER_2) {
      await notificationService.scheduleCharroMessage('Vuelve y recibe 100 monedas 🪙', 0);
    }

    if (timeSinceActivity >= INACTIVITY_THRESHOLDS.REMINDER_3) {
      await notificationService.schedulePromoNotification('¡Oferta especial!', '30% de descuento en tu próximo pedido', 0);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  } catch (error) {
    console.error('Error programando notificaciones de inactividad:', error);
  }
};

export const scheduleOrderFollowUp = async (orderId, estimatedDeliveryTime) => {
  try {
    const prefs = await notificationService.getNotificationPreferences();
    if (!prefs.orders) return;

    await notificationService.scheduleCharroMessage('¿Qué tal tu pedido? Califícanos ⭐', estimatedDeliveryTime + 30);
    await notificationService.scheduleCharroMessage('¿Quieres repetir tu pedido? 🔁', estimatedDeliveryTime + 24 * 60);
  } catch (error) {
    console.error('Error programando seguimiento de pedido:', error);
  }
};

export const scheduleLevelUpCelebration = async (newLevel, userName) => {
  try {
    const prefs = await notificationService.getNotificationPreferences();
    if (!prefs.charro) return;

    await notificationService.scheduleCharroMessage(
      `¡Nivel ${newLevel} alcanzado! 🎊 Felicidades ${userName}, desbloqueaste nuevas recompensas`,
      0
    );
  } catch (error) {
    console.error('Error programando celebración de nivel:', error);
  }
};

export const schedulePointsReminder = async (pointsToExpire, expirationDate) => {
  try {
    const prefs = await notificationService.getNotificationPreferences();
    if (!prefs.promotions) return;

    const now = Date.now();
    const expiration = new Date(expirationDate).getTime();
    const daysUntilExpiration = Math.floor((expiration - now) / (24 * 60 * 60 * 1000));

    if (daysUntilExpiration === 7) {
      await notificationService.scheduleCharroMessage(`Tus ${pointsToExpire} puntos expiran en 7 días`, 0);
    }

    if (daysUntilExpiration === 1) {
      await notificationService.scheduleCharroMessage('¡Último día para canjear tus puntos!', 0);
    }
  } catch (error) {
    console.error('Error programando recordatorio de puntos:', error);
  }
};

export const scheduleEventNotifications = async (eventName, eventDate) => {
  try {
    const prefs = await notificationService.getNotificationPreferences();
    if (!prefs.promotions) return;

    const now = Date.now();
    const event = new Date(eventDate).getTime();
    const daysUntilEvent = Math.floor((event - now) / (24 * 60 * 60 * 1000));

    if (daysUntilEvent === 7) {
      await notificationService.schedulePromoNotification(
        `Prepárate para ${eventName}`,
        'Pedidos especiales disponibles',
        0
      );
    }

    if (daysUntilEvent === 1) {
      await notificationService.schedulePromoNotification(
        `Mañana es ${eventName}`,
        'Pedidos 24/7 disponibles',
        0
      );
    }

    if (daysUntilEvent === 0) {
      await notificationService.schedulePromoNotification(
        `¡Feliz ${eventName}! 🎉`,
        'Ofertas especiales hoy',
        0
      );
    }
  } catch (error) {
    console.error('Error programando notificaciones de evento:', error);
  }
};

export const checkAndScheduleMissedNotifications = async () => {
  try {
    const lastActivity = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
    
    if (lastActivity) {
      await scheduleInactivityNotifications(parseInt(lastActivity));
    }

    const dailyScheduled = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDERS_SCHEDULED);
    if (!dailyScheduled) {
      await scheduleHappyHourReminder();
      await scheduleFreeSpinReminder();
    }

    const today = new Date();
    BOLIVIAN_HOLIDAYS.forEach(holiday => {
      const holidayDate = new Date(holiday.date);
      const daysUntil = Math.floor((holidayDate - today) / (24 * 60 * 60 * 1000));
      
      if (daysUntil >= 0 && daysUntil <= 7) {
        scheduleEventNotifications(holiday.name, holiday.date);
      }
    });

    await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  } catch (error) {
    console.error('Error verificando notificaciones perdidas:', error);
  }
};

export const cancelAllUserNotifications = async () => {
  try {
    await notificationService.cancelAllNotifications();
    await AsyncStorage.removeItem(STORAGE_KEYS.INACTIVITY_SCHEDULED);
    await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_REMINDERS_SCHEDULED);
  } catch (error) {
    console.error('Error cancelando notificaciones del usuario:', error);
  }
};
